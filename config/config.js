import dotenv from 'dotenv';

dotenv.config();

if(!process.env.NODE_ENV){
    throw new Error("NODE_ENV is not defined in the environment variables.");
}

if(!process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL is not defined in the environment variables.");
}

if(!process.env.BACKEND_API_URL) {
    throw new Error("BACKEND_API_URL is not defined in the environment variables.");
}

if(!process.env.CORS_ORIGIN) {
    throw new Error("CORS_ORIGIN is not defined in the environment variables.");
}

if(!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
}

if(!process.env.PORT) {
    throw new Error("PORT is not defined in the environment variables.");
}

if(!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
}

if(!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined in the environment variables.");
}

if(!process.env.ACCESS_TOKEN_EXPIRY_TIME) {
    throw new Error("ACCESS_TOKEN_EXPIRY_TIME is not defined in the environment variables.");
}

if(!process.env.REFRESH_TOKEN_EXPIRY_TIME) {
    throw new Error("REFRESH_TOKEN_EXPIRY_TIME is not defined in the environment variables.");
}

if(!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not defined in the environment variables.");
}

if(!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in the environment variables.");
}

if(!process.env.GOOGLE_CALLBACK_URL) {
    throw new Error("GOOGLE_CALLBACK_URL is not defined in the environment variables.");
}

if(!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not defined in the environment variables.");
}

if(!process.env.NODEMAILER_USER_EMAIL) {
    throw new Error("NODEMAILER_USER_EMAIL is not defined in the environment variables.");
}

if(!process.env.NODEMAILER_USER_PASSWORD) {
    throw new Error("NODEMAILER_USER_PASSWORD is not defined in the environment variables.");
}

if(!process.env.RAZORPAY_KEY_ID) {
    throw new Error("RAZORPAY_KEY_ID is not defined in the environment variables.");
}

if(!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_SECRET is not defined in the environment variables.");
}

if(!process.env.RAZORPAY_ENDPOINT_URL) {
    throw new Error("RAZORPAY_ENDPOINT_URL is not defined in the environment variables.");
}

if(!process.env.IMAGEKIT_PUBLIC_KEY) {
    throw new Error("IMAGEKIT_PUBLIC_KEY is not defined in the environment variables.");
}

if(!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in the environment variables.");
}

if(!process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error("IMAGEKIT_URL_ENDPOINT is not defined in the environment variables.");
}

const config = {
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL,
    BACKEND_API_URL: process.env.BACKEND_API_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRY_TIME: process.env.ACCESS_TOKEN_EXPIRY_TIME,
    REFRESH_TOKEN_EXPIRY_TIME: process.env.REFRESH_TOKEN_EXPIRY_TIME,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODEMAILER_USER_EMAIL: process.env.NODEMAILER_USER_EMAIL,
    NODEMAILER_USER_PASSWORD: process.env.NODEMAILER_USER_PASSWORD,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_ENDPOINT_URL: process.env.RAZORPAY_ENDPOINT_URL,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
}

export default config;