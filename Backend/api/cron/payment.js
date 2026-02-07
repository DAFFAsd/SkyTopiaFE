const { createRecurringPayments, checkAndUpdateOverdue } = require('../../src/tasks/scheduler');
const database = require('../../src/config/database');

module.exports = async (req, res) => {
    // Verify cron secret for security
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized' 
        });
    }

    // Only allow GET requests (Vercel Cron uses GET)
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }

    try {
        // Ensure database connection
        await database.connectDB();

        // Run payment tasks
        console.log('[Vercel Cron] Starting payment scheduler tasks...');
        
        await checkAndUpdateOverdue();
        await createRecurringPayments();

        console.log('[Vercel Cron] Payment scheduler tasks completed');
        
        return res.status(200).json({ 
            success: true, 
            message: 'Payment cron job executed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Vercel Cron] Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Cron job failed',
            error: error.message 
        });
    }
};
