import * as fs from "fs";
import * as path from "path";
import * as fse from "fs-extra";

let axios = require("axios");
let download = require("download");

export class File {
    public static getFolders(folderPath: string) {
        return fs.readdirSync(folderPath).filter((file) => {
            return fs.statSync(path.join(folderPath, file)).isDirectory();
        });
    }

    public static writeAsset(data: any, name: string, filepath: string): Promise<any> {
        filepath = path.resolve(filepath, name);

        return fse.outputFile(filepath, data);
    }

    public static downloadAsset(url: string): Promise<any> {
        return download(url);
    }

    public static getFiles(folderPath: string): Promise<any>  {
        return new Promise((resolve, reject) => {
            let data: any = {};

            fs.readdir(folderPath, (err, filenames) => {
                if (err) {
                    reject(err);
                }

                filenames.forEach((name) => {
                    fs.readFile(path.join(folderPath, name), "utf-8", (err, content) => {
                        if (err) {
                            reject(err);
                        } 

                        data[name] = content;
                    });
                });

                resolve(data);
            });
        });
    }

    public static getFileNames(folderPath: string): Array<string> {
        let filenames = fs.readdirSync(folderPath);

        return filenames;
    }
}