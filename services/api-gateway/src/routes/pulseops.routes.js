import express from 'express';
import { getQueue } from '../controllers/pulse-ops/getqueue.controller.js';
import { getPatient } from '../controllers/pulse-ops/getpatient.controller.js';
import { getPatientBrief } from '../controllers/pulse-ops/getpatientbrief.controller.js';
import { updateVitals } from '../controllers/pulse-ops/updatevitals.controller.js';
import { getAgentTrace } from '../controllers/pulse-ops/getagenttrace.controller.js';
import { login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);

router.get("/facility", (req, res, next) => {
    return res.status(200).json({
        id: process.env.FACILITY_ID,
        name: process.env.FACILITY_NAME
    });
})

router.get('/queue', getQueue);

router.get('/patients/:patientId', getPatient);

router.get('/patients/:patientId/brief', getPatientBrief);

router.get('/patients/:patientId/agent-trace', getAgentTrace);

router.post('/vitals', updateVitals);

export default router;