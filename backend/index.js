const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001; // React uses 3000

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

// Post a new testimonial
app.post("/api/testimonials", (req, res) => {
  try {
    const { templateId, answers } = req.body;
    if (!templateId || !answers) {
      return res
        .status(400)
        .json({ error: "Template ID and answers are required" });
    }

    const statement = db.prepare(
      "INSERT INTO testimonials (template_id, answers) VALUES (?, ?)"
    );

    const result = statement.run(templateId, JSON.stringify(answers));
    res.status(201).json({ id: result.lastInsertRowid, templateId, answers });
    console.log("New testimonial created:", {
      id: result.lastInsertRowid,
      templateId,
      answers,
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Backend server is listening on http://localhost:${port}`);
});
