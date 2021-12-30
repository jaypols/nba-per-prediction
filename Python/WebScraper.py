from bs4 import BeautifulSoup
from multiprocessing import Pool, cpu_count
import pandas as pd
import numpy as np
import requests
from requests import get
from lxml import html
import lxml.html
from lxml.etree import tostring
from urllib.request import urlopen
from datetime import datetime, time
from requests_html import HTMLSession
import time
from pyppeteer import launch
import pyppeteer
import asyncio
import pymysql
import sqlalchemy
import urllib.request
import string
headers = {"Accept-Language": "en-US,en;q=0.5"}

blockedResourceTypes = [
    'image',
    'media',
    'font',
    'texttrack',
    'object',
    'beacon',
    'csp_report',
    'imageset',
    'stylesheet',
]

skippedResources = [
    'quantserve',
    'adzerk',
    'doubleclick',
    'adition',
    'exelator',
    'sharethrough',
    'cdn.api.twitter',
    'google-analytics',
    'googletagmanager',
    'google',
    'fontawesome',
    'facebook',
    'analytics',
    'optimizely',
    'clicktale',
    'mixpanel',
    'zedo',
    'clicksor',
    'tiqcdn',
]


def gettingPlayers():
    players = []
    start = time.time()
    for letter in string.ascii_lowercase:
        page = requests.get(
            "https://www.basketball-reference.com/players/"+letter+"/", headers=headers)
        tree = lxml.html.fromstring(page.content)
        elems = tree.xpath("//strong//a[(@href)]")
        for elem in elems:
            players.append(
                'https://www.basketball-reference.com'+elem.get("href"))

    end = time.time()
    print(end-start)
    return players


async def intercept(request, playerUrl):

    if (request.url == "https://www.basketball-reference.com/req/202106291/images/players/"+playerUrl):
        urllib.request.urlretrieve(request.url, 'images/'+playerUrl)
        await request.abort()
    elif any(request.resourceType == _ for _ in blockedResourceTypes):
        await request.abort()
    elif any(s in request.url for s in skippedResources):
        await request.abort()
    else:
        await request.continue_()



async def getBrowser():
    while True:
        try:
            browser = await launch(headless=True, autoClose=True,
                                   args=['--no-sandbox', '--disable-gpu', '--disable-infobars'])
            return browser
        except:
            print("Trying to open browser...")


async def makeRequest(browser, url, type):
    playerUrl = url.split('/').pop().split('.')[0]+".jpg"
    print(playerUrl)
    attempts = 1
    while(attempts < 11):
        print(f"Attempt {attempts}")
        try:
            page = await browser.newPage()
            await page.setRequestInterception(True)
            page.on('request', lambda req: asyncio.ensure_future(
                intercept(req, playerUrl)))
            await page.goto(url, timeout=10000)
            advanced = await page.querySelector('div[id="div_advanced"]')
            advancedTable = await page.evaluate('(element) => element.innerHTML', advanced)
            height = await page.querySelector('span[itemprop="height"]')
            height = await page.evaluate('(element) => element.textContent', height)
            weight = await page.querySelector('span[itemprop="weight"]')
            weight = await page.evaluate('(element) => element.textContent', weight)

            stats = await page.querySelector('div[class="stats_pullout"]')
            stats = await page.evaluate('(element) => element.innerHTML', stats)

            # name = await page.querySelector('div[id="meta"] > div:nth-child(2) > h1')
            name = await page.querySelector('h1[itemprop="name"]>span')
            playerName = await page.evaluate('(element) => element.textContent', name)
            if(type == 1):
                sim = await page.querySelector('table[id="sims-thru"]')
                if sim is not None:
                    simTable = await page.evaluate('(element) => element.innerHTML', sim)
                    simP = await page.querySelector('table[id="sims-thru"] > tbody > tr:nth-child(2) > th > a')
                    simScore = await page.querySelector('table[id="sims-thru"] > tbody > tr:nth-child(2) > td')
                    simPlayerUrl = await page.evaluate('(element) => element.getAttribute("href")', simP)
                    simScore = await page.evaluate('(element) => element.textContent', simScore)

                    simP = await page.querySelector('table[id="sims-thru"] > tbody > tr:nth-child(3) > th > a')
                    simScore2 = await page.querySelector('table[id="sims-thru"] > tbody > tr:nth-child(3) > td')
                    simPlayerUrl2 = await page.evaluate('(element) => element.getAttribute("href")', simP)
                    simScore2 = await page.evaluate('(element) => element.textContent', simScore2)

                    await page.close()
                    return playerName, advancedTable, simTable, stats, height, weight, [simPlayerUrl, simPlayerUrl2], [simScore, simScore2]
                else:
                    await browser.close()
                    return playerName, advancedTable, None, stats, height, weight, None, None
            elif(type == 2):
                return playerName, advancedTable, stats, height, weight
            elif(type == 3):
                await browser.close()
                return playerName, advancedTable, stats, height, weight
        except (ConnectionError, pyppeteer.errors.TimeoutError, pyppeteer.errors.PageError, pyppeteer.errors.NetworkError) as e:
            print(e)
            await asyncio.sleep(1)
            attempts = attempts+1


