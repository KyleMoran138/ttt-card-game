import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { StatusPannelComponent } from './status-pannel/status-pannel.component';
import { UserCardComponent } from './user-card/user-card.component';
import { GameControlsComponent } from './game-controls/game-controls.component';
import { UserListComponent } from './user-list/user-list.component';

@NgModule({
  declarations: [
    AppComponent,
    StatusPannelComponent,
    UserCardComponent,
    GameControlsComponent,
    UserListComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
