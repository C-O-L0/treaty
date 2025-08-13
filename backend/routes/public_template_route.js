const express = require("express");
const router = express.Router();

// Import the database connection
const db = require("../db");

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

module.exports = router;
