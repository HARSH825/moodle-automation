import { redisclient } from './redis.js';

export const setCache = async (key, value, ttl = null) => {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        if (ttl) {
            await redisclient.setEx(key, ttl, stringValue);
        } else {
            await redisclient.set(key, stringValue);
        }
        return true;
    } catch (error) {
        console.error('Redis SET error:', error);
        return false;
    }
};

export const getCache = async (key) => {
    try {
        const value = await redisclient.get(key);
        if (!value) return null;
        
        try {
            return JSON.parse(value);
        } catch {
            return value; 
        }
    } catch (error) {
        console.error('Redis GET error:', error);
        return null;
    }
};

export const delCache = async (key) => {
    try {
        const result = await redisclient.del(key);
        return result > 0;
    } catch (error) {
        console.error('Redis DEL error:', error);
        return false;
    }
};

export const existsCache = async (key) => {
    try {
        const result = await redisclient.exists(key);
        return result === 1;
    } catch (error) {
        console.error('Redis EXISTS error:', error);
        return false;
    }
};

export const getTTL = async (key) => {
    try {
        return await redisclient.ttl(key);
    } catch (error) {
        console.error('Redis TTL error:', error);
        return -1;
    }
};
