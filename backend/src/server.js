require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        project: "IoT Shoe Dryer",
        message: "Backend API is running",
        status: "OK"
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "iot-shoedryer-backend",
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`IoT Shoe Dryer Backend running on port ${PORT}`);
});
