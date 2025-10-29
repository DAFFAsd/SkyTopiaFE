require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');

// Import scheduler
const { startScheduler } = require('./src/tasks/scheduler');

// Import routes
const childRoutes = require('./src/routes/child.route');
const dailyReportRoutes = require('./src/routes/dailyReport.route');
const semesterReportRoutes = require('./src/routes/semesterReport.route');
const paymentRoutes = require('./src/routes/payment.route');
const userRoutes = require('./src/routes/user.route');

const port = process.env.PORT || 3000;
const app = express();

// Connect to database
db.connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    methods: "GET,POST,PUT,DELETE",
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

// Start scheduler
startScheduler(); 

// Handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Cron jobs activated.`);
});