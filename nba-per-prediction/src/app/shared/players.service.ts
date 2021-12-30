import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class PlayersService {
  constructor(private http: HttpClient) {}

  getPlayersList() {
    return this.http.get(
      'http://' + window.location.hostname + ':4000/view/currentPlayers'
    );
  }

  getPlayerDetails(player: string) {
    return this.http.get(
      'http://' +
        window.location.hostname +
        ':4000/view/playerDetails/' +
        player
    );
  }

  getPlayersList2(
    sort: string,
    column: string,
    position: string,
    name: string,
    pageIndex: number,
    pageSize: number
  ) {
    return this.http.post(
      'http://' + window.location.hostname + ':4000/view/currentPlayers1',
      {
        sort: sort,
        column: column,
        position: position,
        name: name,
        index: pageIndex,
        size: pageSize,
      }
    );
  }
}
