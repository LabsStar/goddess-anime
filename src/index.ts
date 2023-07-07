import express from "express";
const app = express();
import cron from "node-cron";
import bodyParser from "body-parser";
import { URLSearchParams } from "url";
import cookieParser from "cookie-parser";
import path from "path";
import ejs, { render } from "ejs";
import axios from "axios";
import { config } from "dotenv";
config()
import getuser from "./services/domainGetter";
import { makePort } from "./services/portgiver";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.set("trust proxy", 1);
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "Hyperstar");
  next();
});

const args = process.argv.slice(2);

const port = () => {
  if (args[0] === "--random-port") {
    return makePort();
  } else {
    return process.env.PORT || 4375;
  }
};

const dPort = port();

app.get("/:username?", async (req, res) => {
    const username = req.params.username;

    if (!username) return res.redirect("https://goddessanime.com")

    console.log(req.hostname)
    
    await getuser(username.toLowerCase(), req.hostname, req, res);
});

app.get("*", (req, res) => {
  res.redirect("https://goddessanime.com");
});

app.listen(dPort, () => {
  console.log(
    `Goddess Anime is listening at http://localhost:${dPort}`
  );
});
