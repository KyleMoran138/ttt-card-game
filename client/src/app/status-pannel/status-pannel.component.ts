import { Component, OnInit } from '@angular/core';
import { io, Server } from 'socket.io-client';
import { GameSocketService } from '../game-socket.service';
import { GameService } from '../game.service';

@Component({
  selector: 'status-pannel',
  templateUrl: './status-pannel.component.html',
  styleUrls: ['./status-pannel.component.sass']
})
export class StatusPannelComponent implements OnInit {

  constructor(public gameSocketService: GameSocketService, public gameService: GameService) {
  }

  ngOnInit(): void {

  }

}
