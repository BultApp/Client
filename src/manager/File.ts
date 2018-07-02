import * as fs from "fs";
import * as path from "path";

export class FileManager
{
    public static getFolders(folderPath: string)
    {
        return fs.readdirSync(folderPath).filter((file) => {
            return fs.statSync(path.join(folderPath, file)).isDirectory();
        });
    }

    public static getFiles(folderPath: string): Promise<any> 
    {
        return new Promise((resolve, reject) => {
            let data: any = {};

            fs.readdir(folderPath, (err, filenames) => {
                if(err) {
                    reject(err);
                }

                filenames.forEach((name) => {
                    console.log("Reading file data for the file '" + name + "'.")
                    fs.readFile(path.join(folderPath, name), "utf-8", (err, content) => {
                        if(err) {
                            reject(err);
                        } 

                        console.log("===============================");
                        console.log("CONTENT FOR: " + name);
                        console.log(content);
                        console.log("===============================");

                        data[name] = content;
                    });
                });

                console.log("===============================");
                console.log("DATA");
                console.log(data);
                console.log("===============================");

                resolve(data);
            });
        });
    }
}