import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

    try {
        // OpenStreetMap Nominatim reverse geocode
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const r = await fetch(url, {
            headers: { 'User-Agent': 'HangOut/1.0 (contact: you@example.com)' }
        });
        if (!r.ok) return res.status(502).json({ error: 'geocoder failed' });

        const data = await r.json();
        // pick the best available city-like field
        const c =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.hamlet ||
            data?.address?.county ||
            '';
        return res.status(200).json({ city: c });
    } catch (e) {
        return res.status(500).json({ error: 'reverse geocode error' });
    }
}
