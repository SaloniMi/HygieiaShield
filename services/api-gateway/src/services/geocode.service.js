export async function getAddress(lat, lng) {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
            headers: {
                'User-Agent': 'Hygieia-Gateway/1.0'
            }
        }
    );

    const data = await res.json();

    const a = data.address || {};

    const parts = [
        a.suburb,
        a.neighbourhood,
        a.city || a.town || a.village,
        a.state
    ].filter(Boolean);

    return parts.join(', ');
}