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

    const frontendUrl = "http://5.223.65.178:5173";
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

// Log an 'opened' event
router.post("/track/open", (req, res) => {
  const { requestId } = req.body;
  if (!requestId) {
    return res.status(400).json({ error: "Request ID is required" });
  }

  try {
    const opened = db
      .prepare(
        "SELECT * FROM tracking_events WHERE request_id = ? and event_type = 'opened'"
      )
      .get(requestId);
    if (!opened) {
      // Get the template_id from the original request
      const originalRequest = db
        .prepare(
          "SELECT template_id FROM tracking_events WHERE request_id = ? LIMIT 1"
        )
        .get(requestId);

      if (originalRequest) {
        const statement = db.prepare(
          "UPDATE tracking_events SET event_type = 'opened' WHERE request_id = ? AND template_id = ?"
        );
        statement.run(requestId, originalRequest.template_id);
      }
    }

    console.log(`Tracking 'opened' event for request ID: ${requestId}`);
    return res
      .status(200)
      .json({ message: "Event tracked successfully", request_id: requestId });
  } catch (error) {
    console.error("Error tracking open event:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router
module.exports = router;
