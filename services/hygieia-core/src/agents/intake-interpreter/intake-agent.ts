// intake-agent.ts
import { createLLM } from "../../services/llm/llm.services.js";
import { intakeOutputSchema, IntakeOutput } from "./schemas/output.schema.js";
import { buildIntakeInterpreterPrompt } from "./intake.prompt.js";
import { IntakeInput, intakeInputSchema } from "./schemas/input.schema.js";
import { observableSchema } from "@hygieiashield/zod-contracts";
import { UserSymptom } from "@hygieiashield/zod-contracts";

const symptomFallbackMap = {
  STOMACH_PAIN: ["STABLE_ABDOMINAL_PAIN"],
  CHEST_PAIN: ["STABLE_CHEST_PAIN"],
  BREATHING_TROUBLE: ["SEVERE_RESPIRATORY_DISTRESS"],
  ALTERED_CONSCIOUSNESS: ["UNRESPONSIVE_OR_OBTUNDED"],
  STROKE_SIGNS: ["ACUTE_STROKE_SYMPTOMS"],
  SEVERE_HEADACHE: ["THUNDERCLAP_HEADACHE"],
  ALLERGIC_REACTION: ["MILD_RASH_NO_DISTRESS"],
  TRAUMA_INJURY: ["MINOR_ORTHOPEDIC_INJURY"],
  FEVER_INFECTION: ["STABLE_PRODUCTIVE_COUGH"],
  CRISIS_AND_SAFETY: ["SEVERE_PSYCHOLOGICAL_DISTRESS"]
};

function fallbackSymptomsToObservables(symptoms: UserSymptom[]): string[] {
  return [
    ...new Set(symptoms.flatMap((symptom) => symptomFallbackMap[symptom] ?? []))
  ];
}

export async function extractObservables(input: IntakeInput) {
  // TODO: Azure OpenAI structured output
  const systemPrompt = buildIntakeInterpreterPrompt(input.ageGroup);
  const llm = createLLM();
  const result = await llm.generateStructuredOutput({
    systemPrompt,
    userPrompt: {
      transcript: input.transcript,
      selectedSymptoms: input.selectedSymptoms ?? []
    },
    schema: intakeOutputSchema
  });

  const allowed = new Set(observableSchema.options);

  const observables = (result.observables ?? []).filter((o) => allowed.has(o));

  const unknownMentions = [
    ...(result.unknownMentions ?? []),
    ...(result.observables ?? []).filter((o) => !allowed.has(o))
  ];
  return intakeOutputSchema.parse({
    unknownMentions,
    observables
  });
}

export async function runIntakeInterpreter(
  rawInput: unknown
): Promise<IntakeOutput> {
  const input = intakeInputSchema.parse(rawInput);
  const hasTranscript = input.transcript && input.transcript.trim().length > 0;

  // Fast path: tap inputs only
  if (!hasTranscript) {
    return intakeOutputSchema.parse({
      observables: fallbackSymptomsToObservables(input.selectedSymptoms),
      confidence: 1,
      unknownMentions: []
    });
  }

  // Extracts observables using LLM extraction technique
  const extracted = await extractObservables(input);

  return intakeOutputSchema.parse({
    observables: extracted.observables ?? [],
    unknownMentions: extracted.unknownMentions
  });
}
