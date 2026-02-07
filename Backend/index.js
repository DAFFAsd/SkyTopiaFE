require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./src/config/database');
const { startScheduler } = require('./src/tasks/scheduler');

// Import routes
const childRoutes = require('./src/routes/child.route');
const dailyReportRoutes = require('./src/routes/dailyReport.route');
const semesterReportRoutes = require('./src/routes/semesterReport.route');
const paymentRoutes = require('./src/routes/payment.route');
const userRoutes = require('./src/routes/user.route');
const chatbotRoutes = require('./src/routes/chatbot.route');
const facilityRoutes = require('./src/routes/facility.route');
const inventoryRoutes = require('./src/routes/inventory.route');
const curriculumRoutes = require('./src/routes/curriculum.route');
const scheduleRoutes = require('./src/routes/schedule.route');
const attendanceRoutes = require('./src/routes/attendance.route');
const uploadRoutes = require('./src/routes/upload.route');

// Server configuration
const port = process.env.PORT || 3000;
const app = express();

// Connect to database
database.connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [
        'http://localhost:3001',
        'https://tamasya.x-intellitech.cloud'
    ],
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    credentials: true
}));

// Status endpoint
app.get('/status', (req, res) => {
    res.status(200).send({ status: "Server is running" });
});

// API Routes
app.use("/api/children", childRoutes);
app.use("/api/daily-reports", dailyReportRoutes);
app.use("/api/semester-reports", semesterReportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/curriculums', curriculumRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/upload', uploadRoutes);

// Start payment scheduler (only in non-Vercel environments)
if (!process.env.VERCEL) {
    startScheduler();
}

// Handler handling for undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Error handling for middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// Start server (only in non-Vercel environments)
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

// Export for Vercel serverless
module.exports = app;