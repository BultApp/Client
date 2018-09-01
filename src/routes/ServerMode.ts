import * as express from "express";
import * as bcrypt from "bcryptjs";
import { Manager } from "../manager/Manager";

export class ServerMode {
    public static getLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.render("serverLogin");
    }

    public static postLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
        bcrypt.compare(req.body.password, Manager.get().database().config().serverMode.password)
            .then((success) => {
                if (success) {
                    req.session.loggedIn = true;

                    res.redirect("/");
                } else {
                    res.redirect("/serverLogin");
                }
            });
    }
}