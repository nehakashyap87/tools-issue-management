import { getDb, saveDb } from "@/data/db";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { toolId, mid, mechanicName } = req.body;

    if (!toolId) {
      return res.status(400).json({ message: "Tool ID is required" });
    }

    const db = getDb();

    // Find the tool
    const toolIndex = db.tools.findIndex((t) => t.id === Number(toolId));
    if (toolIndex === -1) {
      return res.status(404).json({ message: "Tool not found" });
    }

    const tool = db.tools[toolIndex];
    if (tool.quantity <= 0) {
      return res.status(400).json({ message: "Tool out of stock" });
    }

    // Find mechanic details if mid is available
    let level = "Unknown";
    let mechanicIdVal = mid;
    let finalMechanicName = mechanicName || "Mechanic";

    if (mid) {
      const mechanic = db.users.find((u) => u.id === Number(mid));
      if (mechanic) {
        level = mechanic.level;
        finalMechanicName = mechanic.name;
        mechanicIdVal = mechanic.id;
      }
    } else if (mechanicName) {
      // Fallback: look up by name
      const mechanic = db.users.find((u) => u.name.toLowerCase() === mechanicName.toLowerCase());
      if (mechanic) {
        level = mechanic.level;
        mechanicIdVal = mechanic.id;
        finalMechanicName = mechanic.name;
      }
    }

    if (!mechanicIdVal) {
      return res.status(400).json({ message: "A valid mechanic must be selected" });
    }

    // Update inventory
    db.tools[toolIndex].quantity = tool.quantity - 1;

    // Record issue transaction
    const newIssue = {
      id: Date.now(),
      toolId: tool.id,
      toolName: tool.toolName,
      mid: Number(mechanicIdVal),
      mechanicName: finalMechanicName,
      mechanicLevel: level,
      issueDate: new Date().toISOString(),
      returnDate: null,
      status: "Issued"
    };

    db.issues.push(newIssue);
    saveDb(db);

    return res.status(200).json({
      message: `Tool "${tool.toolName}" issued successfully to ${finalMechanicName}.`,
      issue: newIssue
    });
  } catch (error) {
    console.error("Issue Tool API error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
}