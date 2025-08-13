require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const templateRoute = require("./routes/template_route");
const publicTemplateRoute = require("./routes/public_template_route");
const testimonialRoute = require("./routes/testimonial_route");
const widgetRoute = require("./routes/widget_route");
const eventRoute = require("./routes/event_route");
const publicEventRoute = require("./routes/public_event_route");
const authRoute = require("./routes/auth_route");
const authToken = require("./middlewares/authToken");

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Cors
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Authentication routes
app.use("/api", authRoute);

// Public template routes
app.use("/api/", publicTemplateRoute);

// Public event routes
app.use("/api", publicEventRoute);

// Middleware to authenticate routes
app.use(authToken);

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
