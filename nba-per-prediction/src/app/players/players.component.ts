import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlayersService } from '../shared/players.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css'],
  providers: [PlayersService],
})
export class PlayersComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<Object>;
  isLoadingResults = true;
  resultsLength = 0;
  position = '';
  name = '';

  positions = ['None', 'PG', 'SG', 'SF', 'PF', 'C'];
  displayedColumns = [
    'blank',
    'blank',
    'blank',
    'blank',
    'blank',
    'blank',
    'blank',
    'blank',
    'blank',
    'blank',
    'PER',
    'blank',
    'blank',
    'blank',
  ];
  displayedColumns2 = [
    'playerName',
    'age',
    'position',
    'height',
    'weight',
    'accuracy',
    '_2020',
    '_2021',
    '_2022',
    '_2023',
    'details',
  ];

  cols = [
    'playerName',
    'age',
    'position',
    'height',
    'weight',
    'accuracy',
    '_2020',
    '_2021',
    '_2022',
    '_2023',
    'details',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  applyFilter(filterValue: string) {
    this.name = filterValue;
    this.getPlayers(
      this.sort.direction,
      this.sort.active,
      this.position,
      this.name,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  filterPos(position: string) {
    if (position == 'None') position = '';
    this.position = position;

    this.getPlayers(
      this.sort.direction,
      this.sort.active,
      this.position,
      this.name,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  constructor(private playersService: PlayersService) {}

  ngOnInit(): void {
    this.getPlayers('asc', 'playerName', '', '', 0, 25);
  }
  ngAfterViewInit(): void {
    //reset paginator after sorting
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    //load a new page on sort
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() =>
          this.getPlayers(
            this.sort.direction,
            this.sort.active,
            this.position,
            this.name,
            this.paginator.pageIndex,
            this.paginator.pageSize
          )
        )
      )
      .subscribe();
  }

  setPlayers(players) {
    playersList = [];
    for (const player of players as Object[]) {
      var p = {
        playerName: player['playerName'],
        url: player['url'][0]['PlayerUrl'],
        age: player['stats'][3]['Age'],
        position: player['stats'][3]['Position'],
        height: player['physicalDetails'][0]['Height'],
        weight: player['physicalDetails'][0]['Weight'],
        accuracy: player['accuracy'][0]['Accuracy'],
        _2020: player['stats'][3]['PER'],
        _2021: player['stats'][2]['PredictedPER'],
        _2022: player['stats'][1]['PredictedPER'],
        _2023: player['stats'][0]['PredictedPER'],
      } as PlayerInfo;
      playersList.push(p);
    }

    this.dataSource = new MatTableDataSource(playersList);
    console.log(this.dataSource);
    //this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.filterPredicate();
    //this.resultsLength = this.dataSource.data.length;
    this.isLoadingResults = false;
    this.resultsLength = 786;
    return;
  }

  getPlayers(direction, column, position, name, index, size) {
    this.isLoadingResults = true;
    console.log('getting...');
    this.playersService
      .getPlayersList2(direction, column, position, name, index, size)
      .subscribe((players) => {
        this.setPlayers(players);
        return true;
      });
    return true;
  }
}
let playersList: PlayerInfo[] = [];
export interface PlayerInfo {
  playerName: string;
  url: string;
  age: number;
  position: string;
  height: string;
  weight: string;
  accuracy: number;
  _2020: number;
  _2021: number;
  _2022: number;
  _2023: number;
}

//sortData(sort: Sort) {

//   this.players = this.dataSource.filteredData;

//   const data = this.players;
//   if (!sort.active || sort.direction === '') {
//     this.sortedPlayers = data;
//     return;
//   }
//   this.sortedPlayers = data.sort((a, b) => {
//     const isAsc = sort.direction === 'asc';
//     switch (sort.active) {
//       case 'name':
//         return compare(
//           a['playerName']
//             .normalize('NFD')
//             .replace(/[\u0300-\u036f]/g, '')
//             .split(' ')
//             .pop(),
//           b['playerName']
//             .normalize('NFD')
//             .replace(/[\u0300-\u036f]/g, '')
//             .split(' ')
//             .pop(),
//           isAsc
//         );
//       case 'accuracy':
//         return compare(
//           a['accuracy'][0]['Accuracy'],
//           b['accuracy'][0]['Accuracy'],
//           isAsc
//         );
//       case 'weight':
//         return compare(
//           a['physicalDetails'][0]['Weight'],
//           b['physicalDetails'][0]['Weight'],
//           isAsc
//         );
//       case 'height':
//         return compare(
//           a['physicalDetails'][0]['Height'],
//           b['physicalDetails'][0]['Height'],
//           isAsc
//         );
//       case 'age':
//         return compare(a['stats'][3]['Age'], b['stats'][3]['Age'], isAsc);
//       case '2020':
//         return compare(a['stats'][3]['PER'], b['stats'][3]['PER'], isAsc);
//       case '2021':
//         return compare(
//           a['stats'][2]['PredictedPER'],
//           b['stats'][2]['PredictedPER'],
//           isAsc
//         );
//       case '2022':
//         return compare(
//           a['stats'][1]['PredictedPER'],
//           b['stats'][1]['PredictedPER'],
//           isAsc
//         );
//       case '2023':
//         return compare(
//           a['stats'][0]['PredictedPER'],
//           b['stats'][0]['PredictedPER'],
//           isAsc
//         );

//       default:
//         return 0;
//     }
//   });
// }

// applyFilter(filterValue: string) {

//   // filterValue = filterValue.trim(); // Remove whitespace
//   // filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
//   // this.dataSource.filter = filterValue;
// }

//static filter & sort

// filterPredicate() {
//   this.dataSource.filterPredicate = (data: PlayerInfo, filters: string) => {
//     const matchFilter = [];
//     const filterArray = filters.split(',');
//     const columns = [
//       data._2021,
//       data._2020,
//       data._2022,
//       data._2023,
//       data.height,
//       data.weight,
//       data.playerName,
//       data.age,

//       // data['accuracy'][0]['Accuracy'],
//     ];
//     filterArray.forEach((filter) => {
//       const customFilter = [];

//       columns.forEach((column) => {
//         if (typeof column == 'number') {
//           column = column.toFixed(1);
//         }
//         customFilter.push(
//           column.toString().toLowerCase().indexOf(filter) >= 0
//         );
//       });

//       matchFilter.push(customFilter.some(Boolean)); // OR
//     });
//     return matchFilter.every(Boolean); // AND
//   };
// }

// filterPos(filter: string) {
//   if (filter == 'None') {
//     filter = '';

//     this.filterPredicate();
//   } else {
//     this.dataSource.filterPredicate = (data: PlayerInfo, filter: string) => {
//       const matchFilter = [];
//       const customFilter = [];
//       customFilter.push(
//         data.position.toString().toLowerCase().indexOf(filter) >= 0
//       );
//       matchFilter.push(customFilter.some(Boolean)); // OR
//       return matchFilter.every(Boolean); // AND
//     };
//   }
//   this.applyFilter(filter);
//   this.filterPredicate();
// }
