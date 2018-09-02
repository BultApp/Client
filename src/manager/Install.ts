import * as touch from "touch";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as execa from "execa";
import { File as FileManager, File } from "./File";
import { Manager } from "./Manager";
import axios, { AxiosResponse } from "axios";
let fileExists = require("file-exists");

export class Installer  {
    public install(): Promise<any> {
        return new Promise((resolve, reject) => {
            mkdirp("./deps", (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });
    
            let isWin = (process.platform === "win32");
            let deps: { [index: string] : string} = {};

            let ember = "Ember";
            let chatbot = "ChatBotCE";
            let assetUrl = "";

            axios("https://api.github.com/repos/MarkedBots/ChatBot-CE/releases/latest?callback")
                .then((response: AxiosResponse) => {
                    deps[chatbot] = response.data.tag_name;

                    response.data.assets.forEach((asset: any) => {
                        if (isWin) {
                            if (asset.name.toLowerCase().indexOf("windows") > 0) {
                                assetUrl = asset.browser_download_url;
                            }
                        } else {
                            if (asset.name.toLowerCase().indexOf("linux") > 0) {
                                assetUrl = asset.browser_download_url;
                            }
                        }
                    });

                    return FileManager.downloadAsset(assetUrl);
                })
                .then((data: any) => {
                    return FileManager.writeAsset(data, (isWin ? "ChatBotCE.exe" : "ChatBotCE"), "./deps");
                })
                .then(() => {
                    return axios("https://api.github.com/repos/BultApp/Ember/releases/latest?callback");
                })
                .then((response: AxiosResponse) => {
                    deps[ember] = response.data.tag_name;

                    response.data.assets.forEach((asset: any) => {
                        if (isWin) {
                            if (asset.name.toLowerCase().indexOf("windows") > 0) {
                                assetUrl = asset.browser_download_url;
                            }
                        } else {
                            if (asset.name.toLowerCase().indexOf("linux") > 0) {
                                assetUrl = asset.browser_download_url;
                            }
                        }
                    });

                    return FileManager.downloadAsset(assetUrl);
                })
                .then((data: any) => {
                    return FileManager.writeAsset(data, (isWin ? "Ember.exe" : "Ember"), "./deps");
                })
                .then(() => {
                    return touch("./installed.lock");
                })
                .then(() => {
                    Manager.get().database().database().set("deps", deps).write();

                    resolve();
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
    }

    public uninstall(): boolean {
        return false;
    }

    public installed(): boolean {
        return fileExists.sync("./installed.lock");
    }
}