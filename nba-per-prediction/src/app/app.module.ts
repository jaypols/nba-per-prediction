import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { PlayersComponent } from './players/players.component';
import { HomeComponent } from './home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './app-material.module';
import { DataTableModule } from 'angular-6-datatable';
import { FormsModule } from '@angular/forms';
import { PlayerDetailsComponent } from './player-details/player-details.component';
import { PlayerChartComponent } from './player-chart/player-chart.component';
@NgModule({
  declarations: [AppComponent, PlayersComponent, HomeComponent, PlayerDetailsComponent, PlayerChartComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    DataTableModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
