import { getAddress } from '../services/geocode.service.js';

export async function reverseGeocode(req, res) {
    const { lat, lng } = req.query;

    const address = await getAddress(lat, lng);

    res.json({ address });
}