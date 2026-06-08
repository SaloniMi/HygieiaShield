import { AgentEvent } from "./agent-event.schema.js";

export interface AgentEventBus {
  publish(event: AgentEvent): Promise<void>;
}

export type BaseTrace = {
  encounterId: string;
  patientId: string;
  token: string;
};

export type AgentContext = {
  trace: BaseTrace;
  eventBus: AgentEventBus;
};
