import * as lockfile from "lockfile"
import * as child from "child_process";
import * as touch from "touch";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as fs from "fs";
let axios = require("axios");
let fileExists = require("file-exists");

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

        lockfile.lock("./chatbot/bot.lock", (err: Error) => {
            if(err) {
                console.log(err);
                return false;
            }

            this.instance = (process.platform == "linux") ? child.spawn("./chatbot/ChatBotCE") : child.spawn("./chatbot/ChatBotCE.exe");
            console.log("Process ID: " + this.instance.pid);

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

        lockfile.unlock("./chatbot/bot.lock", (err: Error) => {
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
        return lockfile.checkSync("./chatbot/bot.lock");
    }
}

export class Installer 
{
    public install(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            mkdirp("./chatbot", (err) => {
                if(err) {
                    console.log(err);
                    reject(err);
                }
            });
    
            let isWin = (process.platform == "win32");

            axios("https://api.github.com/repos/MarkedBots/ChatBot-CE/releases/latest")
                .then((response: any) => {
                    console.log("Got the latest release. Looping through assets.");
                    response.data.assets.forEach((asset: any) => {
                        console.log("Checking asset: " + asset.name);
                        if(isWin) {
                            if(asset.name.toLowerCase().indexOf("windows") > 0) {
                                this.downloadAsset(asset.browser_download_url, "ChatBotCE.exe","./chatbot")
                                .catch(err => {
                                    reject(err);
                                });
                            }
                        } else {
                            if(asset.name.toLowerCase().indexOf("linux") > 0) {
                                this.downloadAsset(asset.browser_download_url, "ChatBotCE","./chatbot")
                                    .catch(err => {
                                        reject(err);
                                    });
                            }
                        }

                        if(asset.name.toLowerCase() == "env.example") {
                            this.downloadAsset(asset.browser_download_url, ".env", "./")
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

                    touch("./installed.lock").then(() => {
                        resolve(true);
                    }).catch((err) => {
                        reject(err);
                    });
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

    private async downloadAsset(url: string, filename: string, filepath: string): Promise<any>
    {
        filepath = path.resolve(filepath, filename);

        let response = await axios({
            method: "GET",
            url: url,
            responseType: "stream",
        });

        response.data.pipe(fs.createWriteStream(filepath));

        return new Promise((resolve, reject) => {
            response.data.on('end', () => {
                resolve()
            })
        
            response.data.on('error', () => {
                reject()
            })
        });
    }
}