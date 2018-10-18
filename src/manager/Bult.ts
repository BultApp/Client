process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { Database } from "./Database";
import { AxiosInstance, AxiosPromise } from "axios";
let axios = require("axios");

export class Bult {
    public headers: {};
    private req: AxiosInstance;

    constructor(private db: Database) {
        this.headers = {
            "Authorization": `Bearer ${this.db.bult().access_token}` 
        };

        this.req = axios.create({
            baseURL: "https://bult.test",
            headers: this.headers
        });
    }

    public search(query: string): any {
        return axios.get(`https://bult.test/api-registry/v1/search?s=${encodeURI(query)}`, { headers: this.headers });
    }
}