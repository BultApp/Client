import { Bot, Installer, Addon } from "./Bot";
import { Ember } from "./Ember";
import { Process } from "./Process";

export class Manager
{
    private static instance: Manager = null;
    private addonManager: Addon;
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
        this.addonManager = new Addon();
        this.botManager = new Bot();
        this.installerManager = new Installer();
        this.emberManager = new Ember();
        this.processManager = new Process(this.emberManager);
        
        Manager.instance = this;
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