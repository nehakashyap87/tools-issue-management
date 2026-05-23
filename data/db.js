import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'db.json');

export function getDb() {
  if (!fs.existsSync(filePath)) {
    const initialDb = {
      users: [
        {
          id: 1,
          email: "mechanic@gmail.com",
          level: "Expert",
          mobile: "7488277334",
          name: "Mechanic",
          password: "Maa@123",
          picture: "/register/user-icon.webp",
          role: "mechanic"
        },
        {
          id: 2,
          email: "admin@gmail.com",
          level: "Expert",
          mobile: "0000000000",
          name: "System Admin",
          password: "Admin@123",
          picture: "/register/user-icon.webp",
          role: "admin"
        }
      ],
      tools: [
        { id: 1, toolName: "Hammer", category: "Hammer", quantity: 5, image: "/tools/hammer-tool.jpg" },
        { id: 2, toolName: "Screw Driver", category: "Screw Driver", quantity: 8, image: "/tools/screw-driver.png" },
        { id: 3, toolName: "Wrench", category: "Wrench", quantity: 4, image: "/tools/wrench.jpg" },
        { id: 4, toolName: "Plier", category: "Plier", quantity: 6, image: "/tools/plier.jfif" }
      ],
      issues: []
    };
    // Ensure data directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading db.json, returning empty structure:", error);
    return { users: [], tools: [], issues: [] };
  }
}

export function saveDb(db) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing to db.json:", error);
  }
}
