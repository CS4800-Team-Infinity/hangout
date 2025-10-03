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

        // Instead of deleting, update RSVP to "declined":
        //    - Keeps a history that this user once interacted with the event.
        //    - Lets the host track analytics (e.g., “10 declined, 50 accepted”).
        //    - Makes it easy if they want to rejoin later (just update back to "accepted").

        const rsvp = await RSVP.findOneAndUpdate(
            { user: userId, hangout: hangoutId },
            { status: "declined", respondedAt: new Date() },
            { new: true }
        );

        if (!rsvp) {
            return res.status(404).json({ message: "RSVP not found" });
        }

        res.status(200).json({ message: "Left event successfully", rsvp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}
