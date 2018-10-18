import { Bot, Addon } from "./Bot";
import { Installer } from "./Install";
import { Ember } from "./Ember";
import { Process } from "./Process";
import { Database } from "./Database";
import { IP } from "./IP";
import { Bult } from "./Bult";

export class Manager {
    private static instance: Manager = null;
    private addonManager: Addon;
    private botManager: Bot;
    private installerManager: Installer;
    private emberManager: Ember;
    private processManager: Process;
    private databaseManager: Database;
    private ipManager: IP;
    private bultManager: Bult;

    public static get(): Manager {
        return this.instance;
    }

    public static created() {
        return this.instance !== null;
    }

    constructor() {
        this.databaseManager = new Database();
        this.ipManager = new IP();
        this.addonManager = new Addon();
        this.botManager = new Bot();
        this.installerManager = new Installer();
        this.emberManager = new Ember();
        this.processManager = new Process(this.emberManager);
        this.bultManager = new Bult(this.databaseManager);
        
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

    public database() {
        return this.databaseManager;
    }

    public ip() {
        return this.ipManager;
    }

    public bult() {
        return this.bultManager;
    }
}