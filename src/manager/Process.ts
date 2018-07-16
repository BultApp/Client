import { Ember } from "./Ember"

export class Process
{
    constructor(private ember: Ember) {
        // if(this.ember.start()) {
        //     console.log("Ember launched and ready to go.");
        // }

        process.on("exit", (code) => {
            this.onExit(code);
        });

        process.on("SIGINT", () => {
            this.onExit(0);
        });
        
        process.on("uncaughtException", (err) => {
            this.onExit(1);
        });
    }

    /**
     * A function to handle process exiting.
     * 
     * @param {number} code 
     * @return {void}
     */
    public onExit(code: number): void {
        console.log("Bult is exiting. Stopping Ember.");

        if(this.ember.stop()) {
            console.log("Ember has been stopped.")
        }

        process.exit(code);
    }
}