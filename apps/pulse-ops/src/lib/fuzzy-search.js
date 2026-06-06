/**
 * Fuzzy search utility
 * Simple string matching for patient queue filtering
 */

export function fuzzyMatch(query, text) {
    if (!query.trim()) return true;

    const q = query.toLowerCase();
    const t = text.toLowerCase();

    // Direct substring match
    if (t.includes(q)) return true;

    // Fuzzy character matching
    let qi = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] === q[qi]) qi++;
    }
    return qi === q.length;
}

export function filterPatients(patients, query) {
    if (!query.trim()) return patients;

    return patients.filter(patient =>
        fuzzyMatch(query, patient.patientName) ||
        fuzzyMatch(query, patient.token)
    );
}
