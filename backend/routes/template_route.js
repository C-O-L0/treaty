const express = require("express");
const router = express.Router();

// Import the database connection
const db = require("../db");

// Get all templates
router.get("/templates", (req, res) => {
  try {
    const statement = db.prepare("SELECT * FROM templates");
    const templates = statement.all();
    // Parse the JSON string back into an array
    templates.forEach((t) => (t.questions = JSON.parse(t.questions)));
    res.json(templates);
    console.log("GET request received for all templates.");
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single template by :ID
router.get("/templates/:id", (req, res) => {
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
router.post("/templates", (req, res) => {
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

// Export the router to use in the main app
module.exports = router;
