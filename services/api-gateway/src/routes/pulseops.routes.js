import express from 'express';
import { getQueue } from '../controllers/pulse-ops/getqueue.controller.js';
import { getPatient } from '../controllers/pulse-ops/getpatient.controller.js';
import { updateVitals } from '../controllers/pulse-ops/updatevitals.controller.js';

const router = express.Router();

router.get('/queue', getQueue);

router.get('/patients/:patientId', getPatient);

router.post('/vitals', updateVitals);

export default router;