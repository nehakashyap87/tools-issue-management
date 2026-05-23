import { getDb, saveDb } from "@/data/db";

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {
    const {
      name,
      email,
      mobile,
      password,
      level,
      picture
    } = req.body;

    // Server-side validation
    if (!name || !email || !mobile || !password || !level) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const db = getDb();

    const emailExists = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const mobileExists = db.users.find(
      (u) => u.mobile === mobile
    );

    if (mobileExists) {
      return res.status(400).json({
        message: 'Mobile number already exists'
      });
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      mobile,
      password, // In production we would hash this, but simple text matches the task requirements
      level,
      picture: picture || '/register/user-icon.webp',
      role: 'mechanic'
    };

    db.users.push(newUser);
    saveDb(db);

    return res.status(201).json({
      message: 'Registered Successfully',
      user: newUser
    });
  } catch (error) {
    console.error("Register API error:", error);
    return res.status(500).json({
      message: "Server Error"
    });
  }
}