import * as lockfile from "lockfile"
import * as child from "child_process";
let fileExists = require("file-exists");
let axios = require("axios");

export class Ember 
{
    private addonManager: EmberAddon;
    private instance: child.ChildProcess;
    public emberURL = "http://localhost:5650"

    constructor() {
        this.addonManager = new EmberAddon(this);
    }

    /**
     * Get the instance of the Ember addon manager.
     * 
     * @return {EmberAddon}
     */
    public addon(): EmberAddon {
        return this.addonManager;
    }

    /**
     * Start Ember and create the lock file.
     * 
     * @return {boolean}
     */
    public start(): boolean
    {
        if(this.running()) {
            return true;
        }

        lockfile.lock("./deps/ember.lock", (err: Error) => {
            if(err) {
                console.log(err);
                return false;
            }

            this.instance = (process.platform == "linux") ? child.spawn("./deps/Ember") : child.spawn("./deps/Ember.exe");
            console.log("Ember Process ID: " + this.instance.pid);

            return true;
        });

        return false;
    }

    /**
     * Stop Ember and remove the lock file.
     * 
     * @return {boolean}
     */
    public stop(): boolean
    {
        if(!this.running()) {
            return true;
        }

        lockfile.unlock("./deps/ember.lock", (err: Error) => {
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
     * Determine if Ember is running or not.
     * 
     * @return {boolean}
     */
    public running(): boolean
    {
        return lockfile.checkSync("./deps/ember.lock");
    }
}

export class EmberAddon
{
    private ember: Ember;

    constructor(emberManager: Ember) {
        this.ember = emberManager;
    }

    public install(url: string, filename: string, path: string): Promise<any> {
        return new Promise((resolve, reject) => {
            axios.post(this.ember.emberURL + "/addon/install", {
                url: url,
                filename: filename,
                extractTo: path
            }).then((response: any) => {
                if(response.data.error) {
                    reject(response.data.message);
                }

                resolve(response.data.message);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}