const express = require("express")
const cors = require("cors")
const { MongoClient } = require("mongodb")
require("dotenv").config()

const app = express()
app.disable("x-powered-by")

app.use(express.json())

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "https://tttweb.vercel.app"
    ],
    credentials: true
  })
)

const uri = process.env.MONGODB_URI
let client

const port = process.env.PORT
app.listen(port, async () => {
  client = new MongoClient(uri)
  await client.connect()
  console.log(`Server started on port ${port}`)
})

app.get("/", async (req, res) => {
  try {
    res.status(200).json("Welcome to the TicTacToe API")
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
})

app.post("/new-game", async (req, res) => {
  try {
    const {
      size,
      disappearing,
      disappearing_rounds,
      player_0,
      player_1,
      player_0_name,
      player_1_name
    } = req.body
    if (size < 3) {
      return res.status(400).json({ message: "Grid size must be 3 or more." })
    }
    if (disappearing !== true && disappearing !== false) {
      return res
        .status(400)
        .json({ message: "Disappearing must be true or false." })
    }
    if (disappearing && disappearing_rounds < 1) {
      return res
        .status(400)
        .json({ message: "Disappearing rounds must be 1 or more." })
    }
    if (disappearing === false && disappearing_rounds > 0) {
      return res.status(400).json({
        message: "Disappearing rounds must be 0 if disappearing is false."
      })
    }
    if (player_0 === player_1) {
      return res
        .status(400)
        .json({ message: "Player 0 and player 1 must be different." })
    }

    const database = client.db("ttt")
    const collection = database.collection("game")

    const gameCode = generateGameCode()
    const newGame = {
      gameCode,
      size,
      board: Array(size * size).fill(null),
      currentPlayer: "1",
      winner: null,
      winningLine: [],
      player_0,
      player_0_name: player_0_name ? player_0_name : "",
      player_1,
      player_1_name: player_1_name ? player_1_name : "",
      disappearing,
      disappearing_rounds,
      rounds: []
    }

    await collection.insertOne(newGame)

    const board = []
    for (let i = 0; i < newGame.size; i++) {
      board.push(newGame.board.slice(i * newGame.size, (i + 1) * newGame.size))
    }

    res.status(200).json({
      gameCode: newGame.gameCode,
      size: newGame.size,
      board: board,
      currentPlayer: newGame.currentPlayer,
      winner: newGame.winner,
      winningLine: [],
      player_0: newGame.player_0,
      player_0_name: newGame.player_0_name ? newGame.player_0_name : "",
      player_1: newGame.player_1,
      player_1_name: newGame.player_1_name ? newGame.player_1_name : "",
      disappearing: newGame.disappearing,
      disappearing_rounds: newGame.disappearing_rounds,
      rounds: newGame.rounds
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
})

app.post("/join-game", async (req, res) => {
  try {
    const { gameCode, player0, player1 } = req.body

    if (!gameCode) {
      return res.status(400).json({ message: "Missing game code" })
    }

    const database = client.db("ttt")
    const collection = database.collection("game")

    const game = await collection.findOne({ gameCode })
    if (!game) {
      return res.status(404).json({ message: "Game not found." })
    }
    if (game.player_0name !== "" && game.player_1_name !== "") {
      return res.status(400).json({ message: "Game is full." })
    }
    if (player0 === player1) {
      return res
        .status(400)
        .json({ message: "Player 0 and player 1 must be different." })
    }
    if (game.player_0_name && game.player_0_name === player1) {
      return res
        .status(400)
        .json({ message: "This name is already taken by Player 1." })
    } else if (game.player_1_name && game.player_1_name === player0) {
      return res
        .status(400)
        .json({ message: "This name is already taken by Player 0." })
    }

    await collection.updateOne(
      { gameCode },
      {
        $set: {
          player_0_name: player0 || "",
          player_1_name: player1 || ""
        }
      }
    )

    const editedGame = await collection.findOne({ gameCode })

    res
      .status(200)
      .json({ message: "Player names set successfully.", editedGame })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
})

app.get("/game/:gameCode", async (req, res) => {
  try {
    const { gameCode } = req.params
    if (gameCode.length !== 10 || gameCode === "" || gameCode === null) {
      return res.status(400).json({ message: "Invalid game code." })
    }

    const database = client.db("ttt")
    const collection = database.collection("game")

    const game = await collection.findOne({ gameCode })
    if (!game) {
      return res.status(404).json({ message: "Game not found." })
    }

    const board = []
    for (let i = 0; i < game.size; i++) {
      board.push(game.board.slice(i * game.size, (i + 1) * game.size))
    }

    res.status(200).json({
      gameCode: game.gameCode,
      size: game.size,
      board: board,
      currentPlayer: game.currentPlayer,
      winner: game.winner,
      winningLine: game.winningLine,
      player_0: game.player_0,
      player_0_name: game.player_0_name,
      player_1: game.player_1,
      player_1_name: game.player_1_name,
      disappearing: game.disappearing,
      disappearing_rounds: game.disappearing_rounds,
      rounds: game.rounds
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
})

app.post("/play", async (req, res) => {
  try {
    const { gameCode, row, col } = req.body
    if (row < 0 || col < 0) {
      return res.status(400).json({ message: "Invalid move." })
    }
    if (gameCode.length !== 10 && gameCode === "" && gameCode === null) {
      return res.status(400).json({ message: "Invalid game code." })
    }

    const database = client.db("ttt")
    const collection = database.collection("game")

    const game = await collection.findOne({ gameCode })
    if (!game) {
      return res.status(404).json({ message: "Game not found." })
    }

    if (!game.player_0_name || !game.player_1_name) {
      return res.status(400).json({ message: "Game not ready." })
    }

    const index = row * game.size + col
    if (game.board[index] !== null) {
      return res.status(400).json({ message: "Invalid move." })
    }

    game.rounds.push({ row, col, player: game.currentPlayer })

    if (game.disappearing && game.rounds.length > game.disappearing_rounds) {
      const disappearIndex = game.rounds.length - game.disappearing_rounds - 1
      const { row: disappearRow, col: disappearCol } =
        game.rounds[disappearIndex]
      const disappearIndexBoard = disappearRow * game.size + disappearCol
      game.board[disappearIndexBoard] = null
    }

    game.board[index] = game.currentPlayer
    game.currentPlayer = game.currentPlayer === "1" ? "0" : "1"

    const winner = checkForWin(game.board, game.size, row, col)
    if (winner) {
      game.winner = winner
      game.winningLine = getWinningLine(winner, row, col, game.size, game)
    }

    await collection.updateOne({ gameCode }, { $set: game })

    const board = []
    for (let i = 0; i < game.size; i++) {
      board.push(game.board.slice(i * game.size, (i + 1) * game.size))
    }

    res.status(200).json({
      gameCode: game.gameCode,
      size: game.size,
      board: board,
      currentPlayer: game.currentPlayer,
      winner: game.winner,
      winningLine: game.winningLine,
      player_0: game.player_0,
      player_0_name: game.player_0_name,
      player_1: game.player_1,
      player_1_name: game.player_1_name,
      disappearing: game.disappearing,
      disappearing_rounds: game.disappearing_rounds,
      rounds: game.rounds
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
})

function generateGameCode() {
  let code = ""
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  for (let i = 0; i < 10; i++) {
    code += possibleChars.charAt(
      Math.floor(Math.random() * possibleChars.length)
    )
  }

  return code
}

function checkForWin(board, size, lastRow, lastCol) {
  const player = board[lastRow * size + lastCol]

  for (let i = 0; i < size; i++) {
    if (board[lastRow * size + i] !== player) break
    if (i === size - 1) return player
  }

  for (let i = 0; i < size; i++) {
    if (board[i * size + lastCol] !== player) break
    if (i === size - 1) return player
  }

  if (lastRow === lastCol) {
    for (let i = 0; i < size; i++) {
      if (board[i * size + i] !== player) break
      if (i === size - 1) return player
    }
  }

  if (lastRow + lastCol === size - 1) {
    for (let i = 0; i < size; i++) {
      if (board[i * size + (size - 1 - i)] !== player) break
      if (i === size - 1) return player
    }
  }

  return null
}

function getWinningLine(player, lastRow, lastCol, size, game) {
  const line = []

  for (let i = 0; i < size; i++) {
    if (game.board[lastRow * size + i] !== player) break
    if (i === size - 1) {
      for (let j = 0; j < size; j++) {
        line.push({ row: lastRow, col: j })
      }
      return line
    }
  }

  for (let i = 0; i < size; i++) {
    if (game.board[i * size + lastCol] !== player) break
    if (i === size - 1) {
      for (let j = 0; j < size; j++) {
        line.push({ row: j, col: lastCol })
      }
      return line
    }
  }

  if (lastRow === lastCol) {
    for (let i = 0; i < size; i++) {
      if (game.board[i * size + i] !== player) break
      if (i === size - 1) {
        for (let j = 0; j < size; j++) {
          line.push({ row: j, col: j })
        }
        return line
      }
    }
  }

  if (lastRow + lastCol === size - 1) {
    for (let i = 0; i < size; i++) {
      if (game.board[i * size + (size - 1 - i)] !== player) break
      if (i === size - 1) {
        for (let j = 0; j < size; j++) {
          line.push({ row: j, col: size - 1 - j })
        }
        return line
      }
    }
  }

  return []
}
