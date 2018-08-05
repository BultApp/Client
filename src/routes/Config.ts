import * as express from "express";
import * as dotenv from "dotenv";
import * as fs from "fs";

export class Config {
    public static getConfig(req: express.Request, res: express.Response, next: express.NextFunction) {
        let data = fs.readFileSync("./.env");
        let buf = Buffer.from(data);
        let env = dotenv.parse(buf);
        res.render("config", {
            title: "Configuration",
            saved: (req.query.saved !== undefined),
            env: env,
        });
    }

    public static postConfig(req: express.Request, res: express.Response, next: express.NextFunction) {
        let envData = `BOT_KEY="${req.body.botKey}"\nBOT_SECRET="${req.body.botSecret}"\nUSER_ID="${req.body.userId}"\nCOMMAND_PREFIX="${req.body.commandPrefix}"\nADDON_FOLDER="${req.body.addonFolder}"`;
        
        fs.writeFileSync("./.env", envData, {
            encoding: "utf8",
            flag: "w"
        });

        res.redirect("/config?saved=true");
    }
}