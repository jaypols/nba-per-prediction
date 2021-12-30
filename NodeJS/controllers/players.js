const express = require("express");
const mysql = require("mysql");
var router = express.Router();

var db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "stats",
  port: 3306
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to database");
});
global.db = db;

//##########################

function getFilterQuery(column, position, name) {
  filter = "";
  console.log("p: " + position);
  console.log("n: " + name);
  console.log("c: " + column);
  switch (column) {
    case "player":
      if (position != "" && name == "")
        filter = "WHERE Position = '" + position + "'";
      else if (position == "" && name != "")
        filter = "WHERE Player LIKE '%" + name + "%'";
      else if (position != "" && name != "")
        filter =
          "WHERE Position = '" +
          position +
          "' and Player LIKE '%" +
          name +
          "%'";
      return filter;

    case "age":
      if (position != "" && name == "")
        filter =
          "WHERE CurrentPlayer IN (SELECT Player FROM PlayerPositions WHERE Position= '" +
          position +
          "')";
      else if (position == "" && name != "")
        filter =
          "WHERE CurrentPlayer IN (SELECT Player FROM PlayerPositions WHERE Player LIKE '%" +
          name +
          "%')";
      else if (position != "" && name != "")
        filter =
          "WHERE CurrentPlayer IN (SELECT Player FROM PlayerPositions WHERE Position= '" +
          position +
          "' and Player LIKE '%" +
          name +
          "%')";

      return filter;

    case "_2023":
    case "_2022":
    case "_2021":
    case "height":
    case "weight":
      if (position != "" && name == "")
        filter =
          "WHERE t1.Player IN (SELECT Player FROM PlayerPositions WHERE Position= '" +
          position +
          "')";
      else if (position == "" && name != "")
        filter =
          "WHERE t1.Player IN (SELECT Player FROM PlayerPositions WHERE Player LIKE '%" +
          name +
          "%')";
      else if (position != "" && name != "")
        filter =
          "WHERE t1.Player IN (SELECT Player FROM PlayerPositions WHERE Position= '" +
          position +
          "' and Player LIKE '%" +
          name +
          "%')";
      return filter;

    case "accuracy":
      if (position != "" && name == "")
        filter =
          "WHERE Player IN (SELECT Player FROM PlayerPositions WHERE Position= '" +
          position +
          "')";
      else if (position == "" && name != "")
        filter =
          "WHERE Player IN (SELECT Player FROM PlayerPositions WHERE Player LIKE '%" +
          name +
          "%')";
      else if (position != "" && name != "")
        filter =
          "WHERE Player IN (SELECT Player FROM PlayerPositions WHERE Position= '" +
          position +
          "' and Player LIKE '%" +
          name +
          "%')";
      return filter;
    case "_2020":
      if (position != "" && name == "")
        filter =
          "WHERE t1.CurrentPlayer IN (SELECT Player FROM PlayerPositions WHERE Position= '" +
          position +
          "')";
      else if (position == "" && name != "")
        filter =
          "WHERE t1.CurrentPlayer IN (SELECT Player FROM PlayerPositions WHERE Player LIKE '%" +
          name +
          "%')";
      else if (position != "" && name != "")
        filter =
          "WHERE t1.CurrentPlayer IN (SELECT Player FROM PlayerPositions WHERE Position= '" +
          position +
          "' and Player LIKE '%" +
          name +
          "%')";

      return filter;

    default:
      return filter;
  }
}
function getPlayers(
  column,
  sortDirection,
  position,
  name,
  pageIndex,
  pageSize
) {
  var offset = pageIndex * pageSize;
  var limit = pageSize;
  let query = "";
  var filter = getFilterQuery(column, position, name);

  if (column == "player") {
    query =
      "SELECT Player FROM PlayerPositions " +
      filter +
      " ORDER BY Player " +
      sortDirection +
      " LIMIT " +
      offset +
      "," +
      limit +
      ";";
  } else if (column == "age") {
    query =
      "SELECT CurrentPlayer as Player, MAX(currentage) AS Age FROM CurrentStats " +
      filter +
      " GROUP BY CurrentPlayer ORDER BY Age " +
      sortDirection +
      " LIMIT " +
      offset +
      "," +
      limit +
      ";";
  } else if (column == "height") {
    query =
      " SELECT t1.Player, t2.Height FROM AccuracyStats t1 LEFT JOIN PlayersPhysical t2 ON t1.Player=t2.Player " +
      filter +
      " ORDER BY Height " +
      sortDirection +
      " LIMIT " +
      offset +
      "," +
      limit +
      ";";
  } else if (column == "weight") {
    query =
      " SELECT t1.Player, t2.Weight FROM AccuracyStats t1 LEFT JOIN PlayersPhysical t2 ON t1.Player=t2.Player " +
      filter +
      " ORDER BY Weight " +
      sortDirection +
      " LIMIT " +
      offset +
      "," +
      limit +
      ";";
  } else if (column == "accuracy") {
    query =
      "SELECT Player FROM AccuracyStats " +
      filter +
      " ORDER BY Accuracy " +
      sortDirection +
      " LIMIT " +
      offset +
      "," +
      limit +
      ";";
  } else if (column == "_2020") {
    query =
      "SELECT t1.CurrentPlayer as Player FROM (SELECT CurrentPlayer, MAX(CurrentAge) AS CurrentAge FROM CurrentStats GROUP BY CurrentPlayer) t1 " +
      "LEFT JOIN CurrentStats t2 on t1.CurrentPlayer=t2.CurrentPlayer AND t1.CurrentAge=t2.CurrentAge " +
      filter +
      " ORDER BY t2.CurrentPER " +
      sortDirection +
      " LIMIT " +
      offset +
      "," +
      limit +
      ";";
  } else if (column == "_2021") {
    query =
      "SELECT t1.Player FROM(" +
      " SELECT Player, MIN(Age) AS Age FROM PredictedStats WHERE PER IS NULL GROUP BY Player) t1 " +
      " LEFT JOIN PredictedStats t2 on t1.Player=t2.Player AND t1.Age=t2.Age " +
      filter +
      " ORDER BY t2.PredictedPER " +
      sortDirection +
      " LIMIT " +
      offset +
      "," +
      limit +
      ";";
  } else if (column == "_2022") {
    query =
      "SELECT * FROM(" +
      " SELECT Player, MAX(Age)-1 AS Age FROM PredictedStats WHERE PER IS NULL GROUP BY Player) t1 " +
      " LEFT JOIN PredictedStats t2 on t1.Player=t2.Player AND t1.Age=t2.Age " +
      filter +
      " ORDER BY t2.PredictedPER " +
      sortDirection +
      " LIMIT " +
      offset +
      "," +
      limit +
      ";";
  } else if (column == "_2023") {
    query =
      "SELECT * FROM(" +
      " SELECT Player, MAX(Age) AS Age FROM PredictedStats WHERE PER IS NULL GROUP BY Player) t1 " +
      " LEFT JOIN PredictedStats t2 on t1.Player=t2.Player AND t1.Age=t2.Age " +
      filter +
      " ORDER BY t2.PredictedPER " +
      sortDirection +
      " LIMIT " +
      offset +
      "," +
      limit +
      ";";
  }
  return performQuery(query);
}

