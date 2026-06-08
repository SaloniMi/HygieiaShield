import { createAgentEventRecord } from "../db/repositories/agent-trace.repository.js";

export const mongoEventBus = {
    async publish(event) {
        await createAgentEventRecord(event)
    }
};