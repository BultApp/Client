import { Bot, Installer } from "./Bot";
import { Ember } from "./Ember";
import { Process } from "./Process";

export class Manager
{
    private static instance: Manager = null;
    private botManager: Bot;
    private installerManager: Installer;
    private emberManager: Ember;
    private processManager: Process;

    public static get(): Manager {
        return this.instance;
    }

    public static created() {
        return this.instance != null
    }

    constructor()
    {
        this.botManager = new Bot();
        this.installerManager = new Installer();
        this.emberManager = new Ember();
        this.processManager = new Process(this.emberManager);
    }

    public bot() {
        return this.botManager;
    }

    public installer() {
        return this.installerManager;
    }

    public ember() {
        return this.emberManager;
    }

    public process() {
        return this.processManager;
    }
}