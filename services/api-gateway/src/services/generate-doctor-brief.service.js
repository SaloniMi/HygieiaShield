import { runGenerateBriefWorkflow } from "@hygieiashield/core";
import { updateDoctorBrief, updateDoctorBriefStatus } from "../db/repositories/fhir.repository.js";

export function generateDoctorBriefAsync({
    token,
    ageGroup,
    observables,
    unknownMentions,
    esiLevel,
    vitals
}) {
    setImmediate(async () => {
        try {
            console.time("doctor-brief")
            await updateDoctorBriefStatus(token, "PENDING");
            const doctorBrief = await runGenerateBriefWorkflow({
                ageGroup,
                observables,
                unknownMentions,
                esiLevel,
                vitals
            });
            console.timeEnd("doctor-brief")

            await updateDoctorBrief(token, { ...doctorBrief, status: "READY" });
            console.log(
                `[DoctorBrief] Generated brief for token ${token}`
            );
        } catch (error) {
            console.error(
                `[DoctorBrief] Failed for token ${token}`,
                error
            );
        }
    });
}