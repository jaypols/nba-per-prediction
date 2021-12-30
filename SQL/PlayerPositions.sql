use stats;

INSERT INTO PlayerPositions
SELECT CurrentPlayer, MAX(CurrentPos) FROM CurrentStats GROUP BY CurrentPlayer;