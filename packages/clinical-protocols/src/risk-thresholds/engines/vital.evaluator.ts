export type VitalRule = NumericVitalRule | EnumVitalRule | BooleanVitalRule;
type NumericVitalRule = {
  type: "numeric";
  unit: string;
  readonly thresholds: ReadonlyArray<{
    level: "NORMAL" | "HIGH" | "CRITICAL";
    operator: "<" | "<=" | ">" | ">=" | "==";
    value: number;
    flag: string;
  }>;
};
type EnumVitalRule = {
  type: "enum";
  values: Record<
    string,
    {
      level: "NORMAL" | "HIGH" | "CRITICAL";
      flag: string | null;
    }
  >;
};
type BooleanVitalRule = {
  type: "boolean";
  rules: {
    true?: {
      level: "NORMAL" | "HIGH" | "CRITICAL";
      flag: string;
    };
    false?: {
      level: "NORMAL" | "HIGH" | "CRITICAL";
      flag: string;
    };
  };
};

const severityRank = {
  NORMAL: 0,
  HIGH: 1,
  CRITICAL: 2
} as const;

export function evaluateVital(value: string, rule: VitalRule) {
  if (!rule) return null;

  // -------------------------
  // NUMERIC
  // -------------------------
  if (rule.type === "numeric") {
    const v = Number(value);
    if (Number.isNaN(v)) return null;

    let bestMatch: (typeof rule.thresholds)[number] | null = null;

    for (const t of rule.thresholds) {
      let triggered = false;

      switch (t.operator) {
        case "<":
          triggered = v < t.value;
          break;
        case "<=":
          triggered = v <= t.value;
          break;
        case ">":
          triggered = v > t.value;
          break;
        case ">=":
          triggered = v >= t.value;
          break;
        case "==":
          triggered = v === t.value;
          break;
      }

      if (!triggered) continue;

      if (!bestMatch || severityRank[t.level] > severityRank[bestMatch.level]) {
        bestMatch = t;
      }
    }

    return {
      value: v,
      triggered: bestMatch
    };
  }

  // -------------------------
  // ENUM (AVPU)
  // -------------------------
  if (rule.type === "enum") {
    const v = String(value);
    const match = rule.values[v];

    if (!match) return { value: v, triggered: null };

    return {
      value: v,
      triggered: match.flag
        ? {
            level: match.level,
            flag: match.flag
          }
        : null
    };
  }

  // -------------------------
  // BOOLEAN
  // -------------------------
  if (rule.type === "boolean") {
    const v = Boolean(value);

    const triggered = v ? rule.rules?.true : rule.rules?.false;

    return {
      value: v,
      triggered: triggered ?? null
    };
  }

  return null;
}

export function evaluateAllVitals(
  vitals: object,
  rules: Record<string, VitalRule>
) {
  const results = [];

  for (const [key, value] of Object.entries(vitals)) {
    const rule = rules[key];
    if (!rule) continue;

    const evaluation = evaluateVital(value, rule);

    if (!evaluation) continue;

    results.push({
      vital: key,
      ...evaluation
    });
  }

  return results;
}
