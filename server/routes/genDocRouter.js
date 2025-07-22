import express from 'express';
import { startDocumentGeneration, checkDocumentJobStatus } from '../controller/genDoc.js';

const router = express.Router();

router.post('/generate', startDocumentGeneration);
router.get('/status/:jobId', checkDocumentJobStatus);

export default router;
