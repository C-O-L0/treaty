require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const templateRoute = require("./routes/template_route");
const testimonialRoute = require("./routes/testimonial_route");
const widgetRoute = require("./routes/widget_route");
const eventRoute = require("./routes/event_route");

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Cors
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// API endpoints
// Template routes
app.use("/api", templateRoute);
// Testimonial routes
app.use("/api", testimonialRoute);
// Widget routes
app.use("/api", widgetRoute);
// Event routes
app.use("/api", eventRoute);

app.listen(port, () => {
  console.log(`Backend server is listening on http://localhost:${port}`);
});
