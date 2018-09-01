import * as lowdb from "lowdb";
import * as FileSync from "lowdb/adapters/FileSync";

export class Database {
    private db: lowdb.LowdbSync<any>;

    constructor() {
        this.db = lowdb(new FileSync("bult.json"));

        this.db.defaultsDeep({
            web: {
                expires_at: 0,
                access_token: "",
                refresh_token: ""
            },

            config: {
                port: 7285,
                checkForDepUpdates: true,
                serverMode: {
                    active: false,
                    password: "hashedpassword",
                    session: {
                        secret: "secret",
                        cookie: {
                            lifetime: 720,
                            secure: false,
                        }
                    }
                }
            },

            deps: {},
        }).write();
    }

    public database(): lowdb.LowdbSync<any> {
        return this.db;
    }

    public config(): any {
        return this.db.get("config").value();
    }

    public bult(): any {
        return this.db.get("web").value();
    }

    public web(): any {
        return this.bult();
    }
}