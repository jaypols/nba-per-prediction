import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { PlayersService } from '../shared/players.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-player-details',
  templateUrl: './player-details.component.html',
  styleUrls: ['./player-details.component.css'],
})
export class PlayerDetailsComponent implements OnInit, AfterViewInit {
  currentPlayer: string = '';
  simPlayer: string = '';
  simPlayer2: string = '';
  accuracy: number;
  urls: Url;
  physical: Physical;
  isLoadingResults = true;
  averages: Averages;
  similarity: SimilarPlayers;
  playerStats: PlayerStats;
  players: string[] = [];
  constructor(
    private elementRef: ElementRef,
    private playersService: PlayersService,
    private route: ActivatedRoute
  ) {}

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#455d7a';
  }
  ngOnInit(): void {
    this.currentPlayer = this.route.snapshot.params['playerName'];
    console.log(this.currentPlayer);
    console.log('@@@@@@');
    this.players.push(this.currentPlayer);
    console.log(this.players);
    console.log('@@@@@@');
    this.playersService
      .getPlayerDetails(this.currentPlayer)
      .subscribe((data) => {
        console.log(data);
        console.log(data[0]);

        this.accuracy = data[0]['accuracy'][0]['Accuracy'];
        data[0]['url'].forEach((element) => {
          urls[element['Player']] = element['PlayerUrl'];
        });

        if (data[0]['simScore'] != undefined) {
          data[0]['simScore'].forEach((element) => {
            simPlayers[element['SimPlayer']] = element['SimScore'];
            simPlayers[element['SimPlayer2']] = element['SimScore2'];

            this.simPlayer = element['SimPlayer'];
            this.simPlayer2 = element['SimPlayer2'];
            this.players.push(element['SimPlayer']);
            this.players.push(element['SimPlayer2']);
          });
          this.similarity = simPlayers;
          console.log(this.similarity);
        }
        var name = data[0]['stats'][0]['Player'];

        var count = 1;
        data[0]['stats'].forEach((element) => {
          if (name != element['Player']) {
            count = 1;
            stats = {};
            name = element['Player'];
          }
          stats['Season' + count] = {
            Age: element['Age'],
            PER: element['PER'],
            predictedPER: element['PredictedPER'],
            Position: element['Position'],
          };
          playerStats[element['Player']] = stats as Stat;
          count += 1;
        });

        data[0]['physicalDetails'].forEach((element) => {
          playerPhysical[element['Player']] = {
            height: element['Height'],
            weight: element['Weight'],
          };
        });

        name = data[0]['averages'][0]['PlayerName'];
        data[0]['averages'].forEach((element) => {
          if (name != element['PlayerName']) {
            period = [];
            name = element['PlayerName'];
          }
          period[element['Period']] = {
            PER: element['PER'],
            PTS: element['PTS'],
            TRB: element['TRB'],
            AST: element['AST'],
            FG: element['FG'],
            FG3: element['FG3'],
            FT: element['FT'],
            eFG: element['eFG'],
            WS: element['WS'],
          } as PeriodAverages;

          averages[element['PlayerName']] = period as PeriodAverages[];
        });

        console.log('$$');
        console.log(playerStats);
        this.urls = urls;
        this.physical = playerPhysical;
        this.averages = averages;
        this.playerStats = playerStats;

        this.isLoadingResults = false;
      });
  }
}

let urls = {} as Url;
let simPlayers = {} as SimilarPlayers;
let playerStats = {} as PlayerStats;
let stats = {} as Stat;
let playerPhysical = {} as Physical;
let period = [] as PeriodAverages[];
let averages = {} as Averages;

export interface PeriodAverages {
  [key: string]: {
    PER: number;
    PTS: number;
    TRB: number;
    AST: number;
    FG: number;
    FG3: number;
    FT: number;
    eFG: number;
    WS: number;
  };
}
export interface Averages {
  [key: string]: PeriodAverages[];
}

export interface Stat {
  [key: string]: {
    Age: number;
    PER: number;
    predictedPER: number;
    Position: string;
  };
}

export interface PlayerStats {
  [key: string]: Stat;
}

export interface SimilarPlayers {
  [key: string]: number;
}
export interface Physical {
  [key: string]: { weight: string; height: string };
}

export interface Url {
  [key: string]: string;
}