async function getPlayerData(currentPlayers) {
  playerData = [];

  for (var i = 0; i < currentPlayers.length; i++) {
    var name = currentPlayers[i].Player;

    if (name.indexOf("'") > -1) {
      player = name.split("'");
      name = player[0] + "''" + player[1];
    }

    var limit = "ORDER BY Age DESC LIMIT 5;";
    if (currentPlayers.length == 1) limit = "";
    stats = await getCurrentPlayerStats(name, limit);
    physical = await getCurrentPlayerPhysical(name);
    accuracy = await getPredictionAccuracy(name);
    url = await getCurrentPlayerUrl(name);
    playerData.push({
      playerName: currentPlayers[i].Player,
      physicalDetails: physical,
      url: url,
      accuracy: accuracy,
      stats: stats,
    });
  }
  return playerData;
}

//#############################
router.post("/view/currentPlayers1", async (req, res) => {

  if (req.body.column == "playerName") {
    req.body.column = "player";
  }
  var currentPlayers = await getPlayers(
    req.body.column,
    req.body.sort,
    req.body.position,
    req.body.name,
    req.body.index,
    req.body.size
  );

  var playerData = await getPlayerData(currentPlayers);
  res.send(playerData);
});
//#########################################

function removeApostrophe(name) {
  if (name.indexOf("'") > -1) {
    var player = name.split("'");
    name = player[0] + "''" + player[1];
  }
  return name;
}
router.get("/view/playerDetails/:player", async (req, res) => {

  var playerData = [];
  var currentPlayer = req.params.player;
  var name = removeApostrophe(currentPlayer);

  var similarPlayers = await getSimilarityTable(name);

  if (similarPlayers.length > 0) {
    players = [
      similarPlayers[0].CurrentPlayer,
      similarPlayers[0].SimPlayer,
      similarPlayers[0].SimPlayer2,
    ];

    for (var i = 0; i < players.length; i++)
      players[i] = removeApostrophe(players[i]);

    stats = await getPlayerStats(players);
    accuracy = await getPredictionAccuracy(players[0]);
    physical = await getPhysicalStats(players);
    urls = await getPlayerUrls(players);
    averages = await getPlayerAvgs(players);

    playerData.push({
      playerName: req.params.player,
      physicalDetails: physical,
      url: urls,
      simScore: similarPlayers,
      averages: averages,
      accuracy: accuracy,
      stats: stats,
    });
  } else {

    playerData = await getPlayerData([{ Player: name }]);
    playerData[0].averages = await getCurrentPlayerAvgs(name);
  }
  res.send(playerData);
});

