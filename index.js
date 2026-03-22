import "dotenv/config";

import express from "express";
import cors from "cors";

const app = express().use(cors()).use(express.json());

// routes
import gameRoutes from "./routes/game.js";

app.get("/", (_req, res) => {
  res.send("This is a server");
});

app.use("/game", gameRoutes);

app.listen(5001, () => {
  console.log(`Server running on port ${5001}`);
});
