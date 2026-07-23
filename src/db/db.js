import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from '../../config/config.js';

dotenv.config();

const mongo_uri = config.MONGODB_URI;

const connectToDatabase = async () => {
    try {
        console.log(`Connecting to Database...`)
        const dbConnection = await mongoose.connect(mongo_uri);
        console.log(`Database connection successful at ${dbConnection.connection.host}`);
    } catch (error) {
        console.log(`Database connection error : ${error}`);
        process.exit(0);
    }
};

export { connectToDatabase };