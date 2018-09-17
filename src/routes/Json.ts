import * as express from "express";
import { File } from "../manager/File";
import { Manager } from "../manager/Manager";
let fs = require("fs");

export class Json {

    public static getJsonIndex(req: express.Request, res: express.Response, next: express.NextFunction) {
        let ignoreJsonFiles: Array<string> = ["package-lock.json", "package.json", "tsconfig.json", "tslint.json", "bult.json"];

        let files = File.getFileNames("./").filter((filename) => {
            return (filename.endsWith(".json") && (ignoreJsonFiles.indexOf(filename) < 0));
        });

        res.render("jsonIndex", {
            title: "JSON Files",
            running: Manager.get().bot().running(),
            files: files
        });
    }

    public static getJsonEditor(req: express.Request, res: express.Response, next: express.NextFunction) {
        let fileName = req.query.jsonFile;
        let fileData = JSON.parse(fs.readFileSync(`./${fileName}`, "utf8"));

        res.render("jsonEditor", {
            title: "JSON Editor",
            running: Manager.get().bot().running(),
            saved: (req.query.saved !== undefined),
            fileName: fileName,
            fileData: fileData
        });
    }

    public static postJsonEditor(req: express.Request, res: express.Response, next: express.NextFunction) {
        let fileName = req.body.jsonFile;
        let fileData = JSON.parse(req.body.jsonData);

        fs.writeFile(`./${fileName}`, fileData, {
            encoding: "utf8",
            flag: "w"
        }, (error: any) => {
            if (error) {
                return res.json({
                    saved: false,
                    error: error
                });
            }

            return res.json({
                saved: true,
                data: fileData
            });
        });
    }
}