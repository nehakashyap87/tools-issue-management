import { getDb } from "@/data/db";

export default function handler(req, res) {
  try {
    const db = getDb();
    const mechanics = db.users.filter(u => u.role === 'mechanic');
    res.status(200).json(mechanics);
  } catch (error) {
    console.error("Fetch Mechanics API error:", error);
    res.status(500).json({ message: "Server error" });
  }
}