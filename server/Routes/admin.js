const express = require("express");
const router = express.Router();
const { createAdminToken, requireAdmin } = require("../Middleware/auth");

router.get("/me", requireAdmin, (req, res) => {
  return res.status(200).json({ authenticated: true, role: "admin" });
});

router.post("/adminLogin", (req, res) => {
  const { username, password } = req.body || {};
  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredUsername || !configuredPassword) {
    return res.status(500).json({ error: "Admin credentials are not configured on the server" });
  }

  if (username !== configuredUsername || password !== configuredPassword) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  try {
    const token = createAdminToken(username);
    return res.status(200).json({ token, message: "Admin login successful" });
  } catch (error) {
    return res.status(500).json({ error: "Admin authentication is not configured correctly" });
  }
});

module.exports = router;
