const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001; // React uses 3000

// Middleware to parse JSON
app.use(express.json());

// Cors
app.use(cors());

// In memory template
let templates = [
	{
		id: 1,
		name: "Default Client Testimonial",
		questions: [
		"What was the primary problem you were facing before using our service?",
		"What was the most significant benefit you've seen since implementation?",
		"How would you rate our service on a scale of 1 to 10?",
		]
	},
];

// API endpoints 
// Get all templates
app.get('/api/templates', (req, res) => {
	console.log('Get request received for all templates');
	res.json(templates);
});

// Get a single template by :ID
app.get('/api/templates/:id', (req, res) => {
	const templateId = parseInt(req.params.id);
	const template = templates.find(t => t.id === templateId);
	if (template) {
		console.log(`GET request received for template ID: ${templateId}`);
		res.json(template);
	} else {
    		console.log(`Template with ID: ${templateId} not found.`);
		res.status(404).json({ error: "Template not found" });
  	}
});

// Post a new template
app.post('/api/templates', (req, res) => {
	const newTemplate = req.body;
	// Basic validation
	if (!newTemplate.name || !newTemplate.questions) {
		return res.status(400).json({ error: 'Name and questions are required!'});
	}
	newTemplate.id = Date.now();
	templates.push(newTemplate);
	
	console.log('POST request received. New template created:', newTemplate);
  	res.status(201).json(newTemplate);
});

app.listen(port, () => {
	console.log(`Backend server is listening on http://localhost:${port}`);
});

