import express from 'express';
const router = express.Router();
import  loginFetchController  from '../controller/loginfetch.js';

router.post('/',loginFetchController);

export default router;