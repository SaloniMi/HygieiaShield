export interface RetrievalContext {
  observables: string[];
  unknownMentions: string[];
}

export interface HandbookRetriever {
  retrieve(context: RetrievalContext, limit?: number): Promise<string[]>;
}
