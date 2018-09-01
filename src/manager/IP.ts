import { Manager } from "./Manager";

let ip = require("ip");
let publicIp = require("public-ip");

export class IP {
    public getIp(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (Manager.get().database().config().serverMode.active) {
                publicIp.v4().then((ipAddr: any) => {
                    resolve(ipAddr);
                }).catch((error: any) => {
                    reject(error);
                });
            } else {
                resolve(ip.address());
            }
        });
    }
}