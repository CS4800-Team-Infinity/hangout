import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const placeId = String(req.query.placeId || "");
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!placeId) return res.status(400).json({ error: "Missing placeId" });

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${key}`;

    const r = await fetch(url);
    const json = await r.json();

    if (!json.result) return res.status(200).json({});

    const result = json.result;

    res.status(200).json({
      name: result.name,
      address: result.formatted_address,
      lat: result.geometry.location.lat,
      lon: result.geometry.location.lng,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch place details" });
  }
}
