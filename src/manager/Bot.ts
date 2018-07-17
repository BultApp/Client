import * as lockfile from "lockfile"
import * as child from "child_process";
import * as touch from "touch";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as fs from "fs";
import * as execa from "execa";
import { File as FileManager, File } from "./File";
import { Manager } from "./Manager";
let axios = require("axios");
let fileExists = require("file-exists");
let dotenv = require("dotenv");

export class Bot
{
    private instance: child.ChildProcess;

    /**
     * Start the bot and create the lock file.
     * 
     * @return {boolean}
     */
    public start(): boolean
    {
        if(this.running()) {
            return true;
        }

        lockfile.lock("./deps/bot.lock", (err: Error) => {
            if(err) {
                console.log(err);
                return false;
            }

            this.instance = (process.platform == "linux") ? child.spawn("./deps/ChatBotCE") : child.spawn("./deps/ChatBotCE.exe");
            console.log("Bot Process ID: " + this.instance.pid);

            return true;
        });

        return false;
    }

    /**
     * Stop the bot and remove the lock file.
     * 
     * @return {boolean}
     */
    public stop(): boolean
    {
        if(!this.running()) {
            return true;
        }

        lockfile.unlock("./deps/bot.lock", (err: Error) => {
            if(err) {
                console.log(err);
                return false;
            }

            this.instance.kill();

            return true;
        });

        return false;
    }

    /**
     * Determine if bot is running or not.
     * 
     * @return {boolean}
     */
    public running(): boolean
    {
        return lockfile.checkSync("./deps/bot.lock");
    }

    /**
     * Gets the bot's environment file.
     * 
     * @return {any}
     */
    public env(): any
    {
        let buffer = Buffer.from(fs.readFileSync("./.env"));
        return dotenv.parse(buffer);
    }
}

export class Addon extends Bot
{
    public addons(): object {
        let addons: any = {};
        let addonpath = path.join(__dirname, "..", "..", Manager.get().bot().env().ADDON_FOLDER);
        let folders = File.getFolders(addonpath);

        folders.forEach((name) => {
            addons[name] = {};

            let files = fs.readdirSync(path.join(addonpath, name));
            
            files.forEach((file) => {
                if(!fs.statSync(path.join(addonpath, name, file)).isDirectory() && (file.toLowerCase() == "package.json")) {
                    let content = fs.readFileSync(path.join(addonpath, name, file));

                    addons[name] = JSON.parse(content.toString());
                }
            });
        });
        
        return addons;
    }

    public check(addonName: string): boolean
    {
        let addonpath = this.env().ADDON_FOLDER;
        let folders = FileManager.getFolders(path.join(__dirname, "..", addonpath));

        folders.forEach((name) => {
            let files = fs.readdirSync(path.join(__dirname, "..", addonpath, name));
            
            files.forEach((file) => {
                if(!fs.statSync(path.join(__dirname, "..", addonpath, name, file)).isDirectory() && (file.toLowerCase() == "package.json")) {
                    let content = fs.readFileSync(path.join(__dirname, "..", addonpath, name, file));
                    let packageJSON = JSON.parse(content.toString());

                    if(addonName == packageJSON.name) {
                        return true;
                    }
                }
            });
        });

        return false;
    }
}

export class Installer 
{
    public install(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            mkdirp("./deps", (err) => {
                if(err) {
                    console.log(err);
                    reject(err);
                }
            });
    
            let isWin = (process.platform == "win32");

            axios("https://api.github.com/repos/MarkedBots/ChatBot-CE/releases/latest?callback")
                .then((response: any) => {
                    console.log("Got the latest release of ChatBotCE. Looping through assets.");
                    response.data.assets.forEach((asset: any) => {
                        console.log("Checking asset: " + asset.name);
                        if(isWin) {
                            if(asset.name.toLowerCase().indexOf("windows") > 0) {
                                FileManager.downloadAsset(asset.browser_download_url, "ChatBotCE.exe","./deps")
                                    .catch(err => {
                                        reject(err);
                                    });
                            }
                        } else {
                            if(asset.name.toLowerCase().indexOf("linux") > 0) {
                                FileManager.downloadAsset(asset.browser_download_url, "ChatBotCE","./deps")
                                    .then(() => {
                                        return execa("chmod", ["+x", path.join(__dirname, "deps", "ChatBotCE")])
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

                        if(asset.name.toLowerCase() == "env.example") {
                            FileManager.downloadAsset(asset.browser_download_url, ".env", "./")
                                .catch(err => {
                                    reject(err);
                                });
                        }
                    });

                    mkdirp("./addons", (err) => {
                        if(err) {
                            reject(err);
                        }
                    });

                    return axios("https://api.github.com/repos/BultApp/Ember/releases/latest?callback")
                })
                .then((response: any) => {
                    console.log("Got the latest release of Ember. Looping through assets.");
                    response.data.assets.forEach((asset: any) => {
                        console.log("Checking asset: " + asset.name);
                        if(isWin) {
                            if(asset.name.toLowerCase().indexOf("windows") > 0) {
                                FileManager.downloadAsset(asset.browser_download_url, "Ember.exe","./deps")
                                    .catch(err => {
                                        reject(err);
                                    });
                            }
                        } else {
                            if(asset.name.toLowerCase().indexOf("linux") > 0) {
                                FileManager.downloadAsset(asset.browser_download_url, "Ember","./deps")
                                    .then(() => {
                                        return execa("chmod", ["+x", path.join(__dirname, "deps", "Ember")])
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

                    return touch("./installed.lock")
                })
                .then(() => {
                    resolve(true);
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }

    public uninstall(): boolean
    {
        return false;
    }

    public installed(): boolean
    {
        return fileExists.sync("./installed.lock");
    }
}