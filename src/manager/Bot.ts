import * as lockfile from "lockfile"
import * as child from "child_process";

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

            this.instance = child.spawn("./chatbot/ChatBotCE");
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
    public install(): boolean
    {
        lockfile.lock("./installed.lock", (err: Error) => {
            if(err) {
                return false;
            }

            return true;
        });

        return false;
    }

    public uninstall(): boolean
    {
        lockfile.unlock("./installed.lock", (err: Error) => {
            if(err) {
                return false;
            }

            return true;
        });

        return false;
    }

    public installed(): boolean
    {
        return lockfile.checkSync("./chatbot/bot.lock");
    }
}