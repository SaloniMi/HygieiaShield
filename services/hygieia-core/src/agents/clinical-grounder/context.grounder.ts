import { getRetriever } from "../../knowledge/handbook.initator.js";

export async function retrieveESIContext(
  observables: string[],
  unknownMentions: string[]
) {
  const retriever = await getRetriever();

  return retriever.retrieve({
    observables,
    unknownMentions
  });
}
