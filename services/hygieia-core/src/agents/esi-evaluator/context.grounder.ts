import { VitalsType } from "@hygieiashield/zod-contracts";
import { getRetriever } from "../../services/handbook-vector-search/handbook.services.js";

export async function retrieveESIContext(
  observables: string[],
  unknownMentions: string[],
  vitals?: VitalsType
) {
  const retriever = await getRetriever();

  return retriever.retrieve({
    observables,
    unknownMentions,
    vitals
  });
}
