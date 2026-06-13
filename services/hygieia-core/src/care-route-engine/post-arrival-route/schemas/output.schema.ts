import { CareType } from "../../mapper.js";

export interface CareRouteOutput {
  careType: CareType;
  wardType?: "ICU" | "General" | undefined;
}
