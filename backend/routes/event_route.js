require("dotenv").config();
const express = require("express");
const router = express.Router();
const crypto = require("crypto");

// Import the database connection
const db = require("../db");

// Get trackable URL for a specific template
router.post("/request", (req, res) => {
  const { templateId } = req.body;
  if (!templateId) {
    return res.status(400).json({ error: "Template ID is required" });
  }

  const requestId = crypto.randomUUID();
  const eventType = "generated";

  try {
    const statement = db.prepare(
      "INSERT INTO tracking_events (request_id, template_id, event_type) VALUES (?, ?, ?)"
    );
    result = statement.run(requestId, templateId, eventType);

    const frontendUrl = process.env.FRONTEND_API_URL || "http://localhost:5173"; // Default to local development URL
    const trackableUrl = `${frontendUrl}/submit?requestId=${requestId}&templateId=${templateId}`;
    console.log("New event request created:", {
      requestId,
      templateId,
      eventType,
      trackableUrl,
    });
    res.status(201).json({
      requestId,
      templateId,
      eventType,
      trackableUrl,
    });
  } catch (error) {
    console.error("Error creating event request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Analyze the tracking events
router.get("/track/analyze", (req, res) => {
  try {
    const generated = db
      .prepare(
        "SELECT COUNT(*) as count FROM tracking_events WHERE event_type = 'generated'"
      )
      .get().count;
    const opened = db
      .prepare(
        "SELECT COUNT(*) as count FROM tracking_events WHERE event_type = 'opened'"
      )
      .get().count;
    const submitted = db
      .prepare(
        "SELECT COUNT(*) as count FROM tracking_events WHERE event_type = 'submitted'"
      )
      .get().count;

    const openRate = generated > 0 ? (opened / generated) * 100 : 0;
    const submitRate = generated > 0 ? (submitted / generated) * 100 : 0;

    res.json({
      generated,
      opened,
      submitted,
      openRate: openRate.toFixed(2),
      submitRate: submitRate.toFixed(2),
    });
  } catch (error) {
    console.error("Error analyzing tracking events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router
module.exports = router;
