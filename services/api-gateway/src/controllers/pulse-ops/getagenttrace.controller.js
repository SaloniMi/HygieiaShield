import { findAgentTracesByPatientId } from "../../db/repositories/agent-trace.repository.js";

export async function getAgentTrace(req, res, next) {
    try {
        const { patientId } = req.params;

        const records = await findAgentTracesByPatientId(patientId);

        const response = {
            agentTrace: records.map(record => {
                return {
                    ...(record.timeline || {}),
                    timestamp: record.timestamp
                }
            }) ?? []
        };

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}