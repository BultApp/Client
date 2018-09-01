import * as bodyParser from "body-parser";
import * as path from "path";
import * as Session from "express-session";
import { Manager as MasterManager } from "./manager/Manager";
import { Config } from "./routes/Config";
import { Addon } from "./routes/Addons";
import { Install } from "./routes/Install";
import { Bot } from "./routes/Bot";
import { ServerMode } from "./routes/ServerMode";
let upload = require("multer")();
let app = require("express")();
let toTime = require("to-time");
let manager: MasterManager = new MasterManager();
let database = manager.database();
let ipAddr = "";
let userId = "";

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "..", "views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Check if in server mode.
if (database.config().serverMode.active) {
    console.log("Server mode is active. If you didn't mean to do this, please exit and disable it.");
    console.log("Server mode is an advanced mode that is meant to be ran on servers. Only those who know how to use this should enable it.");

    let config = database.config().serverMode;

    app.use(Session({
        secret: config.session.secret,
        resave: true,
        saveUninitialized: false,
        cookie: {
            secure: config.session.cookie.secure,
            maxAge: toTime.fromMinutes(config.session.cookie.lifetime).ms()
        }
    }));

    app.use((req: any, res: any, next: any) => {
        if (req.path !== "/serverLogin") {
            if (req.session.loggedIn) {
                next();
            } else {
                res.redirect("/serverLogin");
            }
        } else if (req.path === "/serverLogin") {
            if (req.session.loggedIn) {
                res.redirect("/");
            } else {
                next();
            }
        } else {
            res.redirect("/serverLogin");
        }
    });

    app.get("/serverLogin", ServerMode.getLogin.bind(ServerMode.getLogin));
    app.post("/serverLogin", upload.array(), ServerMode.postLogin.bind(ServerMode.postLogin));
}

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

// Middleware to pass layout variables.
app.use((req: any, res: any, next: any) => {
    res.locals.ipAddress = ipAddr;
    res.locals.userId = userId;

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

app.listen(database.config().port, () => {
    console.log(`Bult Client listening on port ${database.config().port}.`);

    manager.ip().getIp().then((ip) => {
        ipAddr = `${ip}:${database.config().port}`;
    });

    userId = manager.bot().env().USER_ID;
});