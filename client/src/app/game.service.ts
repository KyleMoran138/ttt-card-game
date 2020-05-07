import { Injectable } from '@angular/core';
import { User } from 'src/Model/User';
import { userInfo } from 'os';
import { GameSocketService } from './game-socket.service';
import { ServiceResponse } from '../Model/ServiceResponse';
import { Game } from '../Model/Game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public player: User = new User();
  public userNicknamesInSession: string[] = [];
  public currentSessionGame: Game;

  constructor(private gameSocket: GameSocketService) {
    this.player.nickname = `user`;

    this.gameSocket.addListener('setName', (resp: ServiceResponse<User>) => {
      if (resp.status <= 299){
        this.player.nickname = resp.data.nickname;
      }else{
        console.error(`Service error: ${resp.message}`);
        alert(`HEY(${resp.status}): ${resp.message}`);
      }
    });

    this.gameSocket.addListener('joinSession', (resp: ServiceResponse<User>) => {
      if (resp.status <= 299){
        this.player.session = resp.data.session;
      }else if(resp.status == 404 && resp.data && typeof resp.data == 'string'){
        this.createSession(resp.data);
        console.log(`${resp.data} does not exist, creating`)
      }else{
        console.error(`Service error: ${resp.message}`);
        alert(`HEY(${resp.status}): ${resp.message}`);
      }
    });

    this.gameSocket.addListener('leaveSession', (resp: ServiceResponse<User>) => {
      if (resp.status <= 299){
        this.player.session = resp.data.session;
        this.userNicknamesInSession = [];
        delete this.currentSessionGame;
      }else{
        console.error(`Service error: ${resp.message}`);
        alert(`HEY(${resp.status}): ${resp.message}`);
      }
    });

    this.gameSocket.addListener('createSession', (resp: ServiceResponse<User>) => {
      if (resp.status <= 299){
        this.player.session = resp.data.session;
      }else{
        console.error(`Service error: ${resp.message}`);
        alert(`HEY(${resp.status}): ${resp.message}`);
      }
    });

    this.gameSocket.addListener('listUsersInSession', (resp: ServiceResponse<string[]>) => {
      if (resp.status <= 299){
        this.userNicknamesInSession = resp.data;
      }else{
        console.error(`Service error: ${resp.message}`);
        alert(`HEY(${resp.status}): ${resp.message}`);
      }
    });
   
    this.gameSocket.addListener('updateGame', (resp: ServiceResponse<Game>) => {
      if (resp.status <= 299){
        this.currentSessionGame = resp.data;
      }else{
        console.error(`Service error: ${resp.message}`);
        alert(`HEY(${resp.status}): ${resp.message}`);
      }
    });

    this.gameSocket.addListener('updateUser', (resp: ServiceResponse<User>) => {
      if (resp.status <= 299){
        this.player = resp.data;
      }else{
        console.error(`Service error: ${resp.message}`);
        alert(`HEY(${resp.status}): ${resp.message}`);
      }
    });

  }

  public setName(name: string): void{
    this.gameSocket.fireEvent('setName', name);
  }

  public joinSession(sessionName: string): void{
    this.gameSocket.fireEvent('joinSession', sessionName);
  }

  public createSession(sessionName: string): void{
    this.gameSocket.fireEvent('createSession', sessionName);
  }

  public leaveSession(){
    this.gameSocket.fireEvent('leaveSession');
  }
  
  public listUsers(): void{
    this.gameSocket.fireEvent('listUsersInSession');
  }

  public updateGame(game: Game): void{
    this.gameSocket.fireEvent('updateGame', game);
  }

}
