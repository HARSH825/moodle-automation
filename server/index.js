import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectRedis } from './config/redis.js';
import { initBrowserPool, shutdownBrowserPool } from './services/BrowserPool.js';
import loginFetchRouter from './routes/loginRouter.js';     // f-1
import checkSubRouter from './routes/submissionRouter.js';         // f-2
import generateDocumentsRouter from './routes/genDocRouter.js';  // f-3
import './services/assignmentCheck.js';
import './services/docGenWorker.js'

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/loginfetch', loginFetchRouter);
app.use('/api/v1/checkSub', checkSubRouter);
app.use('/api/v1/genDoc', generateDocumentsRouter);

const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await connectRedis();
        initBrowserPool();

        app.listen(PORT, () => {
            console.log(` Server is running on port ${PORT}`);
            console.log(' Assignment check worker init and ready');
            console.log(`Doc generation worker initialzed and ready `);
        });
    } catch (error) {
        console.error(' Server startup failed:', error);
        process.exit(1);
    }
};

process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');
    await shutdownBrowserPool();
    process.exit(0);
});

startServer();