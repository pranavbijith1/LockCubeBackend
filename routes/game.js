// @ts-check

import express from "express";
import { Announcer } from "../services/Announcer.js";

const router = express.Router();

const announcer = new Announcer();

router.get("/doomscrolldetect", async (req, res) => {
  setImmediate(() => announcer.userIsDoomscrolling());
  res.status(200).send("ok");
});

router.get("/doomscrolldetectfalse", async (req, res) => {
  setImmediate(() => announcer.userIsNotDoomscrolling());
  res.status(200).send("ok");
});

router.get("/start", async (req, res) => {
  setImmediate(() => announcer.userGaming());
  res.status(200).send("ok");
});

router.get("/stop", async (req, res) => {
  setImmediate(() => announcer.userNotGaming());
  res.status(200).send("ok");
});

export default router;
