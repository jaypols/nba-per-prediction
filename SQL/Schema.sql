create database stats;

use stats;

CREATE TABLE CurrentStats (
  CurrentPlayer VARCHAR(30) NOT NULL,
  CurrentAge FLOAT,
  CurrentPER FLOAT,
  CurrentPos VARCHAR(5)
);

CREATE TABLE SimilarStats (
  SimPlayer VARCHAR(30) NOT NULL,
  SimAge FLOAT,
  SimPER FLOAT,
  SimPos VARCHAR(5)
);

CREATE TABLE SimilarStats2 (
  SimPlayer2 VARCHAR(30) NOT NULL,
  SimAge2 FLOAT,
  SimPER2 FLOAT,
  SimPos2 VARCHAR(5)
);

CREATE TABLE SimilarScore (
  CurrentPlayer VARCHAR(30) NOT NULL,
  SimPlayer VARCHAR(30),
  SimScore FLOAT,
  SimPlayer2 VARCHAR(30),
  SimScore2 FLOAT
);

CREATE TABLE PlayersUrl (
  Player VARCHAR(30) NOT NULL,
  PlayerUrl VARCHAR(30)
);

CREATE TABLE PlayersPhysical (
  Player VARCHAR(30) NOT NULL,
  Height VARCHAR(30),
  Weight VARCHAR(30)
);

CREATE TABLE PlayerAvgs (
  PlayerName VARCHAR(30) NOT NULL,
  Period VARCHAR(30),
  PTS FLOAT,
  TRB FLOAT,
  AST FLOAT,
  FG FLOAT,
  FG3 FLOAT,
  FT FLOAT,
  eFG FLOAT,
  PER FLOAT,
  WS FLOAT
);

CREATE TABLE PredictedStats (
  Player VARCHAR(30) NOT NULL,
  Age FLOAT,
  PER FLOAT,
  Position VARCHAR(5),
  PredictedPER FLOAT
);

CREATE TABLE AccuracyStats(
  Player VARCHAR(30) NOT NULL,
  Accuracy FLOAT,
  MAE FLOAT,
  RMSE FLOAT,
  MSE FLOAT,
  R2 FLOAT
);

CREATE TABLE PlayerPositions (
  Player VARCHAR(30) NOT NULL,
  Position VARCHAR(5)
);