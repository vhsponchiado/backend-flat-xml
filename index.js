const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require("morgan");

// Import routes module
const routes = require('./src/routes/routes');

// Create an instance of Express
const app = express();

// Define an array to store allowed origins
const allowedOrigins = [];

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    allowedOrigins.push("http://localhost:5173");

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

// Enable logging using Morgan middleware
app.use(morgan("dev"));

// Parse URL-encoded bodies and JSON in requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use the defined routes
app.use("", routes);

// Start the server and listen on the specified port
const PORT = 5173;
app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}.`);
});
