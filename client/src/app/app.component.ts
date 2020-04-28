import { Component } from '@angular/core';
import { GameSocketService } from './game-socket.service';
import { GameService } from './game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  newNickname: string = "";
  sessionToJoinOrCreate: string = "";

  constructor(private gameSessionService: GameSocketService, public gameService: GameService ){
  }

  public changeName(): void{
    this.gameService.setName(this.newNickname);
  }

  public joinSession(): void{
    this.gameService.joinSession(this.sessionToJoinOrCreate);
  }

  public createSession(): void{
    this.gameService.createSession(this.sessionToJoinOrCreate);
    delete this.sessionToJoinOrCreate;
  }

  public leaveSession(): void{
    this.gameService.leaveSession();
    delete this.sessionToJoinOrCreate;
  }
}
