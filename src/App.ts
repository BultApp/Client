require("dotenv").config({
    path: "./config/app.config"
});

var console: Console = require("better-console");   
const fs = require("fs");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const express = require("express");
const app = express();

import { Bot, Installer } from "./manager/Bot";

let BotManager: Bot = new Bot();
let InstallerManager: Installer = new Installer();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(unless("/install", (req: any, res: any, next: any) => {
    if(InstallerManager.installed()) {
        next();
    }

    res.redirect("/install");
}));

app.set("view engine", "pug");
app.set("views", "./views");

app.get("/", (req: any, res: any) => {
    res.render("index", {
        title: "Dashboard",
        running: BotManager.running(),
    });
});

app.get("/install", (req: any, res: any) => {
    res.render("install");
});

app.post("/install", upload.array(), (req: any, res: any) => {
    setTimeout(() =>  {
        if(InstallerManager.install()) {
            res.json({
                installed: true
            });
        } else {
            res.json({
                installed: false
            })
        }
    }, 5000);
});

app.post("/bot/start", upload.array(), (req: any, res: any) => {
    if(BotManager.start()) {
        res.redirect("/?started=true");
    } else {
        res.redirect("/")
    }
});

app.post("/bot/stop", upload.array(), (req: any, res: any) => {
    if(BotManager.stop()) {
        res.redirect("/?stopped=true");
    } else {
        res.redirect("/")
    }
});

app.get("/config", (req: any, res: any) => {
    let data = fs.readFileSync("./.env");
    let buf = Buffer.from(data);
    let env = dotenv.parse(buf);
    res.render("config", {
        title: "Configuration",
        saved: (req.query.saved != undefined),
        env: env,
    })
});

app.post("/config", upload.array(), (req: any, res: any) => {
    let envData = `BOT_KEY="${req.body.botKey}"
BOT_SECRET="${req.body.botSecret}"
USER_ID="${req.body.userId}"
COMMAND_PREFIX="${req.body.commandPrefix}"
ADDON_FOLDER="${req.body.addonFolder}"`

    fs.writeFileSync("./.env", envData, {
        encoding: "utf8",
        flag: "w"
    });

    res.redirect("/config?saved=true");
});

app.listen(process.env.EXPRESS_PORT, () => {
    console.info("Bult Client listening on port", process.env.EXPRESS_PORT, ".");
});

function unless(path: string, middleware: any): any
{
    return function(req: any, res: any, next: any) {
        if (path === req.path) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
}