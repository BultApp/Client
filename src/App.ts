require("dotenv").config({
    path: "./config/app.config"
});

var console: Console = require("better-console");   
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const express = require("express");
const app = express();
const path = require("path");

import * as fs from "fs";
import { Bot, Installer } from "./manager/Bot";
import { FileManager } from "./manager/File";

let BotManager: Bot = new Bot();
let InstallerManager: Installer = new Installer();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req: any, res: any, next: any) => {
    if(req.path == "/install") {
        if(InstallerManager.installed()) {
            res.redirect("/");
        } else {
            next();
        }
    } else if(InstallerManager.installed()) {
        next();
    } else {
        res.redirect("/install");
    }
});

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "..","views"));

app.get("/", (req: any, res: any) => {
    res.render("index", {
        title: "Dashboard",
        running: BotManager.running(),
        started: (req.query.started != undefined),
        stopped: (req.query.stopped != undefined),
    });
});

app.get("/install", (req: any, res: any) => {
    res.render("install");
});

app.post("/install", upload.array(), (req: any, res: any) => {
    InstallerManager.install().then(() => {
        res.json({
            installed: true
        })
    }).catch((err) => {
        console.log(err);
        res.json({
            installed: false,
            error: err,
        });
    });
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

app.get("/addons", (req: any, res: any) => {
    let addons: any = {};
    let folders = FileManager.getFolders(path.join(__dirname, "..", "addons"));

    folders.forEach((name) => {
        addons[name] = {};

        let files = fs.readdirSync(path.join(__dirname, "..", "addons", name));
        
        files.forEach((file) => {
            if(!fs.statSync(path.join(__dirname, "..", "addons", name, file)).isDirectory() && (file.toLowerCase() == "package.json")) {
                let content = fs.readFileSync(path.join(__dirname, "..", "addons", name, file));

                addons[name] = JSON.parse(content.toString());
            }
        });
    });

    res.render("addons", {
        title: "Addons",
        addons: addons,
    });
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