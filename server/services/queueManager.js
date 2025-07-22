import Queue from 'bull';
import { redisclient } from '../config/redis.js';

// assignment checking queue 
export const assignmentCheckQueue = new Queue('assignment check', {
    
    redis: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD
    },
    defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 2,
        backoff: 'exponential',
        delay: 0
    }
});

//  event handlers
assignmentCheckQueue.on('completed', (job) => {
    console.log(` Assignment check job ${job.id} completed for user: ${job.data.username}`);
});

assignmentCheckQueue.on('failed', (job, err) => {
    console.error(` Assignment check job ${job.id} failed:`, err.message);
});

assignmentCheckQueue.on('progress', (job, progress) => {
    console.log(` Job ${job.id} progress: ${progress}%`);
});

// add job to queue
export const addAssignmentCheckJob = async (username, selectedCourseIds) => {
    try {
        console.log("added ass to ascheckQJob");
        const job = await assignmentCheckQueue.add('check-assignments', {
            username,
            selectedCourseIds,
            timestamp: new Date().toISOString()
        }, {
            priority: 1,
            attempts: 2
        });
        
        console.log(` Assignment check job ${job.id} queued for user: ${username}`);
        return job;
    } catch (error) {
        console.error('Error adding assignment check job:', error);
        throw error;
    }
};

// get job status
export const getJobStatus = async (jobId) => {
    try {
        const job = await assignmentCheckQueue.getJob(jobId);
        if (!job) return null;
        
        const state = await job.getState();
        return {
            id: job.id,
            status: state,
            progress: job.progress(),
            data: job.data,
            result: job.returnvalue,
            failedReason: job.failedReason,
            createdAt: new Date(job.timestamp).toISOString()
        };
    } catch (error) {
        console.error('Error getting job status:', error);
        return null;
    }
};
