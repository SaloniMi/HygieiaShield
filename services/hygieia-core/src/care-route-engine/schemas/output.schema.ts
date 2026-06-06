export type CareType = "ER" | "Urgent Care" | "Outpatient";

export interface CareRouteOutput {
  careType: CareType;
  reason: string;
  routeHint: string;
}
