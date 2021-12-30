import pandas as pd
import numpy as np
import sqlalchemy
from sklearn.preprocessing import StandardScaler
from matplotlib.pylab import rcParams
import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn import neighbors
from sklearn.model_selection import GridSearchCV
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import accuracy_score

pd.options.mode.chained_assignment = None
le = LabelEncoder()
le.fit(['PG', 'SG', 'SF', 'PF', 'C'])


def connect_database():
    engine = sqlalchemy.create_engine(
        'mysql+pymysql://root:password@localhost:3306/stats')

    query = '''
  SELECT * FROM SimilarStats LEFT OUTER JOIN PlayersPhysical
  ON SimilarStats.SimPlayer=PlayersPhysical.Player
  '''
    similarStats = pd.read_sql(query, engine)
    query = '''
  SELECT * FROM CurrentStats LEFT OUTER JOIN PlayersPhysical
  ON CurrentStats.CurrentPlayer=PlayersPhysical.Player
  '''
    playerStats = pd.read_sql(query, engine)
    query = '''
  SELECT * FROM SimilarStats2 LEFT OUTER JOIN PlayersPhysical
  ON SimilarStats2.SimPlayer2=PlayersPhysical.Player
  '''
    similarStats2 = pd.read_sql(query, engine)
    engine.dispose()
    return playerStats, similarStats, similarStats2


def prepare_data(playerStats, similarStats, similarStats2):
    playerStats = playerStats[[
        'CurrentPlayer', 'CurrentAge', 'CurrentPER', 'CurrentPos', 'Height', 'Weight']]  # included current players in data
    playerStats.columns = ['Player', 'Age',
                           'PER', 'Position', 'Height', 'Weight']
    playerStats['Height'] = [i.replace('-', '.')
                             for i in playerStats['Height'].values]
    playerStats['Weight'] = [i.split('l')[0]
                             for i in playerStats['Weight'].values]

    similarStats = similarStats[[
        'SimAge', 'SimPER', 'SimPos', 'Height', 'Weight']]
    similarStats.columns = ['Age', 'PER', 'Position', 'Height', 'Weight']
    similarStats['Height'] = [i.replace('-', '.')
                              for i in similarStats['Height'].values]
    similarStats['Weight'] = [i.split('l')[0]
                              for i in similarStats['Weight'].values]

    similarStats2 = similarStats2[['SimAge2',
                                   'SimPER2', 'SimPos2', 'Height', 'Weight']]
    similarStats2.columns = ['Age', 'PER', 'Position', 'Height', 'Weight']
    similarStats2['Height'] = [i.replace('-', '.')
                               for i in similarStats2['Height'].values]
    similarStats2['Weight'] = [i.split('l')[0]
                               for i in similarStats2['Weight'].values]

    return playerStats, similarStats, similarStats2


def split_encode_label(playerStats, similarStats, similarStats2):
    trainSize = len(playerStats)

    train = pd.DataFrame(
        columns=['Age', 'PER', 'Position', 'Height', 'Weight'])
    train = pd.concat([playerStats],
                      ignore_index=True)
    trainPos = train[['Position']]

    testPos = playerStats[['Position']]

    encodedPositions = pd.DataFrame(columns=['Position'])
    encodedPositions = pd.concat([trainPos, testPos],
                                 ignore_index=True)

    encodedPositions['Position'] = np.where(encodedPositions['Position'].str.contains(','), encodedPositions['Position'].str.split(',')[0], encodedPositions['Position'])
    encodedPositions['Position'] = np.where(encodedPositions['Position'], encodedPositions['Position'], 'PG')

  
    encodedPositions['Position'] = le.transform(encodedPositions['Position'])

    playerStats['Position'] = encodedPositions[trainSize:].values
    train['Position'] = encodedPositions[:trainSize].values

    return train, playerStats


def get_data():
    playerStats, similarStats, similarStats2 = connect_database()

    testPlayer = playerStats.loc[playerStats['Player']  # player 33 is good
                                 == 'Quincy Acy']

    playerStats, similarStats, similarStats2 = prepare_data(
        playerStats, similarStats, similarStats2)
    trainSet, playerStats = split_encode_label(
        playerStats, similarStats, similarStats2)

    testSet = playerStats[['Player',
                           'Age', 'PER', 'Position', 'Height', 'Weight']]

    return trainSet, testSet


