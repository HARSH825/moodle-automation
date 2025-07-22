import Queue from 'bull';

// document gen queue
export const documentGenQueue = new Queue('document generation', {
    redis: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD
    },
    defaultJobOptions: {
        removeOnComplete: 5,
        removeOnFail: 3,
        attempts: 1, 
        backoff: 'fixed',
        delay: 0
    }
});
//event handlers
documentGenQueue.on('completed', (job) => {
    console.log(` Document generation job ${job.id} completed for user: ${job.data.username}`);
});

documentGenQueue.on('failed', (job, err) => {
    console.error(` Document generation job ${job.id} failed:`, err.message);
});

documentGenQueue.on('progress', (job, progress) => {
    console.log(` Job ${job.id} progress: ${progress}%`);
});

export const addDocumentGenJob = async (username, selectedAssignments, userDetails) => {
    try {
        if (selectedAssignments.length > 5) {   //max 5
            throw new Error('Maximum 5 assignments allowed per request');
        }
        
        const job = await documentGenQueue.add('generate-documents', {
            username,
            selectedAssignments,
            userDetails,
            timestamp: new Date().toISOString()
        }, {
            priority: 1,
            attempts: 1
        });
        
        console.log(` Document generation job ${job.id} queued for user: ${username}`);
        return job;
    } catch (error) {
        console.error('Error adding document generation job:', error);
        throw error;
    }
};

// document job status
export const getDocumentJobStatus = async (jobId) => {
    try {
        const job = await documentGenQueue.getJob(jobId);
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
        console.error('Error getting document job status:', error);
        return null;
    }
};
