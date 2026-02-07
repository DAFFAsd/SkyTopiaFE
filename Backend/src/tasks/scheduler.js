const cron = require('node-cron');
const moment = require('moment'); 
const Payment = require('../models/payment.model'); 
const Child = require('../models/child.model');

// Calculate due date for scheduler
const calculateSchedulerDueDate = (category) => {
    const today = new Date();
    
    switch (category) {
        case 'Bulanan':
            // Monthly payment: 10th of current month (pay 1-10 for current month service)
            return new Date(today.getFullYear(), today.getMonth(), 10);
            
        case 'Semester':
            // Semester payment: pay in advance for the upcoming semester
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;

            if (currentMonth === 6) {
                // June: payment for even semester (Jul-Dec), due July 15th
                return new Date(currentYear, 6, 15); // July 15th
            } else if (currentMonth === 12) {
                // December: payment for odd semester (Jan-Jun), due January 15th next year
                return new Date(currentYear + 1, 0, 15); // January 15th
            } else {
                throw new Error('Semester payments only generated in June and December');
            }
            
        default:
            return new Date(today.getFullYear(), today.getMonth(), 10);
    }
};

// Calculate due date for manually created payments (first payment)
const calculateManualDueDate = (category) => {
    const today = new Date();
    
    // one day in milliseconds = hours in a day (24) * minutes in an hour (60) * seconds in a minute (60) * milliseconds in a second (1000)
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    switch (category) {
        case 'Bulanan':
            // First monthly payment: 7 days from manual creation date
            return new Date(today.getTime() + 7 * oneDayInMs);
            
        case 'Semester':
            // First semester payment: 30 days from manual creation date
            return new Date(today.getTime() + 30 * oneDayInMs);
            
        case 'Registrasi':
            // Registration fee: 7 days from creation date
            return new Date(today.getTime() + 7 * oneDayInMs);
            
        default:
            return new Date(today.getTime() + 7 * oneDayInMs);
    }
};

// Check and update overdue payments
const checkAndUpdateOverdue = async () => {
    const today = new Date();
    try {
        // Update payments past their due_date to 'Overdue'
        const result = await Payment.updateMany(
            { 
                status: "Tertunda",
                due_date: { $lt: today } 
            },
            { 
                status: "Jatuh Tempo" 
            }
        );
        console.log(`[Overdue Check] Updated ${result.modifiedCount} payments to Overdue`);
    } catch (error) {
        console.error('[Overdue Check] Error:', error);
    }
};

// Create recurring payments
const createRecurringPayments = async () => {
    try {
        await checkAndUpdateOverdue();
        const currentMonth = moment().month() + 1; // 1-12
        const currentYear = moment().year();
        
        // Monthly period: current month (pay for current month service)
        const monthlyPeriod = moment().format('YYYY-MM');
        
        // Semester period: based on academic calendar
        let semesterPeriod, semesterCategory;
        if (currentMonth === 6) {
            // June: generate for even semester (Jul-Dec)
            semesterPeriod = `${currentYear}-2`; // even semester current year
            semesterCategory = 'Semester';
        } else if (currentMonth === 12) {
            // December: generate for odd semester (Jan-Jun)
            semesterPeriod = `${currentYear + 1}-1`; // odd semester next year
            semesterCategory = 'Semester';
        }
        
        const activeChildren = await Child.find({ 
            $or: [
                { monthly_fee: { $gt: 0 } },
                { semester_fee: { $gt: 0 } }
            ]
        }); 
        
        let monthlyCount = 0;
        let semesterCount = 0;

        for (const child of activeChildren) {
            // Monthly payment (every month - pay for current month)
            if (child.monthly_fee > 0) {
                const existingMonthly = await Payment.findOne({
                    child_id: child._id,
                    period: monthlyPeriod,
                    category: 'Bulanan'
                });

                if (!existingMonthly) {
                    await Payment.create({
                        child_id: child._id,
                        amount: child.monthly_fee,
                        due_date: calculateSchedulerDueDate('Bulanan'),
                        category: 'Bulanan',
                        period: monthlyPeriod,
                        status: 'Tertunda'
                    });
                    monthlyCount++;
                    console.log(`[Created] Monthly payment for ${child.name} (${monthlyPeriod})`);
                }
            }

            // Semester payment (only in June and December)
            if (semesterCategory && child.semester_fee > 0) {
                const existingSemester = await Payment.findOne({
                    child_id: child._id,
                    period: semesterPeriod,
                    category: 'Semester'
                });

                if (!existingSemester) {
                    await Payment.create({
                        child_id: child._id,
                        amount: child.semester_fee,
                        due_date: calculateSchedulerDueDate('Semester'),
                        category: 'Semester',
                        period: semesterPeriod,
                        status: 'Tertunda'
                    });
                    semesterCount++;
                    console.log(`[Created] Semester payment for ${child.name} (${semesterPeriod})`);
                }
            }
        }

        console.log(`Payment generation complete: ${monthlyCount} monthly, ${semesterCount} semester payments created`);
        
    } catch (error) {
        console.error('Scheduler Error:', error);
    }
};

// Start scheduler
exports.startScheduler = () => {
    // Run every 1st day of month at 00:00
    cron.schedule('0 0 1 * *', createRecurringPayments, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    }); 
    console.log('Payment scheduler started (runs 1st of every month)');
};

exports.calculateManualDueDate = calculateManualDueDate;
exports.checkAndUpdateOverdue = checkAndUpdateOverdue;
exports.createRecurringPayments = createRecurringPayments;