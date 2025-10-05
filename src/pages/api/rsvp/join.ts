import type { NextApiRequest, NextApiResponse } from "next";
import connect from "@/lib/connect";
import RSVP from "@/models/RSVP";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { userId, hangoutId } = req.body;

    if (!userId || !hangoutId) {
        return res.status(400).json({ message: "Missing userId or hangoutId" });
    }

    try {
        await connect();

        // create RSVP if it doesn’t exist, else update to accepted
        const rsvp = await RSVP.findOneAndUpdate(
            { user: userId, hangout: hangoutId },
            { status: "accepted", respondedAt: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Joined event successfully", rsvp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}
