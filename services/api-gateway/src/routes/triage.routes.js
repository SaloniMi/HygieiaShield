import express from 'express';
import { triagePatient } from '../controllers/triage.controller.js';

const router = express.Router();

router.post('/', triagePatient);

export default router;