// controllers/auth.controller.js

import bcrypt from "bcryptjs";
import { findByFacilityAndStaffId } from "../db/repositories/users.repository.js";

export async function login(req, res) {
    const { staffId, password } = req.body;

    const facilityId = process.env.FACILITY_ID;
    const user = await findByFacilityAndStaffId(facilityId, staffId);

    if (!user) {
        return res.status(401).json({
            error: "Invalid credentials"
        });
    }

    const valid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!valid) {
        return res.status(401).json({
            error: "Invalid credentials"
        });
    }

    return res.status(200).json({
        id: user.staffId,
        staffId: user.staffId,
        name: user.name,
        role: user.role
    });
}