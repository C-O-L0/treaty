require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");

// Import the database connection
const db = require("../db");

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure AWS S3 client
const s3 = new S3Client({
  endpoint: `https://${process.env.B2_ENDPOINT}`,
  region: process.env.B2_ENDPOINT.split(".")[1], // Extract region from endpoint
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

// Get all testimonials
router.get("/testimonials", (req, res) => {
  const status = req.query.status;
  let statement;

  if (status) {
    statement = db.prepare(
      "SELECT * FROM testimonials WHERE status = ? ORDER BY created_at DESC"
    );
  } else {
    statement = db.prepare(
      "SELECT * FROM testimonials ORDER BY created_at DESC"
    );
  }

  try {
    const testimonials = status ? statement.all(status) : statement.all();
    testimonials.forEach((t) => {
      if (t.answers) {
        // Parse twice to handle double-encoded JSON
        t.answers = JSON.parse(JSON.parse(t.answers));
      }
    });
    res.json(testimonials);
    console.log("GET request received for testimonials.");
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// upload.single("media") middleware to handle file uploads
// Post a new testimonial
router.post("/testimonials", upload.single("media"), async (req, res) => {
  console.log("Received file:", req.file);
  console.log("Request body:", req.body);

  let mediaUrl = null;

  if (req.file) {
    const randomFileName = crypto.randomBytes(16).toString("hex");
    const key = `${randomFileName}-${req.file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    try {
      await s3.send(command);
      mediaUrl = `https://f005.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${key}`;
    } catch (error) {
      console.error("Error uploading file to B2:", error);
      return res.status(500).json({ error: "Failed to upload file" });
    }
  }

  try {
    const { requestId } = req.query;
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }
    const { templateId, answers } = req.body;
    if (!templateId || !answers) {
      return res
        .status(400)
        .json({ error: "Template ID and answers are required" });
    }

    const statement = db.prepare(
      "INSERT INTO testimonials (template_id, answers, media_url) VALUES (?, ?, ?)"
    );

    const result = statement.run(templateId, JSON.stringify(answers), mediaUrl);
    res
      .status(201)
      .json({ id: result.lastInsertRowid, templateId, answers, mediaUrl });
    console.log("New testimonial created:", {
      id: result.lastInsertRowid,
      templateId,
      answers,
      mediaUrl,
    });
    // Check if already submitted and log the 'submitted' event
    const submitted = db
      .prepare(
        "SELECT * FROM tracking_events WHERE request_id = ? AND event_type = 'submitted'"
      )
      .get(requestId);
    if (!submitted) {
      const eventStatement = db.prepare(
        "UPDATE tracking_events SET event_type = 'submitted' WHERE request_id = ? AND template_id = ?"
      );
      eventStatement.run(requestId, templateId);
      console.log(`Tracking 'submitted' event for request ID: ${requestId}`);
    } else {
      console.log(`Request ID ${requestId} already submitted.`);
    }
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Patch a testimonial status
router.patch("/testimonials/:id/status", (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "approved", "rejected"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const statement = db.prepare(
      "UPDATE testimonials SET status = ? WHERE id = ?"
    );
    const result = statement.run(status, req.params.id);
    if (result.change === 0) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.status(200).json({ id: req.params.id, status: status });
    console.log(
      `Testimonial with ID ${req.params.id} updated to status: ${status}`
    );
  } catch (error) {
    console.error("Error updating testimonial status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a testimonial
router.delete("/testimonials/:id", (req, res) => {
  try {
    const statement = db.prepare("DELETE FROM testimonials WHERE id = ?");
    const result = statement.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    res.status(204).send();
    console.log(`Testimonial with ID ${req.params.id} deleted.`);
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router
module.exports = router;
