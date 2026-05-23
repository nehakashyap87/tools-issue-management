import { getDb, saveDb } from "@/data/db";

export default function handler(req, res) {
  try {
    const db = getDb();

    if (req.method === "GET") {
      return res.status(200).json(db.tools);
    }

    if (req.method === "POST") {
      const { toolName, category, quantity, image } = req.body;

      if (!toolName || !category || quantity === undefined) {
        return res.status(400).json({
          message: "Tool name, category, and quantity are required"
        });
      }

      const newTool = {
        id: Date.now(),
        toolName,
        category,
        quantity: Number(quantity),
        image: image || "/tools/wrench.jpg" // fallback to a default image if not provided
      };

      db.tools.push(newTool);
      saveDb(db);

      return res.status(201).json({
        message: "Tool Added Successfully",
        tool: newTool
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Tools main API error:", error);
    return res.status(500).json({
      message: "Server Error"
    });
  }
}