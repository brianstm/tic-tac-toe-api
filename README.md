# API For Tic Tac Toe Game

URL: [Tic Tac Toe](https://tttweb.vercel.app)

API CALLS:

```json
// (POST) /new-game
{
    "size": "3",              // grid size
    "disappearing": false,    // disappearing true or false
    "disappearing_rounds": 0, // disappear in amount of rounds
    "player_0": "X",          // player 0's icon
    "player_1": "O"           // player 1's icon
}
```

```json
// (GET) /game/:game_code
```

```json
// (POST) /join-game
{
    "gameCode": "ASDASDASDA",   // Game Code
    "player0": "Jane",          // Name of player 0 (either can be emtpy)
    "player1": ""               // Name of player 1 (either can be emtpy)
}
```

```json
// (POST) /play
{
    "gameCode": "ASDASDASDA",   // Game Code
    "row": 1,                   // Row (array starts from 0)
    "col": 1                    // Column (array starts from 0)
}
```
