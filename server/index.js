require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connect } = require("./db");
const router = require("./Routes/index");

const app = express();
const port = Number(process.env.PORT || 8000);

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "InternArea API is running" });
});

app.use("/api", router);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error("Unhandled API error:", error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  try {
    await connect();
    const server = app.listen(port, () => {
      console.log(`InternArea API listening on port ${port}`);
    });
    return server;
  } catch (error) {
    console.error("Server startup failed because MongoDB could not connect:", error);
    process.exitCode = 1;
    return null;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
