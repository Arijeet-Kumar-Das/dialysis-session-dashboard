import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Session from "../models/Session";

/**
 * One-time cleanup script to remove duplicate sessions created by
 * the seed script before the dedup fix. Keeps the first session per
 * (patientId + scheduledDate) combination and deletes the rest.
 */
async function cleanup() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set in .env");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Find groups with duplicates
    const dupes = await Session.aggregate([
        {
            $group: {
                _id: { patientId: "$patientId", scheduledDate: "$scheduledDate" },
                ids: { $push: "$_id" },
                count: { $sum: 1 },
            },
        },
        { $match: { count: { $gt: 1 } } },
    ]);

    let totalDeleted = 0;

    for (const group of dupes) {
        // Keep the first one, delete the rest
        const [keep, ...remove] = group.ids;
        await Session.deleteMany({ _id: { $in: remove } });
        totalDeleted += remove.length;
        console.log(`  Cleaned ${remove.length} duplicate(s) for group (${group._id.scheduledDate})`);
    }

    console.log(`\nRemoved ${totalDeleted} duplicate sessions (${dupes.length} groups cleaned)`);
    await mongoose.disconnect();
}

cleanup().catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
});
