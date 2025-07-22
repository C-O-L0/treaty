require("dotenv").config();
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001; // React uses 3000

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

// Import the database connection
const db = require("./db");

// Cors
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// API endpoints
// Get all templates
app.get("/api/templates", (req, res) => {
  try {
    const statement = db.prepare("SELECT * FROM templates");
    const templates = statement.all();
    // Parse the JSON string back into an array
    templates.forEach((t) => (t.questions = JSON.parsh(t.questions)));
    res.json(templates);
    console.log("GET request received for all templates.");
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single template by :ID
app.get("/api/templates/:id", (req, res) => {
  try {
    const statement = db.prepare("SELECT * FROM templates where id = ?");
    const template = statement.get(req.params.id);
    if (template) {
      // Parse the JSON string back into an array
      template.questions = JSON.parse(template.questions);
      res.json(template);
      console.log(
        `GET request received for template with ID: ${req.params.id}`
      );
    } else {
      res.status(404).json({ error: "Template not found" });
      console.log(`Template with ID ${req.params.id} not found.`);
    }
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Post a new template
app.post("/api/templates", (req, res) => {
  try {
    const { name, questions } = req.body;
    if (!name || !questions) {
      return res.status(400).json({ error: "Name and questions are required" });
    }

    const statement = db.prepare(
      "INSERT INTO templates (name, questions) VALUES (?, ?)"
    );
    const result = statement.run(name, JSON.stringify(questions));

    res.status(201).json({ id: result.lastInsertRowid, name, questions });
    console.log("New template created:", {
      id: result.lastInsertRowid,
      name,
      questions,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/testimonials", (req, res) => {
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
app.post("/api/testimonials", upload.single("media"), async (req, res) => {
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
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Patch a testimonial status
app.patch("/api/testimonials/:id/status", (req, res) => {
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
app.delete("/api/testimonials/:id", (req, res) => {
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

app.listen(port, () => {
  console.log(`Backend server is listening on http://localhost:${port}`);
});
