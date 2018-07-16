let axios = require("axios");

export class Ember 
{
    private addonManager: EmberAddon;
    public emberURL = "http://localhost:5650"

    constructor() {
        this.addonManager = new EmberAddon(this);
    }

    public addon(): EmberAddon {
        return this.addonManager;
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