def createDataFrame(playerName, table, type):
    soup = BeautifulSoup(table, 'html.parser')

    columns = [th.getText()
               for th in soup.findChildren('table', id='advanced')[0].findAll('tr', limit=2)[0].findAll('th')]

    rows = soup.findChildren('table', id='advanced')[
        0].findAll('tr')[1:]

    stats = [[td.getText() for td in rows[i].findAll(['td', 'th'])]
             for i in range(len(rows))]

    stats = pd.DataFrame(stats, columns=columns)

    data = stats[['Age', 'PER', 'Pos']]
    data = data.loc[data['Age'] != '']
    x = data['Age'].values
    y = data['PER'].values
    position = data['Pos'].values
    position = [i.split('-')[0] for i in position]
    index_sets = [np.argwhere(i == x) for i in np.unique(x)]
    index_sets = [np.delete(i, 0) for i in index_sets if (len(i) > 1)]

    if(len(index_sets) > 0):
        x = np.unique(x)
        index_sets = [item for sublist in index_sets for item in sublist]
        y = np.delete(y, index_sets)
        position = np.delete(position, index_sets)

    name = np.full(len(x), playerName)

    if type == 1:
        player_stats = pd.DataFrame([name, x, y, position], [
            'CurrentPlayer', 'CurrentAge', 'CurrentPER', 'CurrentPos'])
    elif type == 2:
        player_stats = pd.DataFrame([name, x, y, position], [
            'SimPlayer', 'SimAge', 'SimPER', 'SimPos'])
    elif type == 3:
        player_stats = pd.DataFrame([name, x, y, position], [
            'SimPlayer2', 'SimAge2', 'SimPER2', 'SimPos2'])

    player_stats = player_stats.transpose()
    print(player_stats)
    return player_stats


def getCareerAvg(table, playerName):
    soup = BeautifulSoup(table, 'html.parser')
    count = soup.findChildren('div')[0].findChildren('p')
    columns = [col.getText()
               for col in soup.findChildren('span', {'class': 'poptip'})]
    if(len(columns) == 8):
        columns.insert(5, 'FG3%')
        columns.insert(7, 'eFG%')

    columns.insert(0, 'Period')
    columns.insert(0, 'PlayerName')

    rows = soup.findChildren('div')[1:]
    careerRows = [[p.getText() for p in rows[i].findAll('p', limit=2)[1:]]
                  for i in range(len(rows))]
    careerRows.pop(2)
    careerRows.pop(6)

    careerRows = [i[0] for i in careerRows]

    if(len(careerRows) == 10):
        careerRows.insert(6, '0')
        careerRows.insert(8, '0')
    careerRows.pop(10)
    careerRows = [i.replace('-', '0') for i in careerRows]
    careerRows.insert(0, playerName)

    if(count[0].getText() != ""):

        currentRows = [[p.getText() for p in rows[i].findAll('p', limit=2)[:1]]
                       for i in range(len(rows))]
        currentRows.pop(2)
        currentRows.pop(6)
        currentRows.pop(10)
        currentRows = [i[0] for i in currentRows]
        period = currentRows[0]
        currentRows = [i.replace('-', '0') for i in currentRows[1:]]
        currentRows.insert(0, period)
        currentRows.insert(0, playerName)
        stats = pd.DataFrame(
            data=[currentRows, careerRows], columns=columns)
        return stats
    else:

        stats = pd.DataFrame(data=[careerRows], columns=columns)
        return stats


async def getStats(url):

    browser = await getBrowser()
    playerName, advancedTable, simTable, stats, height, weight, simPlayerUrls, simScores = await makeRequest(browser, url, 1)

    data = createDataFrame(playerName, advancedTable, 1)
    stats = getCareerAvg(stats, playerName)
    if simPlayerUrls is not None:
        simPlayerName, advancedSimilarTable, simStats, simHeight, simWeight = await makeRequest(browser,
                                                                                                "https://www.basketball-reference.com"+simPlayerUrls[0], 2)
        simPlayerName2, advancedSimilarTable2, simStats2, simHeight2, simWeight2 = await makeRequest(browser,
                                                                                                     "https://www.basketball-reference.com"+simPlayerUrls[1], 3)

        similarPlayer = createDataFrame(simPlayerName, advancedSimilarTable, 2)
        similarPlayer2 = createDataFrame(
            simPlayerName2, advancedSimilarTable2, 3)
        simPlayerUrls.append(url)
        names = [simPlayerName, simPlayerName2, playerName]
        height = [simHeight, simHeight2, height]
        weight = [simWeight, simWeight2, weight]
        stats = pd.concat([stats, getCareerAvg(simStats, simPlayerName),
                           getCareerAvg(simStats2, simPlayerName2)])
        stats.reset_index(drop=True, inplace=True)

        for i in range(len(simPlayerUrls)):
            simPlayerUrls[i] = simPlayerUrls[i].split(
                '/').pop().split('.')[0]+".jpg"
            i += 1
        sim_score = pd.DataFrame([simScores[0]], [
            'SimScore'])
        sim_score2 = pd.DataFrame([simScores[1]], [
            'SimScore2'])
        playerInfo = pd.DataFrame([names, simPlayerUrls, height, weight], [
            'Player', 'PlayerUrl', 'Height', 'Weight'])

        data = pd.concat([data, similarPlayer, similarPlayer2, sim_score.transpose(), sim_score2.transpose(), playerInfo.transpose(), stats],
                         axis=1)
    else:

        playerInfo = pd.DataFrame([playerName, url.split(
            '/').pop().split('.')[0]+".jpg", height, weight], ['Player', 'PlayerUrl', 'Height', 'Weight'])

        data = pd.concat([data, playerInfo.transpose(), stats], axis=1)
    return data


