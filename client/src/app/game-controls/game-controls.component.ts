import { Component, OnInit } from '@angular/core';
import { GameSocketService } from '../game-socket.service';
import { GameService } from '../game.service';
import { Game } from 'src/Model/Game';

@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.component.html',
  styleUrls: ['./game-controls.component.sass']
})
export class GameControlsComponent implements OnInit {

  newNickname: string = "";
  sessionToJoinOrCreate: string = "";
  gameButtonAction: string = "";

  constructor(private gameSessionService: GameSocketService, public gameService: GameService ){
  }

  public changeName(): void{
    this.gameService.setName(this.newNickname);
    delete this.newNickname;
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

  public changeSessionGameSettings(): void{
    this.gameService.updateGame(this.gameService.currentSessionGame);
  }

  public startGame(): void{
    this.gameService.currentSessionGame.currentRound = 1;
    this.changeSessionGameSettings();
  }

  public nextRound(): void{
    const game: Game = this.gameService.currentSessionGame;
    if(game.currentRound && game.currentRound < game.numberOfRounds){
      this.gameService.currentSessionGame.currentRound++;
    }else{
      delete this.gameService.currentSessionGame.currentRound;
    }
    this.changeSessionGameSettings();
  }

  ngOnInit(): void {
  }

}
