import { getFacilities } from "../db/repositories/facilities.repository.js";

export const dbConnectors = {
    async getHospitals(event) {
        return await getFacilities(event)
    }
};