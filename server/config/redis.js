import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisclient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisclient.on('error', err => {
    console.error(' Redis Client Error:', err);
});

redisclient.on('connect', () => {
    console.log(' Connecting to Redis Cloud...');
});

redisclient.on('ready', () => {
    console.log(' Redis Cloud connected and ready');
});

redisclient.on('reconnecting', () => {
    console.log(' Reconnecting to Redis Cloud...');
});

redisclient.on('end', () => {
    console.log(' Redis Cloud connection closed');
});

let isConnected = false;

const connectRedis = async () => {
    if (!isConnected) {
        try {
            await redisclient.connect();
            isConnected = true;
            console.log(' Redis Cloud connection established');
        } catch (error) {
            console.error('Failed to connect to Redis Cloud:', error);
            throw error;
        }
    }
};

export { connectRedis, redisclient };
