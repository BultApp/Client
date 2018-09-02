import * as lockfile from "lockfile";
import * as child from "child_process";
import * as path from "path";
import * as fs from "fs";
import { File as FileManager, File } from "./File";
import { Manager } from "./Manager";
let dotenv = require("dotenv");

export class Bot {
    private instance: child.ChildProcess;

    /**
     * Start the bot and create the lock file.
     *
     * @return {boolean}
     */
    public start(): boolean {
        if (this.running()) {
            return true;
        }

        lockfile.lock("./deps/bot.lock", (err: Error) => {
            if (err) {
                console.log(err);
                return false;
            }

            this.instance = (process.platform === "linux") ? child.spawn("./deps/ChatBotCE") : child.spawn("./deps/ChatBotCE.exe");
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
    public stop(): boolean {
        if (!this.running()) {
            return true;
        }

        lockfile.unlock("./deps/bot.lock", (err: Error) => {
            if (err) {
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
    public running(): boolean {
        return lockfile.checkSync("./deps/bot.lock");
    }

    /**
     * Gets the bot's environment file.
     *
     * @return {any}
     */
    public env(): any {
        if (!fs.existsSync("./.env")) {
            return null;
        }
        
        let buffer = Buffer.from(fs.readFileSync("./.env"));
        return dotenv.parse(buffer);
    }
}

export class Addon extends Bot {
    public addons(): object {
        let addons: any = {};
        let addonpath = path.join(__dirname, "..", "..", Manager.get().bot().env().ADDON_FOLDER);
        let folders = File.getFolders(addonpath);

        folders.forEach((name) => {
            addons[name] = {};

            let files = fs.readdirSync(path.join(addonpath, name));

            files.forEach((file) => {
                if (!fs.statSync(path.join(addonpath, name, file)).isDirectory() && (file.toLowerCase() === "package.json")) {
                    let content = fs.readFileSync(path.join(addonpath, name, file));

                    addons[name] = JSON.parse(content.toString());
                }
            });
        });
        
        return addons;
    }

    public check(addonName: string): boolean {
        let addonpath = this.env().ADDON_FOLDER;
        let folders = FileManager.getFolders(path.join(__dirname, "..", addonpath));

        folders.forEach((name) => {
            let files = fs.readdirSync(path.join(__dirname, "..", addonpath, name));
            
            files.forEach((file) => {
                if (!fs.statSync(path.join(__dirname, "..", addonpath, name, file)).isDirectory() && (file.toLowerCase() === "package.json")) {
                    let content = fs.readFileSync(path.join(__dirname, "..", addonpath, name, file));
                    let packageJSON = JSON.parse(content.toString());

                    if (addonName === packageJSON.name) {
                        return true;
                    }
                }
            });
        });

        return false;
    }
}