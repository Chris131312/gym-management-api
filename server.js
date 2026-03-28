const express = require("express");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gym Management API is running smoothly.",
  });
});

app.listen(PORT, () => {
  console.log(`Server is up and running on the http://localhost:${PORT}`);
});
