import express from "express";
import cron from "node-cron";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import ejs from "ejs";
import axios from "axios";
import { config } from "dotenv";
import getuser from "./services/domainGetter";
import { makePort } from "./services/portgiver";

config();

const app = express();
const args = process.argv.slice(2);
const port = args[0] === "--random-port" ? makePort() : process.env.PORT || 4375;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "Hyperstar");
  next();
});

app.get("/:username?", async (req, res) => {
  const username = req.params.username;

  if (!username) return res.redirect("https://goddessanime.com");

  console.log(req.hostname);

  await getuser(username.toLowerCase(), req.hostname, req, res);
});

app.get("*", (req, res) => {
  res.redirect("https://goddessanime.com");
});

app.listen(port, () => {
  console.log(`Goddess Anime is listening at http://localhost:${port}`);
});
