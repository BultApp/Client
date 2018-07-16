require("dotenv").config({
    path: "./config/app.config"
});

import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as path from "path";
import * as request from "request";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import { Bot, Installer } from "./manager/Bot";
import { FileManager } from "./manager/File";
import { Ember } from "./manager/Ember"; 
import * as validator from "validator";
import { Process } from "./manager/Process";

var console: Console = require("better-console");
const multer = require("multer");
const axios = require("axios");
const upload = multer();
const app = express();

let BotManager: Bot = new Bot();
let InstallerManager: Installer = new Installer();
let EmberManager: Ember = new Ember();
let ProcessManager: Process = new Process(EmberManager);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middlware to check if installed.
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

// Middleware to check if Ember is running.
app.use((req: any, res: any, next: any) => {
    if(req.path == "/addons") {
        if(!EmberManager.running()) {
            EmberManager.start();
            next();
        }

        next();
    }

    next();
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
    let addonpath = BotManager.env().ADDON_FOLDER;
    let folders = FileManager.getFolders(path.join(__dirname, "..", addonpath));

    folders.forEach((name) => {
        addons[name] = {};

        let files = fs.readdirSync(path.join(__dirname, "..", addonpath, name));
        
        files.forEach((file) => {
            if(!fs.statSync(path.join(__dirname, "..", addonpath, name, file)).isDirectory() && (file.toLowerCase() == "package.json")) {
                let content = fs.readFileSync(path.join(__dirname, "..", addonpath, name, file));

                addons[name] = JSON.parse(content.toString());
            }
        });
    });

    res.render("addons", {
        title: "Addons",
        addons: addons,
    });
});

app.post("/addons/remove", upload.array(), (req: any, res: any) => {
    fs.unlink(path.join(__dirname, "..", "addons", req.body.addonFolder), (err) => {
        if(err) {
            console.log(err);
            return res.redirect("/addons?removed=false&addonFolder=" + req.body.addonFolder);
        }

        return res.redirect("/addons?removed=true");
    });
});

app.post("/addons/ember/install", upload.array(), (req: any, res: any) => {
    if(!validator.isURL(req.body.zipURL)) {
        return res.redirect("/addons?failed=true&badURL=true");   
    }

    let filename = (new Date().valueOf().toString());
    let addonpath = BotManager.env().ADDON_FOLDER;

    EmberManager.addon().install(req.body.zipURL, filename, path.join(__dirname, "..", addonpath))
        .then((message) => {
            console.log(message);

            return res.redirect("/addons?installed=true");
        })
        .catch((message) => {
            console.log(message);

            return res.redirect("/addons?failed=true&tgzURL=" + req.body.zipURL);
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
    console.info("Bult Client listening on port " + process.env.EXPRESS_PORT + ".");
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