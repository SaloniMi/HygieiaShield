export type CareType = "ER" | "UrgentCare" | "OutPatient";

export const ESI_CARE_TYPE: Record<1 | 2 | 3 | 4 | 5, CareType> = {
  1: "ER",
  2: "ER",
  3: "ER",
  4: "UrgentCare",
  5: "OutPatient"
};