def create_test_set(testSet, player):
    testPlayer = testSet.loc[testSet['Player']  # player 33 is good
                             == player]

    testPlayer = testPlayer.drop('Player', axis=1)

    x_test = testPlayer.drop('PER', axis=1)
    y_test = testPlayer['PER']

    age = x_test['Age'].values[-1]
    pos = x_test['Position'].values[-1]
    h = x_test['Height'].values[-1]
    w = x_test['Weight'].values[-1]
    data = np.array(
        [[age+1, pos, h, w], [age+2, pos, h, w], [age+3, pos, h, w]])
    data = pd.DataFrame(data, columns=[
        'Age', 'Position', 'Height', 'Weight'])
    x_test = pd.concat([x_test, data],
                       ignore_index=True)

    return x_test, y_test, testPlayer


def predict_player_per(playerData, x_test, y_test, x_train, y_train):
    rf = RandomForestRegressor(n_estimators=10, random_state=42)


    #Using Grid Search: 
    # params = {'n_estimators': [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]}
    # gscv = GridSearchCV(rf, param_grid=params, cv=10, scoring = 'neg_mean_squared_error', refit=True)
    # gscv.fit(x_train, y_train)
    # prediction = gscv.predict(x_test)

    rf.fit(x_train, y_train)
    prediction = rf.predict(x_test)
  
    predictionData = pd.DataFrame(list(prediction), columns=['PredictedPER'])


    stats = x_test
    stats['PER'] = pd.Series(playerData['PER'].values)

    playerData = pd.concat([stats, predictionData], axis=1,
                           ignore_index=True)

    playerData.columns = ['Age', 'Position',
                          'Height', 'Weight', 'PER', 'PredictedPER']

    return playerData, prediction


def find_accuracy(player, prediction, y_test):
    errors = abs(prediction - y_test)
    # Print out the mean absolute error (mae)

    mape = 100 * (errors / y_test)
    # Calculate and display accuracy
    mae = round(np.mean(errors), 2)
    accuracy = 100 - np.mean(mape)
    accuracy = round(accuracy, 2)
    rmse = np.sqrt(mean_squared_error(y_test, prediction))
    rmse = round(rmse, 2)
    mse = mean_squared_error(y_test, prediction)
    mse = round(mse, 2)
    r2 = r2_score(y_test, prediction)
    r2 = round(r2, 2)
    # print('Mean Absolute Error:', mae, 'degrees.')
    # print('Accuracy:', accuracy, '%.')
    # print(rmse)
    # print(mse)
    # print(r2)
    data = [player, accuracy, mae, rmse, mse, r2]
    accuracyTable = pd.DataFrame([data], columns=[
                                 'Player', 'Accuracy', 'MAE', 'RMSE', 'MSE', 'R2'])
    return accuracyTable


def insert_into_database(predictedStats, accuracyStats):
    engine = sqlalchemy.create_engine(
        'mysql+pymysql://root:password@localhost:3306/stats2')
    predictedStats.to_sql(
        name='PredictedStats',  # database table name
        con=engine,
        if_exists='append',
        index=False
    )
    accuracyStats.to_sql(
        name='AccuracyStats',  # database table name
        con=engine,
        if_exists='append',
        index=False
    )
    engine.dispose()
    return


def main():
    trainSet, testSet = get_data()

    players = testSet['Player'].values
    trainSet = trainSet.drop('Player', axis=1)
    players = sorted(list(set(players)))
    y_train = trainSet['PER']
    x_train = trainSet[['Age', 'Position', 'Height', 'Weight']]
    predictedStats = pd.DataFrame()
    accuracyStats = pd.DataFrame(
        columns=['Player', 'Accuracy', 'MAE', 'RMSE', 'MSE', 'R2'])
    for player in players:

        print(player)
        x_test, y_test, playerData = create_test_set(testSet, player)

        playerData, prediction = predict_player_per(
            playerData, x_test, y_test, x_train, y_train)

        playerData['Position'] = (le.inverse_transform(
            list(map(int, playerData['Position'].values))))

        playerData['Player'] = [player for i in playerData['Age'].values]
        playerData = playerData[[
            'Player', 'Age', 'PER', 'Position', 'PredictedPER']]
        print(playerData)
        # plt.figure(figsize=(16, 8))
        # plt.plot(playerData[['PER', 'PredictedPER']])
        # plt.show()

        predictedStats = predictedStats.append(playerData)

        prediction = prediction[:-3]
        accuracyStats = accuracyStats.append(
            find_accuracy(player, prediction, y_test))

        print(accuracyStats)
        print(predictedStats)
    accuracyStats = accuracyStats.replace([np.inf, -np.inf], np.nan)
    print("#############")
    print(predictedStats)
    print(accuracyStats)
    insert_into_database(predictedStats, accuracyStats)


if __name__ == "__main__":
    main()
