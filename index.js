const express = require("express");
const cors = require("cors");
const app = express(); 

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is a server");
});

const gameRoutes = require("./routes/game");
app.use("/game", gameRoutes);

app.listen(5001, () => {
  console.log(`Server running on port ${5001}`);
});