import * as express from "express";
import { Manager } from "../manager/Manager";

export class Bot
{
    public static postStart(req: express.Request, res: express.Response, next: express.NextFunction) {
        if(Manager.get().bot().start()) {
            res.redirect("/?started=true");
        } else {
            res.redirect("/")
        }
    }

    public static postStop(req: express.Request, res: express.Response, next: express.NextFunction) {
        if(Manager.get().bot().stop()) {
            res.redirect("/?stopped=true");
        } else {
            res.redirect("/")
        }
    }
}