require('dotenv').config();
const mongoose = require('mongoose');

function connectDB() {
    // Step 2: Database connection
    mongoose.connect(process.env.MONGO_CONNECTION_URL);
    
    const connection = mongoose.connection;

    connection.on('error', err => {
        // Step 3: Handle database connection error
        console.error('Database connection error:', err);
    });

    connection.once('open', () => {
        // Step 1: MongoDB connected successfully
        console.log('Database connected 🥳🥳🥳🥳');
    });
}

module.exports = connectDB;


//1ER26LQWjrRVpLNO