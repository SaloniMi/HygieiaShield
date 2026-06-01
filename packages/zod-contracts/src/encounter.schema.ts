import { z } from "zod";
import { patientSchema } from "./patient.schema.js";
import { observablesSchema } from "./observables.schema.js";
import { routingSchema } from "./routing.schema.js";

export const encounterStatusSchema = z.enum([
  "INTAKE_STARTED",
  "ROUTING_COMPLETE",
  "PLANNED",
  "ARRIVED",
  "IN_TRIAGE",
  "COMPLETED",
  "EXPIRED"
]);

export const encounterSchema = z.object({
  triageId: z.string().regex(/^[A-Z]+-\d+$/),
  patient: patientSchema,
  observables: observablesSchema,
  status: encounterStatusSchema,
  routing: routingSchema,
  createdAt: z.string().datetime(),
  reservationExpiresAt: z.string().datetime(),
  notes: z.string().optional()
});
