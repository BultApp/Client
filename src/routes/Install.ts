import * as express from "express";
import { Manager } from "../manager/Manager";

export class Install {
    public static getInstall(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.render("install");
    }

    public static postInstall(req: express.Request, res: express.Response, next: express.NextFunction) {
        Manager.get().installer().install().then(() => {
            if (req.body.bult !== null) {
                let db = Manager.get().database().database();

                let expiresIn = Math.floor(req.body.bult.expires_in / 1.01);
                let expiresAt = Date.now() + expiresIn;

                db.set("web.expires_at", expiresAt).write();
                db.set("web.access_token", req.body.bult.access_token).write();
                db.set("web.refresh_token", req.body.bult.refresh_token).write();
            } else {
                Manager.get().database().database().set("web", {}).write();
            }

            res.json({
                installed: true
            });
        }).catch((err) => {
            console.log(err);
            res.json({
                installed: false,
                error: err,
            });
        });
    }
}