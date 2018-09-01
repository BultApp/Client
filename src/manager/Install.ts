import * as touch from "touch";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as execa from "execa";
import { File as FileManager, File } from "./File";
import { Manager } from "./Manager";
let axios = require("axios");
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

            axios("https://api.github.com/repos/MarkedBots/ChatBot-CE/releases/latest?callback")
                .then((response: any) => {
                    deps[chatbot] = response.data.tag_name;
                    console.log("Got the latest release of ChatBotCE. Looping through assets.");
                    response.data.assets.forEach((asset: any) => {
                        console.log("Checking asset: " + asset.name);
                        if (isWin) {
                            if (asset.name.toLowerCase().indexOf("windows") > 0) {
                                FileManager.downloadAsset(asset.browser_download_url, "ChatBotCE.exe", "./deps")
                                    .catch(err => {
                                        reject(err);
                                    });
                            }
                        } else {
                            if (asset.name.toLowerCase().indexOf("linux") > 0) {
                                FileManager.downloadAsset(asset.browser_download_url, "ChatBotCE", "./deps")
                                    .then(() => {
                                        return execa("chmod", ["+x", path.join(__dirname, "deps", "ChatBotCE")]);
                                        //fs.chmodSync(path.join(__dirname, "deps", "ChatBotCE"), "755");
                                    })
                                    .then(result => {
                                        console.log(result.stdout);
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });
                            }
                        }

                        if (asset.name.toLowerCase() === "env.example") {
                            FileManager.downloadAsset(asset.browser_download_url, ".env", "./")
                                .catch(err => {
                                    reject(err);
                                });
                        }
                    });

                    mkdirp("./addons", (err) => {
                        if (err) {
                            reject(err);
                        }
                    });

                    return axios("https://api.github.com/repos/BultApp/Ember/releases/latest?callback");
                })
                .then((response: any) => {
                    deps[ember] = response.data.tag_name;
                    console.log("Got the latest release of Ember. Looping through assets.");
                    response.data.assets.forEach((asset: any) => {
                        console.log("Checking asset: " + asset.name);
                        if (isWin) {
                            if (asset.name.toLowerCase().indexOf("windows") > 0) {
                                FileManager.downloadAsset(asset.browser_download_url, "Ember.exe", "./deps")
                                    .catch(err => {
                                        reject(err);
                                    });
                            }
                        } else {
                            if (asset.name.toLowerCase().indexOf("linux") > 0) {
                                FileManager.downloadAsset(asset.browser_download_url, "Ember", "./deps")
                                    .then(() => {
                                        return execa("chmod", ["+x", path.join(__dirname, "deps", "Ember")]);
                                        //fs.chmodSync(path.join(__dirname, "deps", "Ember"), "755");
                                    })
                                    .then(result => {
                                        console.log(result.stdout);
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });
                            }
                        }
                    });

                    return touch("./installed.lock");
                })
                .then(() => {
                    Manager.get().database().database().set("deps", deps).write();

                    resolve(true);
                })
                .catch((err: any) => {
                    reject(err);
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