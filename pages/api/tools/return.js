import { getDb, saveDb } from "@/data/db";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const { issueId } = req.body;

    if (!issueId) {
      return res.status(400).json({ message: "Issue ID is required" });
    }

    const db = getDb();

    // Find the issue
    const issueIndex = db.issues.findIndex((i) => i.id === Number(issueId));
    if (issueIndex === -1) {
      return res.status(404).json({
        message: "Issue record not found",
      });
    }

    const issue = db.issues[issueIndex];
    if (issue.status === "Returned") {
      return res.status(400).json({
        message: "Tool already returned",
      });
    }

    // Mark as returned
    db.issues[issueIndex].status = "Returned";
    db.issues[issueIndex].returnDate = new Date().toISOString();

    // Increment inventory quantity
    const toolIndex = db.tools.findIndex((t) => t.id === Number(issue.toolId));
    if (toolIndex !== -1) {
      db.tools[toolIndex].quantity += 1;
    } else {
      // Fallback matching by name
      const fallbackIndex = db.tools.findIndex((t) => t.toolName === issue.toolName);
      if (fallbackIndex !== -1) {
        db.tools[fallbackIndex].quantity += 1;
      }
    }

    saveDb(db);

    return res.status(200).json({
      message: `Tool "${issue.toolName}" returned successfully.`,
      issue: db.issues[issueIndex],
    });
  } catch (error) {
    console.error("Return Tool API error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}