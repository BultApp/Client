import * as express from "express";
import { Manager } from "../manager/Manager";

export class Install {
    public static getInstall(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.render("install");
    }

    public static postInstall(req: express.Request, res: express.Response, next: express.NextFunction) {
        Manager.get().installer().install().then(() => {
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