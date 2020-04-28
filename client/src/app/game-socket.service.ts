import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {Server} from 'socket.io-client';
import { EventEmitter } from 'protractor';
import * as process from 'process';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameSocketService {
  private server: Server;
  public isConnected: boolean = false;

  private eventEventListMap: Map<string, EventEmitter> = new Map();

  constructor() {
    try{
      this.server = new io(environment.SERVER_ADDRESS);
      this.server.on('disconnect', () => {this.isConnected = false});
      this.server.on('connection', () => {this.isConnected = true});
      this.isConnected = true;
    }catch (error){
      console.error('Game socket service exception!', error);
      this.isConnected = false;
    }

  }

  public addListener(eventName: string, method): void{
    this.server.on(eventName, method);
  }

  public fireEvent(eventName: string, ...args){
    if(this.isConnected && eventName){
      this.server.emit(eventName, ...args);
    }
  }

}
