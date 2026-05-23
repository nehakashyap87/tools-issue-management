import { getDb } from "@/data/db";

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const db = getDb();

    // Check email/password in DB
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Return authenticated user details (excluding password for security, though let's keep it simple)
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        level: user.level,
        picture: user.picture,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login API error:", error);
    return res.status(500).json({
      message: "Server Error"
    });
  }
}