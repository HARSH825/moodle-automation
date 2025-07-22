import { getCache, setCache, delCache } from '../config/cacheOp.js';
import supabase from '../config/supabase.js';

export const CACHE_KEYS = {
    SESSION: (username) => `session:${username}`,
    COURSES: (username) => `courses:${username}`
};

export const TTL = {
    SESSION: 1600,  
    COURSES: 3600   
};

export const getValidSession = async (username) => {
    try {
        //redis
        const redisCookies = await getCache(CACHE_KEYS.SESSION(username));
        if (redisCookies) {
            console.log(` Valid session found in Redis for ${username}`);
            return redisCookies;
        }
        
        //else supabase if redis miss
        const { data, error } = await supabase
            .from('user_sessions')
            .select('cookies_blob, expires_at')
            .eq('username', username)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Supabase session check error:', error);
            return null;
        }

        if (data && data.cookies_blob) {
            const remainingTTL = Math.floor((new Date(data.expires_at) - new Date()) / 1000);  //need to think more here , since ttl has to be same as in supa
            if (remainingTTL > 0) {
                await setCache(CACHE_KEYS.SESSION(username), data.cookies_blob, remainingTTL);
                console.log(` Valid session found in Supabase for ${username}, cached back to Redis`);
                return data.cookies_blob;
            }
        }

        console.log(` No valid session found for ${username}`);
        return null;

    } catch (error) {
        console.error('Session check error:', error);
        return null;
    }
};

export const storeSession = async (username, cookies) => {
    try {
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + TTL.SESSION);

        const { error } = await supabase
            .from('user_sessions')
            .upsert({
                username: username,
                cookies_blob: cookies,
                expires_at: expiresAt.toISOString(),
                created_at: new Date().toISOString()
            }, { 
                onConflict: 'username' 
            });

        if (error) {
            console.error('Supabase session store error:', error);
            throw error;
        }

        await setCache(CACHE_KEYS.SESSION(username), cookies, TTL.SESSION);

        console.log(` Fresh session stored for ${username} (expires: ${expiresAt.toISOString()})`);
        return true;

    } catch (error) {
        console.error('Session store error:', error);
        throw error;
    }
};

// valid courses for user
export const getValidCourses = async (username) => {
    try {
        // redis first
        const redisCourses = await getCache(CACHE_KEYS.COURSES(username));
        if (redisCourses) {
            console.log(` Valid courses found in Redis for ${username}`);
            return redisCourses;
        }

        //  supabase if redis miss
        const { data, error } = await supabase
            .from('user_courses')
            .select('courses_blob, expires_at')
            .eq('username', username)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Supabase courses check error:', error);
            return null;
        }

        if (data && data.courses_blob) {
            const remainingTTL = Math.floor((new Date(data.expires_at) - new Date()) / 1000);
            if (remainingTTL > 0) {
                await setCache(CACHE_KEYS.COURSES(username), data.courses_blob, remainingTTL);
                console.log(` Valid courses found in Supabase for ${username}, cached back to Redis`);
                return data.courses_blob;
            }
        }

        console.log(` No valid courses found for ${username}`);
        return null;

    } catch (error) {
        console.error('Courses check error:', error);
        return null;
    }
};

export const storeCourses = async (username, courses) => {
    try {
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + TTL.COURSES);

        const { error } = await supabase
            .from('user_courses')
            .upsert({
                username: username,
                courses_blob: courses,
                expires_at: expiresAt.toISOString(),
                created_at: new Date().toISOString()
            }, { 
                onConflict: 'username' 
            });

        if (error) {
            console.error('Supabase courses store error:', error);
            throw error;
        }

        await setCache(CACHE_KEYS.COURSES(username), courses, TTL.COURSES);

        console.log(` Fresh courses stored for ${username} (expires: ${expiresAt.toISOString()})`);
        return true;

    } catch (error) {
        console.error('Courses store error:', error);
        throw error;
    }
};
