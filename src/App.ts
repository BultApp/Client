import * as bodyParser from "body-parser";
import * as path from "path";
import { Manager as MasterManager } from "./manager/Manager";
import { Config } from "./routes/Config";
import { Addon } from "./routes/Addons";
import { Install } from "./routes/Install";
import { Bot } from "./routes/Bot";
let upload = require("multer")();
let app = require("express")();
let manager: MasterManager = new MasterManager();
let database = manager.database();

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

app.listen(database.config().port, () => {
    console.log(`Bult Client listening on port ${database.config().port}.`);
});