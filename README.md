# API For Tic Tac Toe Game

## URL: [Tic Tac Toe](https://tttweb.vercel.app)

## URL: [Tic Tac Toe API](https://tttapi.vercel.app)

### Usage:

1. Clone the repository:

   ```bash
   git clone https://github.com/brianstm/tic-tac-toe-api.git
   ```

2. Install the required dependencies:

   ```bash
    npm install
   ```

3. Run the API Locally:
   ```bash
   node index.js
   ```
   The API will run on http://localhost:8000 by default unless stated in the .env file

### See also

[![GitHub](https://img.shields.io/badge/GitHub-Tic%20Tac%20Toe%20-181717.svg?logo=github)](https://github.com/brianstm/tic-tac-toe.git)
[![GitHub](https://img.shields.io/badge/GitHub-Tic%20Tac%20Toe%20API-181717.svg?logo=github)](https://github.com/brianstm/tic-tac-toe-api.git)

> [!IMPORTANT]
> index.js is to run on local machine, index_prod.js is to run in vercel

> [!NOTE]
> Create a Database in Monggodb and copy the uri into the .env file, example: [Example Env](.env.example)

### API Calls:

```js
// (POST) /new-game
{
    "size": "3",              // Grid size
    "disappearing": false,    // Disappearing true or false
    "disappearing_rounds": 0, // Disappear in amount of rounds
    "player_0": "X",          // Player 0's icon
    "player_1": "O"           // Player 1's icon
    "player_0_name": "",      // (OPTIONAL) Player 0's name
    "player_1_name": "",      // (OPTIONAL) Player 1's name
}
```

```js
// (GET) /game/:game_code
```

```js
// (POST) /join-game
{
    "gameCode": "ASDASDASDA",   // Game Code
    "player0": "Jane",          // Name of player 0 (either can be emtpy)
    "player1": ""               // Name of player 1 (either can be emtpy)
}
```

```js
// (POST) /play
{
    "gameCode": "ASDASDASDA",   // Game Code
    "row": 1,                   // Row (array starts from 0)
    "col": 1                    // Column (array starts from 0)
}
```

### Returns

All the API above will return all the data in similar ways, which will always contain these datas:

```js
{
    "gameCode": "ASDASDASDA",   // Game Code
    "size": "3",                // Grid size
    "board": [                  // Board array of array
        [
            null,
            null,
            null
        ],
        [
            null,
            null,
            null
        ],
        [
            null,
            null,
            null
        ]
    ],
    "currentPlayer": "1",       // Current Player
    "winner": null,             // Winner
    "winningLine": [],          // Winning Line will return the Winning Line of row and col
    "player_0": "X",            // Player 0's icon
    "player_0_name": "",        // Player 0's name
    "player_1": "O",            // Player 1's icon
    "player_1_name": "",        // Player 0's name
    "disappearing": false,      // Disappearing true or false
    "disappearing_rounds": 0,   // Disappear in amount of rounds
    "rounds": []                // Rounds array of objects containing row, col and player
}
```
