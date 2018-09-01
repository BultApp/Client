import * as express from "express";

export class ServerMode {
    public static getLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
        res.render("serverLogin");
    }

    public static postLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
        //
    }
}