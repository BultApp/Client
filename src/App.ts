import * as fs from "fs";
import * as bodyParser from "body-parser";
import * as path from "path";
import { Manager as MasterManager } from "./manager/Manager";
import { Config } from "./routes/Config";
import { Addon } from "./routes/Addons";
import { Install } from "./routes/Install";
import { Bot } from "./routes/Bot";
let fileExists = require("file-exists");
let upload = require("multer")();
let app = require("express")();

if (!fileExists.sync(path.join(__dirname, "..", "config", "app.config"))) {
    console.log("Bult configuration file not found, writing base configuration.");
    
    fs.writeFileSync(path.join(__dirname, "..", "config", "app.config"), "EXPRESS_PORT=7285", {
        encoding: "utf8",
        flag: "w"
    });
}

require("dotenv").config({
    path: "./config/app.config"
});

let manager: MasterManager = new MasterManager();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "..", "views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middlware to check if installed.
app.use((req: any, res: any, next: any) => {
    if (req.path === "/install") {
        if (manager.installer().installed()) {
            res.redirect("/");
        } else {
            next();
        }
    } else if (manager.installer().installed()) {
        next();
    } else {
        res.redirect("/install");
    }
});

// Middleware to check if Ember is running.
app.use((req: any, res: any, next: any) => {
    if (req.path === "/addons") {
        if (!manager.ember().running()) {
            manager.ember().start();
            next();
        }

        next();
    }

    next();
});

app.get("/", (req: any, res: any) => {
    res.render("index", {
        title: "Dashboard",
        running: manager.bot().running(),
        started: (req.query.started !== undefined),
        stopped: (req.query.stopped !== undefined),
    });
});

app.get("/install", Install.getInstall.bind(Install.getInstall));
app.post("/install", upload.array(), Install.postInstall.bind(Install.postInstall));

app.post("/bot/start", upload.array(), Bot.postStart.bind(Bot.postStart));
app.post("/bot/stop", upload.array(), Bot.postStop.bind(Bot.postStop));

app.get("/addons", Addon.getAddons.bind(Addon.getAddons));
app.post("/addons/remove", upload.array(), Addon.postRemove.bind(Addon.postRemove));
app.post("/addons/ember/install", upload.array(), Addon.postEmberInstall.bind(Addon.postEmberInstall));

app.get("/config", Config.getConfig.bind(Config.getConfig));
app.post("/config", upload.array(), Config.postConfig.bind(Config.postConfig));

app.listen(process.env.EXPRESS_PORT, () => {
    console.log("Bult Client listening on port " + process.env.EXPRESS_PORT + ".");
});