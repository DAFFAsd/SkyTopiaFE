const mongoose = require('mongoose');
let mongoClient = null;

// Connect to MongoDB with Mongoose
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB with Mongoose");
        
        // Setup native MongoDB client for LangChain
        mongoClient = mongoose.connection.getClient();
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

// Getter function for native client
const getMongoClient = () => {
    if (!mongoClient) {
        throw new Error("MongoDB client not initialized. Call connectDB() first.");
    }
    return mongoClient;
};

module.exports = { connectDB, getMongoClient };