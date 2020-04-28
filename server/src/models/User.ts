import { Socket } from "socket.io";
import { disconnect } from "cluster";

export class User{
    constructor(isEmpty: boolean = false){
        this._isEmpty = isEmpty;
    }

    public _isEmpty: boolean = false;
    public nickname: string = "user";
    public session?: string;
    public role?: string;
}