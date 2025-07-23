import express from 'express';
import { startAssignmentCheck, checkJobStatus, getNonSubmittedAssignments } from '../controller/checkSubController.js';

const router = express.Router();
router.post('/start', startAssignmentCheck);
router.get('/status/:jobId', checkJobStatus);
router.get('/assignments/:username', getNonSubmittedAssignments);

export default router;