router.get("/view/currentPlayers", async (req, res) => {
  playerData = [];

  currentPlayers = await getCurrentPlayers();

  for (var i = 0; i < currentPlayers.length; i++) {
    name = currentPlayers[i].Player;
  
    if (name.indexOf("'") > -1) {
      var player = name.split("'");
      name = player[0] + "''" + player[1];
    }

    stats = await getCurrentPlayerStats(name);
    physical = await getCurrentPlayerPhysical(name);
    accuracy = await getPredictionAccuracy(name);
    url = await getCurrentPlayerUrl(name);
    playerData.push({
      playerName: currentPlayers[i].Player,
      physicalDetails: physical,
      url: url,
      accuracy: accuracy,
      stats: stats,
    });
  }
 
  res.send(playerData);
});
router.get("/view/predictedPER", async (req, res) => {
  playerData = [];

  current_similar_players = await getSimilarityTable();

  for (var i = 0; i < current_similar_players.length; i++) {
  

    players = [
      current_similar_players[i].CurrentPlayer,
      current_similar_players[i].SimPlayer,
      current_similar_players[i].SimPlayer2,
    ];

    for (var j = 0; j < players.length; j++) {
      if (players[j].indexOf("'") > -1) {
        player = players[j].split("'");
        players[j] = player[0] + "''" + player[1];
  
      }
    }

    stats = await getPlayerStats(players);
    accuracy = await getPredictionAccuracy(players[0]);
    physical = await getPhysicalStats(players);
    urls = await getPlayerUrls(players);
    averages = await getPlayerAvgs(players);

    playerData.push({
      playerName: current_similar_players[i].CurrentPlayer,
      physicalDetails: physical,
      url: urls,
      simScore: current_similar_players[i],
      averages: averages,
      accuracy: accuracy,
      stats: stats,
    });
  }

  res.send(playerData);

});

function performQuery(query) {
  return new Promise(function (resolve, reject) {
    db.query(query, (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

//##########################

function getCurrentPlayers() {
  let query = "SELECT Player FROM AccuracyStats";
  return performQuery(query);
}
function getCurrentPlayerStats(player, limit) {
  let query =
    "SELECT * FROM PredictedStats t1 WHERE t1.Player = '" +
    player +
    "' " +
    limit;
  return performQuery(query);
}
function getCurrentPlayerPhysical(player) {
  let query =
    "SELECT * FROM PlayersPhysical t1 WHERE t1.Player = '" + player + "';";

  return performQuery(query);
}
function getCurrentPlayerUrl(player) {
  let query = "SELECT * FROM PlayersUrl t1 WHERE t1.Player = '" + player + "';";

  return performQuery(query);
}

//#########################
function getSimilarityTable(player) {
  let query =
    "SELECT * FROM SimilarScore WHERE CurrentPlayer= '" + player + "';";
  return performQuery(query);
}

function getPlayerStats(players) {
  let query =
    "SELECT * FROM PredictedStats t1 WHERE t1.Player = '" +
    players[0] +
    "' UNION SELECT t2.*, null FROM SimilarStats t2 WHERE t2.SimPlayer = '" +
    players[1] +
    "' UNION SELECT t3.*, null FROM SimilarStats2 t3 WHERE t3.SimPlayer2 = '" +
    players[2] +
    "';";

  return performQuery(query);
}

function getPredictionAccuracy(currentPlayer) {
  let query =
    "SELECT * FROM AccuracyStats t1 WHERE t1.Player = '" + currentPlayer + "';";

  return performQuery(query);
}
function getPhysicalStats(players) {
  let query =
    "SELECT * FROM PlayersPhysical t1 WHERE t1.Player = '" +
    players[0] +
    "' or t1.Player= '" +
    players[1] +
    "' or t1.Player= '" +
    players[2] +
    "';";

  return performQuery(query);
}

function getPlayerUrls(players) {
  let query =
    "SELECT * FROM PlayersUrl t1 WHERE t1.Player = '" +
    players[0] +
    "' or t1.Player= '" +
    players[1] +
    "' or t1.Player= '" +
    players[2] +
    "';";

  return performQuery(query);
}

function getCurrentPlayerAvgs(player) {
  let query =
    "SELECT * FROM PlayerAvgs t1 WHERE t1.PlayerName = '" + player + "';";
  return performQuery(query);
}

function getPlayerAvgs(players) {
  let query =
    "SELECT * FROM PlayerAvgs t1 WHERE t1.PlayerName = '" +
    players[0] +
    "' or t1.PlayerName= '" +
    players[1] +
    "' or t1.PlayerName= '" +
    players[2] +
    "';";

  return performQuery(query);
}
module.exports = router;
