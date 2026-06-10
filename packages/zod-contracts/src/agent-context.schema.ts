import { AgentEvent } from "./agent-event.schema.js";

// 1. Define strict type structures matching the MongoDB document format
export type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
};

export type DepartmentLoad = {
  capacity: number;
  pending: number;
  occupied: number;
  routingPaused: boolean;
};

export interface Facility {
  _id: string;
  name: string;
  location: GeoJsonPoint;
  emergency: DepartmentLoad;
  urgentCare: DepartmentLoad;
  outpatient: DepartmentLoad;
  routingPaused: boolean;
  createdAt: { $date: string } | Date;
  updatedAt: { $date: string } | Date;
}

// 2. Updated Bus and Database connector contracts
export interface AgentEventBus {
  publish(event: AgentEvent): Promise<void>;
}

export interface AgentDBConnectors {
  // Swapped Array<object> with explicit typed Facility contracts
  getHospitals(event: object): Promise<Array<Facility>>;
}

export type BaseTrace = {
  encounterId: string;
  patientId: string;
  token: string;
};

export type AgentContext = {
  trace: BaseTrace;
  eventBus: AgentEventBus;
  dbConnectors: AgentDBConnectors;
};