def executeCalls(url):

    start = time.time()
    data = asyncio.get_event_loop().run_until_complete(getStats(url))
    end = time.time()
    print(f"Done {url} in {end-start}")
    return data




if __name__ == "__main__":   
  start = time.time()
  results = gettingPlayers()
  print(results)
  with Pool(cpu_count()-1) as p:
      output = p.starmap(executeCalls, zip(results))
  p.close()
  p.join()

  end = time.time()
  print(f"FINISHED in {end-start}")

  myList = list(output)

  stats = pd.DataFrame(columns=[
      'CurrentPlayer', 'CurrentAge', 'CurrentPos', 'CurrentPER', 'SimPlayer', 'SimAge', 'SimPER', 'SimPos', 'SimPlayer2', 'SimAge2', 'SimPER2', 'SimPos2', 'SimScore',  'SimScore2', 'Player', 'PlayerUrl', 'Height', 'Weight'])
  stats = pd.concat(myList)

  print(stats)
  playerAvgs = stats[['PlayerName', 'Period', 'PTS',
                      'TRB', 'AST', 'FG%', 'FG3%', 'FT%', 'eFG%', 'PER', 'WS']]
  playerAvgs = playerAvgs.loc[playerAvgs['Period'].notnull(
  )]
  playerAvgs.rename({'FG%': 'FG', 'FG3%': 'FG3', 'FT%': 'FT',
                    'eFG%': 'eFG'}, axis=1, inplace=True)

  playerStats = stats[['CurrentPlayer',
                      'CurrentAge', 'CurrentPER', 'CurrentPos']]
  playerStats = playerStats.loc[playerStats['CurrentPlayer'].notnull(
  )]
  simPlayerStats = stats[['SimPlayer', 'SimAge', 'SimPER', 'SimPos']]
  simPlayerStats = simPlayerStats.loc[simPlayerStats['SimPlayer'].notnull(
  )]
  simPlayerStats = simPlayerStats[simPlayerStats['SimPER'
                                                ] != '']
  simPlayerStats2 = stats[['SimPlayer2', 'SimAge2', 'SimPER2', 'SimPos2']]
  simPlayerStats2 = simPlayerStats2.loc[simPlayerStats2['SimPlayer2'].notnull(
  )]
  simPlayerStats2 = simPlayerStats2[simPlayerStats2['SimPER2'
                                                    ] != '']
  simScore = stats[['CurrentPlayer', 'SimPlayer',
                    'SimScore', 'SimPlayer2', 'SimScore2']]
  simScore = simScore.loc[simScore['SimScore'].notnull()]

  url = stats[['Player', 'PlayerUrl']]
  url = url.loc[url['PlayerUrl'].notnull()]

  physical = stats[['Player', 'Height', 'Weight']]
  physical = physical.loc[physical['Height'].notnull()]
  print(playerStats)
  print(simPlayerStats)
  print(simPlayerStats2)
  print(simScore)
  print(url)
  print(playerAvgs)
  print(physical)

  try:
      engine = sqlalchemy.create_engine(
          'mysql+pymysql://root:password@localhost:3306/stats')
      print("Connected...")

      playerStats.to_sql(
          name='CurrentStats',  # database table name
          con=engine,
          if_exists='append',
          index=False
      )
      simPlayerStats.to_sql(
          name='SimilarStats',  # database table name
          con=engine,
          if_exists='append',
          index=False
      )
      simPlayerStats2.to_sql(
          name='SimilarStats2',  # database table name
          con=engine,
          if_exists='append',
          index=False
      )
      simScore.to_sql(
          name='SimilarScore',  # database table name
          con=engine,
          if_exists='append',
          index=False
      )

      url.to_sql(
          name='PlayersUrl',  # database table name
          con=engine,
          if_exists='append',
          index=False
      )

      physical.to_sql(
          name='PlayersPhysical',  # database table name
          con=engine,
          if_exists='append',
          index=False
      )

      playerAvgs.to_sql(
          name='PlayerAvgs',  # database table name
          con=engine,
          if_exists='append',
          index=False
      )
      print("Closing...")
  except Exception as e:
      print("Error")
      print(e)
