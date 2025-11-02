const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage } = require("@langchain/core/messages");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { StateGraph } = require("@langchain/langgraph");
const { Annotation } = require("@langchain/langgraph");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const { MongoDBSaver } = require("@langchain/langgraph-checkpoint-mongodb");
const { ObjectId } = require("mongodb");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const { getMongoClient } = require("../config/database");
const ChatSession = require("../models/chatbot.model");

class AgentService {
    // Setup initial state
    constructor() {
        this.client = null;        // MongoDB connection
        this.tools = null;         // AI tools array
        this.toolNode = null;      // LangGraph tool executor
        this.model = null;         // Gemini AI model
        this.app = null;           // LangGraph workflow
        this.isInitialized = false;
    }

    async ensureInitialized() {
        // Only initialize when first needed
        if (!this.isInitialized) {
            await this.init();
        }

        // Verify critical dependency is ready
        if (!this.client) {
            throw new Error("MongoDB client not available");
        }
    }

    // Setting up the entire AI infrastructure
    async init() {
        // One-time initialization guard to prevent multiple initializations
        if (this.isInitialized) return;

        // Connect to MongoDB
        this.client = await getMongoClient();

        // Create tools with user context support
        this.tools = [
            this.createChildrenLookupTool(),
            this.createDailyReportsLookupTool(),
            this.createPaymentsLookupTool(),
            this.createUsersLookupTool(),
            this.createSemesterReportsLookupTool()
        ];

        // Allow tools to receive configurable context (data user dan context)
        this.toolNode = new ToolNode(this.tools, {
            passThroughInput: true
        });

        // Initialize AI model with tools bound
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0,    // Zero creativity, deterministic responses only
            maxRetries: 0,     // No retries on API failure
            apiKey: process.env.GOOGLE_API_KEY,
        }).bindTools(this.tools);

        // Build the agent workflow
        this.initializeWorkflow();

        this.isInitialized = true;  // prevent re-initialization
        console.log("AgentService initialized successfully");
    }

    // UTILITY METHODS

    // Current semester calculations
    getCurrentSemester() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        return month <= 6 ? `${year}-1` : `${year}-2`;
    }

    // Previous semester calculations
    getPreviousSemester() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        return month <= 6 ? `${year - 1}-2` : `${year}-1`;
    }

    // Calculates date range for database filtering (reports)
    calculateDateRange(timePeriod) {
        const now = new Date();
        const startDate = new Date();

        switch (timePeriod) {
            case 'today': case 'hari ini':
                startDate.setHours(0, 0, 0, 0);
                return { start: startDate, end: now };
            case 'yesterday': case 'kemarin':
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);
                return { start: startDate, end: endDate };
            case 'this week': case 'minggu ini':
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                return { start: startDate, end: now };
            case 'last week': case 'minggu lalu':
                startDate.setDate(now.getDate() - now.getDay() - 7);
                startDate.setHours(0, 0, 0, 0);
                const endOfLastWeek = new Date(startDate);
                endOfLastWeek.setDate(startDate.getDate() + 6);
                endOfLastWeek.setHours(23, 59, 59, 999);
                return { start: startDate, end: endOfLastWeek };
            case 'this month': case 'bulan ini':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                return { start: startDate, end: now };
            case 'last month': case 'bulan lalu':
                startDate.setMonth(now.getMonth() - 1, 1);
                startDate.setHours(0, 0, 0, 0);
                const endOfLastMonth = new Date(startDate);
                endOfLastMonth.setMonth(startDate.getMonth() + 1, 0); // 0 : last day of previous month
                endOfLastMonth.setHours(23, 59, 59, 999);
                return { start: startDate, end: endOfLastMonth };
            default:
                return null;
        }
    }

    // Calculate a weekly summary from an array of reports
    calculateWeeklySummary(reports) {
        // Check reports
        if (reports.length === 0) return null;

        // Initialize the summary object with default values
        const summary = {
            total_reports: reports.length,
            themes: new Set(),
            activities: { physical_motor: [], cognitive: [], social_emotional: [] },
            meals_summary: { snack_variety: new Set(), lunch_variety: new Set() },
            special_notes_count: 0
        };

        // Iterate through each report and update the summary
        reports.forEach(report => {
            // Add to the sets or arrays
            if (report.theme) summary.themes.add(report.theme);
            if (report.sub_theme) summary.themes.add(report.sub_theme);
            if (report.physical_motor) summary.activities.physical_motor.push(report.physical_motor);
            if (report.cognitive) summary.activities.cognitive.push(report.cognitive);
            if (report.social_emotional) summary.activities.social_emotional.push(report.social_emotional);
            if (report.meals) {
                if (report.meals.snack) summary.meals_summary.snack_variety.add(report.meals.snack);
                if (report.meals.lunch) summary.meals_summary.lunch_variety.add(report.meals.lunch);
            }
            // Count special notes
            if (report.special_notes) summary.special_notes_count++;
        });

        // Convert sets to arrays for easier manipulation
        summary.themes = Array.from(summary.themes);
        summary.meals_summary.snack_variety = Array.from(summary.meals_summary.snack_variety);
        summary.meals_summary.lunch_variety = Array.from(summary.meals_summary.lunch_variety);

        return summary;
    }

    // Calculate progress summary from a single report
    calculateProgressSummary(report) {
        const summary = {
            total_assessments: 0,
            consistent_count: 0,
            inconsistent_count: 0,
            not_observed_count: 0,
            independent_count: 0,
            needs_assistance_count: 0
        };

        // List of developmental and motor domains
        const devDomains = ['religious_moral', 'social_emotional', 'cognitive', 'language'];
        const motorDomains = ['gross_motor', 'fine_motor', 'independence', 'art'];

        // Process developmental domains
        devDomains.forEach(domain => {
            if (report[domain]) {
                // For each key-value pair in the domain, process the assessment data
                Object.entries(report[domain]).forEach(([key, value]) => {
                    if (!key.includes('keterangan') && typeof value === 'string') {
                        summary.total_assessments++;
                        if (value === 'Konsisten') summary.consistent_count++;
                        if (value === 'Belum Konsisten') summary.inconsistent_count++;
                        if (value === 'Tidak Teramati') summary.not_observed_count++;
                    }
                });
            }
        });

        // Process motor domains
        motorDomains.forEach(domain => {
            if (report[domain]) {
                // For each key-value pair in the motor domain, process the motor skill data
                Object.entries(report[domain]).forEach(([key, value]) => {
                    if (!key.includes('keterangan') && typeof value === 'string') {
                        summary.total_assessments++;
                        if (value === 'Mandiri') summary.independent_count++;
                        if (value === 'Bantuan Fisik' || value === 'Bantuan Verbal') summary.needs_assistance_count++;
                        if (value === 'Tidak Teramati') summary.not_observed_count++;
                    }
                });
            }
        });

        return summary;
    }

    // AI TOOLS DEFINITION

    // Create children lookup tool for retrieving child data associated with a user
    createChildrenLookupTool() {
        return tool(
            async (input, config) => {
                try {
                    // Get search query and limit
                    let { query, n = 10 } = input;

                    // Get the user context
                    const user = config?.configurable?.user;

                    // Check if user context available
                    if (!user) {
                        console.error("User context missing");
                        return JSON.stringify({ results: [], count: 0, error: "System error: User authentication required" });
                    }

                    // Check if user exists
                    const userId = user.userId || user._id || user.id;
                    if (!userId) {
                        throw new Error("User ID not found");
                    }

                    // Map gender terms from English to Indonesian
                    if (query) {
                        if (query.toLowerCase() === 'male' || query.toLowerCase() === 'boy') query = 'Laki-laki';
                        if (query.toLowerCase() === 'female' || query.toLowerCase() === 'girl') query = 'Perempuan';
                    }

                    // Access the database and collection for children data
                    const database = this.client.database();
                    const collection = database.collection("children");

                    // Filter to find children based on the parent_id
                    let filter = { parent_id: new ObjectId(userId) };

                    // If a query is provided, add search filters
                    if (query && query.trim() !== '') {
                        filter.$or = [
                            { name: { $regex: query, $options: 'i' } },
                            { medical_notes: { $regex: query, $options: 'i' } },
                            { gender: { $regex: query, $options: 'i' } }
                        ];
                    }

                    // Fetch the results from the database
                    const results = await collection.find(filter).limit(n).toArray();

                    return JSON.stringify({ results: results, count: results.length, collection: "children" });
                } catch (error) {
                    console.error("Error in children lookup:", error);
                    return JSON.stringify({ error: "Failed to search children data", details: error.message });
                }
            },
            {
                // Tool configuration
                name: "children_lookup",
                description: "Search for children information - PARENT ONLY. Gender values: 'Laki-laki', 'Perempuan'",
                schema: z.object({  // defines the input validation schema
                    query: z.string().optional().describe("Search query for children data (optional). For gender search use: 'Laki-laki', 'Perempuan'"),
                    n: z.number().optional().default(10)   // control the number of results returned
                }),
            }
        );
    }

    // Create the daily reports lookup tool for retrieving daily reports associated with a user's children
    createDailyReportsLookupTool() {
        return tool(
            async (input, config) => {
                try {
                    // Get from user input
                    const { query, date, time_period, child_name, n = 20 } = input;

                    // Get the user context
                    const user = config?.configurable?.user;

                    // Check if user context is available
                    if (!user) {
                        console.error("User context missing in daily reports lookup tool");
                        return JSON.stringify({ results: [], count: 0, error: "System error: User authentication required" });
                    }

                    // Get the user ID and check if valid
                    const userId = user.userId || user._id || user.id;
                    if (!userId) {
                        throw new Error("User ID not found in user object");
                    }

                    // Access the database and collection
                    const database = this.client.database();
                    const collection = database.collection("dailyreports");

                    // Get parent's children first and check
                    const myChildren = await database.collection("children").find({ parent_id: new ObjectId(userId) }).toArray();
                    if (myChildren.length === 0) {
                        return JSON.stringify({ results: [], count: 0, message: "No registered children" });
                    }

                    // Get the list of child IDs
                    const childIds = myChildren.map(child => child._id);
                    let filter = { child_id: { $in: childIds } };

                    // Handle filters by calculating date ranges for both specific dates and time periods
                    if (time_period) {
                        const dateRange = this.calculateDateRange(time_period);
                        if (dateRange) {
                            filter.date = {
                                $gte: dateRange.start,
                                $lte: dateRange.end
                            };
                            console.log(`Applied time period filter: ${time_period}`, dateRange);
                        }
                    } 
                    else if (date) {
                        // Use calculateDateRange to handle specific dates like 'today' and 'yesterday'
                        const dateRange = this.calculateDateRange(date);
                        if (dateRange) {
                            filter.date = {
                                $gte: dateRange.start,
                                $lte: dateRange.end
                            };
                            console.log(`Applied date filter: ${date}`, dateRange);
                        }
                    } else {
                        console.log("No date filter applied - showing ALL available reports");
                    }

                    // If a query is provided, add search filters
                    if (query && query.trim() !== '') {
                        filter.$or = [
                            { theme: { $regex: query, $options: 'i' } },
                            { sub_theme: { $regex: query, $options: 'i' } },
                            { physical_motor: { $regex: query, $options: 'i' } },
                            { cognitive: { $regex: query, $options: 'i' } },
                            { social_emotional: { $regex: query, $options: 'i' } },
                            { special_notes: { $regex: query, $options: 'i' } }
                        ];
                        console.log("Applied text search filter:", query);
                    }

                    // Filter by specific child name
                    if (child_name && child_name.trim() !== '') {
                        const specificChild = await database.collection("children")
                            .findOne({
                                parent_id: new ObjectId(userId),
                                name: { $regex: child_name, $options: 'i' }
                            });

                        // If a child is found, apply the filter
                        if (specificChild) { // only include reports associated with the specific child's ID
                            filter.child_id = specificChild._id; 
                            console.log("Applied child name filter:", child_name);
                        }
                    }

                    // Execute search with date sorting (newest first)
                    const results = await collection.find(filter).sort({ date: -1 }).limit(n).toArray();

                    // Add child names to results
                    for (let report of results) {
                        const child = await database.collection("children").findOne({ _id: report.child_id });
                        report.child_name = child ? child.name : "Unknown";
                    }

                    // Generate weekly summary if applicable
                    let weeklySummary = null;
                    if (time_period && (time_period.includes('week') || time_period.includes('minggu'))) {
                        weeklySummary = this.calculateWeeklySummary(results);
                    }

                    // Return the results
                    return JSON.stringify({
                        results: results,
                        count: results.length,
                        collection: "dailyreports",
                        search_period: time_period || date || "all"
                    });
                } catch (error) {
                    console.error("Error in daily reports lookup:", error);
                    return JSON.stringify({ error: "Failed to search daily reports", details: error.message });
                }
            },
            {
                // Tool configuration
                name: "daily_reports_lookup",
                description: "Search for daily reports by theme, activities, date, time period, or child name - PARENT ONLY. If no date specified, returns ALL available reports sorted by newest first. Time periods: 'today'/'hari ini', 'yesterday'/'kemarin', 'this week'/'minggu ini', 'last week'/'minggu lalu', 'this month'/'bulan ini', 'last month'/'bulan lalu'",
                schema: z.object({  // defines the input validation schema
                    query: z.string().optional().describe("Search in themes, activities, or notes"),
                    date: z.string().optional().describe("Specific date (YYYY-MM-DD) or 'today'/'hari ini', 'yesterday'/'kemarin'"),
                    time_period: z.string().optional().describe("Time period: 'this week'/'minggu ini', 'last week'/'minggu lalu', 'this month'/'bulan ini', 'last month'/'bulan lalu'"),
                    child_name: z.string().optional().describe("Filter by specific child name"),
                    n: z.number().optional().default(20)  // control the number of results returned
                }),
            }
        );
    }

    // Create the semester reports lookup tool for retrieving semester reports associated with a user's children
    createSemesterReportsLookupTool() {
        return tool(
            async (input, config) => {
                try {
                    // Get from user input
                    const { query, semester, child_name, n = 10 } = input;

                    // Get the user context
                    const user = config?.configurable?.user;

                    // Check if user context is available
                    if (!user) {
                        console.error("User context missing in semester reports lookup tool");
                        return JSON.stringify({ results: [], count: 0, error: "System error: User authentication required" });
                    }

                    // Get the user ID and check
                    const userId = user.userId || user._id || user.id;
                    if (!userId) {
                        throw new Error("User ID not found in user object");
                    }

                    // Access the database and collection
                    const database = this.client.database();
                    const collection = database.collection("semesterreports");

                    // Get parent's children and check
                    const myChildren = await database.collection("children").find({ parent_id: new ObjectId(userId) }).toArray();
                    if (myChildren.length === 0) {
                        return JSON.stringify({ results: [], count: 0, message: "No registered children" });
                    }

                    // Get the list of child IDs
                    const childIds = myChildren.map(child => child._id);
                    let filter = { child_id: { $in: childIds } };

                    // Semester filtering
                    if (semester === "current" || semester === "sekarang" || semester === "ini") {
                        filter.semester = this.getCurrentSemester();
                    } 
                    else if (semester === "previous" || semester === "lalu" || semester === "kemarin") {
                        filter.semester = this.getPreviousSemester();
                    } 
                    else if (semester === "latest" || semester === "terbaru" || semester === "terakhir") {
                        const latestReport = await collection.find({ child_id: { $in: childIds } }).sort({ semester: -1 }).limit(1).toArray();
                        if (latestReport.length > 0) {
                            filter.semester = latestReport[0].semester; // get newest report
                        }
                    } 
                    else if (semester) {
                        filter.semester = semester;
                    }

                    // Check if query is provided
                    if (query && query.trim() !== '') {
                        let mappedQuery = query;
                        // Map English terms to Indonesian for development values
                        if (query.toLowerCase().includes('consistent') || query.toLowerCase().includes('consisten')) mappedQuery = 'Konsisten';
                        if (query.toLowerCase().includes('inconsistent') || query.toLowerCase().includes('belum')) mappedQuery = 'Belum Konsisten';
                        if (query.toLowerCase().includes('not observed') || query.toLowerCase().includes('tidak')) mappedQuery = 'Tidak Teramati';
                        if (query.toLowerCase().includes('independent') || query.toLowerCase().includes('mandiri')) mappedQuery = 'Mandiri';
                        if (query.toLowerCase().includes('assistance') || query.toLowerCase().includes('bantuan')) mappedQuery = 'Bantuan';

                        // Search in both 'keterangan' fields and actual development values
                        filter.$or = [
                            // Search in 'keterangan' fields
                            { "religious_moral.berdoa_sebelum_kegiatan_keterangan": { $regex: mappedQuery, $options: 'i' } },
                            { "religious_moral.menirukan_sikap_berdoa_keterangan": { $regex: mappedQuery, $options: 'i' } },
                            { "social_emotional.menyebut_nama_teman_keterangan": { $regex: mappedQuery, $options: 'i' } },
                            { "social_emotional.sikap_menolong_keterangan": { $regex: mappedQuery, $options: 'i' } },
                            { "cognitive.menyebut_nama_bagian_tubuh_keterangan": { $regex: mappedQuery, $options: 'i' } },
                            { "cognitive.menyebut_nama_benda_keterangan": { $regex: mappedQuery, $options: 'i' } },
                            { "language.menyebut_nama_panggilan_keterangan": { $regex: mappedQuery, $options: 'i' } },
                            { "language.menyatakan_keinginan_keterangan": { $regex: mappedQuery, $options: 'i' } },

                            // Search for actual development value fields
                            { "religious_moral.berdoa_sebelum_kegiatan": mappedQuery },
                            { "religious_moral.menirukan_sikap_berdoa": mappedQuery },
                            { "social_emotional.menyebut_nama_teman": mappedQuery },
                            { "social_emotional.sikap_menolong": mappedQuery },
                            { "cognitive.menyebut_nama_bagian_tubuh": mappedQuery },
                            { "cognitive.menyebut_nama_benda": mappedQuery },
                            { "language.menyebut_nama_panggilan": mappedQuery },
                            { "language.menyatakan_keinginan": mappedQuery }
                        ];
                    }

                    // Filter by specific child name
                    if (child_name && child_name.trim() !== '') {
                        const specificChild = await database.collection("children")
                            .findOne({
                                parent_id: new ObjectId(userId),
                                name: { $regex: child_name, $options: 'i' }
                            });

                        // If a child is found, apply the filter
                        if (specificChild) { // only include reports associated with the specific child's ID
                            filter.child_id = specificChild._id; 
                        }
                    }

                    // Fetch results from the database with semester sorting (newest first)
                    const results = await collection.find(filter).sort({ semester: -1 }).limit(n).toArray();

                    // Enhance results with child names and progress summaries
                    for (let report of results) {
                        const child = await database.collection("children").findOne({ _id: report.child_id });
                        report.child_name = child ? child.name : "Unknown";              // add the child's name to the report
                        report.progress_summary = this.calculateProgressSummary(report); // calculate and add the progress summary for the report
                    }

                    return JSON.stringify({
                        results: results,
                        count: results.length,
                        collection: "semesterreports",
                        search_semester: semester || "all"
                    });
                } catch (error) {
                    console.error("Error in semester reports lookup:", error);
                    return JSON.stringify({ error: "Failed to search semester reports", details: error.message });
                }
            },
            {
                // Tool configuration
                name: "semester_reports_lookup",
                description: "Search for semester reports by developmental progress, semester, or child name - PARENT ONLY. Development values: 'Belum Konsisten' (inconsistent), 'Konsisten' (consistent), 'Tidak Teramati' (not observed). Motor skills: 'Bantuan Fisik' (physical assistance), 'Bantuan Verbal' (verbal assistance), 'Mandiri' (independent), 'Tidak Teramati' (not observed)",
                schema: z.object({  // defines the input validation schema
                    query: z.string().optional().describe("Search in developmental progress notes. Use Indonesian terms: 'Belum Konsisten', 'Konsisten', 'Tidak Teramati', 'Mandiri', 'Bantuan'"),
                    semester: z.string().optional().describe("Filter by semester: 'current', 'previous', 'latest', or specific like '2025-1'"),
                    child_name: z.string().optional().describe("Filter by specific child name"),
                    n: z.number().optional().default(10)  // control the number of results returned
                }),
            }
        );
    }

    // Create the payments lookup tool for retrieving payment records associated with a user's children
    createPaymentsLookupTool() {
        return tool(
            async (input, config) => {
                try {
                    // Get from user input
                    const { query, status, category, n = 10 } = input;

                    // Get the user context
                    const user = config?.configurable?.user;

                    // Check if user context is available
                    if (!user) {
                        console.error("User context missing in payments lookup tool");
                        return JSON.stringify({ results: [], count: 0, error: "System error: User authentication required" });
                    }

                    // Get the user ID and access the payments database
                    const userId = user.userId || user._id || user.id;
                    if (!userId) {
                        throw new Error("User ID not found in user object");
                    }

                    // Access the database and collection
                    const database = this.client.database();
                    const collection = database.collection("payments");

                    // Get parent's children and check
                    const myChildren = await database.collection("children").find({ parent_id: new ObjectId(userId) }).toArray();
                    if (myChildren.length === 0) {
                        return JSON.stringify({ results: [], count: 0, message: "No registered children" });
                    }

                    // Get the list of child IDs and apply filter
                    const childIds = myChildren.map(child => child._id);
                    let filter = { child_id: { $in: childIds } };

                    // Map status from English to Indonesian
                    let statusFilter = status;
                    if (status === 'pending') statusFilter = 'Tertunda';
                    if (status === 'overdue') statusFilter = 'Jatuh Tempo';
                    if (status === 'paid') statusFilter = 'Dibayar';
                    if (status === 'sent') statusFilter = 'Terkirim';
                    if (status === 'rejected') statusFilter = 'Ditolak';

                    if (statusFilter) {
                        filter.status = statusFilter;
                    }

                    // Map category from English to Indonesian
                    let categoryFilter = category;
                    if (category === 'monthly') categoryFilter = 'Bulanan';
                    if (category === 'semester') categoryFilter = 'Semester';
                    if (category === 'registration') categoryFilter = 'Registrasi';

                    if (categoryFilter) {
                        filter.category = categoryFilter;
                    }

                    // If a query is provided, add search filters to match period
                    if (query && query.trim() !== '') {
                        filter.period = { $regex: query, $options: 'i' };
                    }

                    // Fetch payment records from the database
                    const results = await collection.find(filter).sort({ due_date: 1 }).limit(n).toArray();

                    // Add child names to the payment records
                    for (let payment of results) {
                        const child = await database.collection("children").findOne({ _id: payment.child_id });
                        payment.child_name = child ? child.name : "Unknown";
                    }

                    // Return the results
                    return JSON.stringify({ results: results, count: results.length, collection: "payments" });
                } catch (error) {
                    console.error("Error in payments lookup:", error);
                    return JSON.stringify({ error: "Failed to search payment data", details: error.message });
                }
            },
            {
                // Tool configuration
                name: "payments_lookup",
                description: "Search for payment records by status, category, or period - PARENT ONLY. Status: 'Tertunda' (pending), 'Terkirim' (sent), 'Dibayar' (paid), 'Ditolak' (rejected), 'Jatuh Tempo' (overdue). Category: 'Bulanan' (monthly), 'Semester' (semester), 'Registrasi' (registration)",
                schema: z.object({  // defines the input validation schema
                    query: z.string().optional().describe("Search in period or other fields"),
                    status: z.string().optional().describe("Filter by status: Tertunda (pending), Terkirim (submitted/sent), Dibayar (paid), Ditolak (rejected), Jatuh Tempo (overdue)"),
                    category: z.string().optional().describe("Filter by category: Bulanan (monthly), Semester (semester), Registrasi (registration)"),
                    n: z.number().optional().default(10)  // control the number of results returned
                }),
            }
        );
    }

    // Create the users lookup tool for retrieving teacher contact information
    createUsersLookupTool() {
        return tool(
            async (input, config) => {
                try {
                    // Get search query and limit
                    const { query, n = 5 } = input;  

                    // Access user context
                    const user = config?.configurable?.user;

                    // Check if user context is available
                    if (!user) {
                        console.error("User context missing in users lookup tool");
                        return JSON.stringify({ results: [], count: 0, error: "System error: User authentication required" });
                    }

                    // Access the database and collection for users data
                    const database = this.client.database();
                    const collection = database.collection("users");

                    // Only show teachers for parent reference
                    let filter = { role: "Teacher" };

                    // If a query is provided, add a search filter
                    if (query && query.trim() !== '') {
                        filter.$or = [{ name: { $regex: query, $options: 'i' } }];
                    }

                    // Fetch the results from the database
                    const results = await collection.find(filter)
                        .limit(n)
                        .project({ name: 1, role: 1 }) // only return name and role of teachers
                        .toArray();

                    // Return the results
                    return JSON.stringify({
                        results: results,
                        count: results.length,
                        collection: "users",
                        note: "Teacher contact information available"
                    });
                } catch (error) {
                    console.error("Error in users lookup:", error);
                    return JSON.stringify({ error: "Failed to search user information", details: error.message });
                }
            },
            {
                // Tool configuration
                name: "users_lookup",
                description: "Search for teacher contacts - PARENT ONLY (limited information)",
                schema: z.object({  // defines the input validation 
                    query: z.string().optional().describe("Search teacher by name"),
                    n: z.number().optional().default(5)  // control the number of results returned
                }),
            }
        );
    }

    // METHODS FOR WORKFLOW MANAGEMENT

    // LangGraph workflow setup
    initializeWorkflow() {
        // Define the root state for the LangGraph workflow with message handling
        const GraphState = Annotation.Root({
            messages: Annotation({
                reducer: (x, y) => x.concat(y),  // to concatenate messages
            }),
        });

        // Create a state graph for the workflow with nodes and edges
        const workflow = new StateGraph(GraphState)
            .addNode("agent", this.callModel.bind(this)) // add 'agent' node to the workflow
            .addNode("tools", this.toolNode)             // add 'tools' node for tool interactions
            .addEdge("__start__", "agent")               // starting point: agent
            .addConditionalEdges("agent", this.shouldContinue.bind(this)) // after agent, determine the next step
            .addEdge("tools", "agent");                  // from 'tools' back to 'agent' for interaction

        // Define a checkpointing mechanism to save the workflow state to MongoDB
        const checkpointer = new MongoDBSaver({
            client: this.client,
            databaseName: "SkyTopia"
        });

        // Compile the workflow with the checkpointer for state persistence
        this.app = workflow.compile({ checkpointer });
    }

    // Method to determine if the workflow should continue based on the current state
    shouldContinue(state) {
        const messages = state.messages;                    // get the current state messages
        const lastMessage = messages[messages.length - 1];  // get the last message in the state

        // If need tool calls, go to 'tools', otherwise end the workflow
        return lastMessage.tool_calls?.length ? "tools" : "__end__";
    }

    async callModel(state) {
        // System prompt to provide context and guide the model's responses
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are Daycare SkyTopia Assistant helping parents.

                IMPORTANT: RESPOND IN BAHASA INDONESIA ONLY. Provide brief and to the point analysis and comprehensive summaries.

                DATABASE ENUM VALUES - USE THESE EXACT TERMS:
                - Payment Status: "Tertunda", "Terkirim", "Dibayar", "Ditolak", "Jatuh Tempo" 
                - Payment Category: "Bulanan", "Semester", "Registrasi"
                - Child Gender: "Laki-laki", "Perempuan"
                - Development: "Belum Konsisten", "Konsisten", "Tidak Teramati"
                - Motor Skills: "Bantuan Fisik", "Bantuan Verbal", "Mandiri", "Tidak Teramati"

                RESPONSE STYLE GUIDELINES:
                - SUMMARIZE, DON'T LIST: Provide comprehensive summaries instead of raw data dumps
                - HIGHLIGHT PATTERNS: Identify trends and key insights from the data
                - FOCUS ON KEY POINTS: Extract 2-3 most important findings per category
                - USE BULLET POINTS: For clarity, but keep them concise
                - PROVIDE ACTIONABLE INSIGHTS: Give parents practical conclusion

                COMPREHENSIVE WORKFLOW:
                1. ALWAYS use children_lookup FIRST when parent asks about children
                2. For DEVELOPMENT questions ("perkembangan", "progress", "laporan"):
                - Use children_lookup FIRST
                - Then use semester_reports_lookup for formal assessments
                - AND use daily_reports_lookup WITHOUT date filter to get ALL historical daily reports
                - SUMMARIZE key developmental patterns across all reports
                3. For PAYMENT questions:
                - Use children_lookup FIRST  
                - Then use payments_lookup with status: "Tertunda"
                - CALCULATE totals and highlight urgent payments

                ANALYSIS & SUMMARIZATION GUIDELINES:
                FOR DEVELOPMENT DATA:
                - Extract 3-4 key strengths/achievements from all reports
                - Identify 1-2 areas for potential growth/attention
                - Provide overall developmental assessment
                - Give specific, actionable suggestions for parents

                FOR PAYMENT DATA:
                - Calculate total amounts clearly
                - Highlight payment deadlines and urgency
                - Provide payment reminder recommendations

                GENERAL RESPONSE STRUCTURE:
                1. Brief comprehensive summary
                2. Key findings (bullet points)
                3. Overall assessment
                4. Actionable recommendations
                5. Next steps

                DATA INTERPRETATION RULES:
                - When multiple daily reports: Look for CONSISTENT patterns and progress trends
                - When semester reports available: Focus on developmental milestones
                - When data is limited: Acknowledge limitations and suggest alternatives
                - Always connect findings to practical parenting insights

                EXAMPLES OF GOOD SUMMARIES:
                - DON'T: List every single daily report with full details
                - DO: "Berdasarkan 3 laporan harian, anak menunjukkan kemajuan konsisten dalam motorik kasar dan kemampuan sosial. Pencapaian utama: bisa bersepeda roda tiga, berbagi mainan, dan menunjukkan empati."
                - DON'T: Copy-paste all payment records
                - DO: "Total 2 pembayaran tertunda: Rp 12,2 juta (jatuh tempo 8 Nov). Prioritas: bayar registrasi Rp 8,6 juta terlebih dahulu."

                TOOLS:
                1. children_lookup - Get children data (ALWAYS USE FIRST)
                2. daily_reports_lookup - Search daily activities (returns ALL reports if no date specified)
                3. payments_lookup - Search payment records  
                4. semester_reports_lookup - Search developmental assessments
                5. users_lookup - Search teacher contacts

                Current time: {time}`,
            ],
            new MessagesPlaceholder("messages"),
        ]);

        // Format the prompt to include the current time and the stage messages (chat history)
        const formattedPrompt = await prompt.formatMessages({
            time: new Date().toISOString(),
            messages: state.messages,
        });

        // Pass configurable context to model for tool access
        const config = state.configurable || {};
        const modelWithConfig = this.model.withConfig({
            runName: "agent",
            configurable: config  // pass the user context to the model
        });

        // Invoke the model with the formatted prompt and return the result
        const result = await modelWithConfig.invoke(formattedPrompt);
        return { messages: [result] };
    }

    // Main agent execution method
    async callAgent(query, thread_id, user) {
        try {
            // Ensure the system is initialized before proceeding
            await this.ensureInitialized();

            // Check if the user is parent
            if (user.role !== 'Parent') {
                throw new Error("Chatbot is only available for parents");
            }

            // Execute the LangGraph workflow with user context
            const agentPromise = this.app.invoke(
                {   // The user's input is passed as a human message
                    messages: [new HumanMessage(query)],
                },
                {
                    recursionLimit: 15,        // to avoid infinite loops
                    configurable: {
                        thread_id: thread_id,  // pass the conversation thread ID to maintain context
                        user: user             // pass user context to ensure personalized responses
                    }
                }
            );

            // Add timeout protection (after 30 seconds)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Request timeout")), 30000);
            });
            // Either resolve the agent promise or trigger the timeout
            const finalState = await Promise.race([agentPromise, timeoutPromise]);

            // Extract AI Response
            const response = finalState.messages[finalState.messages.length - 1].content;

            // Save the chat history after the agent has responded
            await this.saveChatHistory(thread_id, user, query, response);
            return response;

        } catch (error) {
            console.error("Error in callAgent:", error);

            // Handle different types of errors with user-friendly messages
            if (error.message.includes("Request timeout")) {
                throw new Error("Chatbot is currently busy, please try again later");
            } 
            else if (error.status === 429) {
                throw new Error("Service is busy. Please try again in 1 minute.");
            } 
            else if (error.status === 401) {
                throw Error("Authentication failed. Please check API configuration.");
            } 
            else {
                throw new Error(`Chatbot failed: ${error.message}`);
            }
        }
    }

    // CHAT HISTORY MANAGEMENT METHODS

    // Generating chat title using AI
    async generateChatTitle(userMessage, assistantResponse) {
        try {
            // Construct the prompt for the AI model to generate a short chat title
            const titlePrompt = `Create a short title (max 5 words) for this conversation:
            User: "${userMessage}"
            AI: "${assistantResponse.substring(0, 100)}..."
            Judul:`;

            // Send the title prompt to the AI model and get the generated response
            const titleResponse = await this.model.invoke(titlePrompt);

            return titleResponse.content.substring(0, 40);
        } catch (error) {
            console.error("Error generating chat title:", error);
            return userMessage.substring(0, 30);
            // Fallback to the first 30 characters of the user message
        }
    }

    // Save chat history to the database
    async saveChatHistory(thread_id, user_id, userMessage, assistantResponse) {
        try {
            // Check user
            const userId = user_id._id || user_id.userId || user_id.id || user_id;
            if (!userId) {
                console.error("No user ID provided for chat history");
                return;
            }

            // Check if a chat session already exists for the provided thread_id
            let chatSession = await ChatSession.findOne({ thread_id });
            if (!chatSession) {
                chatSession = new ChatSession({
                    thread_id,
                    user_id: userId,
                    title: await this.generateChatTitle(userMessage, assistantResponse),
                    messages: []
                });
            }

            // Add both response to the chat session
            chatSession.messages.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: assistantResponse }
            );

            // Save the updated chat session to the database
            await chatSession.save();
            console.log("Chat history saved for thread:", thread_id);

        } catch (error) {
            console.error("Error saving chat history:", error);
        }
    }
}

module.exports = AgentService;