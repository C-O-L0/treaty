require("dotenv").config();
const express = require("express");
const router = express.Router();

const db = require("../db");

// Log an 'opened' event
router.post("/track/open", (req, res) => {
  const { requestId } = req.body;
  if (!requestId) {
    return res.status(400).json({ error: "Request ID is required" });
  }

  try {
    const eventType = db
      .prepare("SELECT event_type FROM tracking_events WHERE request_id = ?")
      .get(requestId);
    if (!eventType) {
      return res.status(404).json({ error: "Request ID not found" });
    } else if (eventType.event_type === "opened") {
      return res.status(200).json({ message: "Event already tracked" });
    } else if (eventType.event_type === "submitted") {
      return res.status(200).json({ message: "Event already tracked" });
    } else {
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

module.exports = router;
