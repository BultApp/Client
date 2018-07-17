import { Ember } from "./Ember"

export class Process
{
    private stopping: boolean = false;
    
    constructor(private ember: Ember) {
        process.on("exit", (code) => {
            this.onExit(code);
        });

        process.on("SIGINT", () => {
            this.onExit(0);
        });
        
        process.on("uncaughtException", (err) => {
            console.error(err);
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
        if(!this.stopping) {
            this.stopping = true;

            console.log("Bult is exiting. Stopping Ember.");

            if(this.ember.stop()) {
                console.log("Ember has been stopped.");
                console.log("\n\n\nBye Bye!")
            }
        }

        process.exit(code);
    }
}