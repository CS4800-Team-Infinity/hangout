import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(200).json({ suggestions: [] });

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=7&q=${encodeURIComponent(
      q
    )}`;
    const r = await fetch(url, {
      headers: {
        "User-Agent": "HangOut/1.0 (contact: gethangout.team@gmail.com)",
      },
    });
    if (!r.ok) return res.status(502).json({ suggestions: [] });

    const data = await r.json();
    const suggestions = (data || []).map((it: any) => ({
      id: it.place_id,
      label: it.display_name as string,
      city:
        it.address?.city ||
        it.address?.town ||
        it.address?.village ||
        it.address?.hamlet ||
        "",
      lat: it.lat,
      lon: it.lon,
    }));
    res.status(200).json({ suggestions });
  } catch {
    res.status(200).json({ suggestions: [] });
  }
}
