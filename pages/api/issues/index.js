import { getDb } from "@/data/db";

export default function handler(req, res) {
  try {
    const db = getDb();
    res.status(200).json(db.issues || []);
  } catch (error) {
    console.error("Fetch Issues API error:", error);
    res.status(500).json({ message: "Server error" });
  }
}