import { VitalsType } from "@hygieiashield/zod-contracts";

export interface RetrievalContext {
  observables: string[];
  unknownMentions: string[];
  vitals?: VitalsType;
}

export interface HandbookRetriever {
  retrieve(context: RetrievalContext, limit?: number): Promise<string[]>;
}
