import * as express from "express";
import * as validator from "validator";
import * as path from "path";
import * as rimraf from "rimraf";
import * as fs from "fs";
import { File } from "../manager/File";
import { Manager } from "../manager/Manager";

export class Addon {
    public static postEmberInstall(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!validator.isURL(req.body.zipURL)) {
            return res.redirect("/addons?failed=true&badURL=true");   
        }
    
        let filename = (new Date().valueOf().toString());
        let addonpath = Manager.get().bot().env().ADDON_FOLDER;
     
        Manager.get().ember().addon().install(req.body.zipURL, filename, process.cwd() + "/" + addonpath)
            .then((message) => {
                console.log(message);
    
                return res.redirect("/addons?installed=true");
            })
            .catch((message) => {
                console.log(message);
    
                return res.redirect("/addons?failed=true&zipURL=" + req.body.zipURL);
            });
    }

    public static postRemove(req: express.Request, res: express.Response, next: express.NextFunction) {
        rimraf(path.join(__dirname, "..", "..", Manager.get().bot().env().ADDON_FOLDER, req.body.addonFolder), (err) => {
            if (err) {
                console.log(err);
                return res.redirect("/addons?removed=false&addonFolder=" + req.body.addonFolder);
            }
    
            return res.redirect("/addons?removed=true");
        });
    }

    public static getAddons(req: express.Request, res: express.Response, next: express.NextFunction) {
        let addons: any = {};
        let addonpath = Manager.get().bot().env().ADDON_FOLDER;
        let folders = File.getFolders(addonpath);

        folders.forEach((name) => {
            addons[name] = {};

            let files = fs.readdirSync(path.join(addonpath, name));
            
            files.forEach((file) => {
                if (!fs.statSync(addonpath + "/" + name + "/" + file).isDirectory() && (file.toLowerCase() === "package.json")) {
                    let content = fs.readFileSync(addonpath + "/" + name + "/" + file);

                    addons[name] = JSON.parse(content.toString());
                }
            });
        });

        res.render("addons", {
            title: "Addons",
            addons: addons,
        });
    }
}