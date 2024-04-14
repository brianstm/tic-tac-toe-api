const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8000"],
    credentials: true,
  })
);

app.get("/", async (req, res) => {
  try {
    res.status(200).json("Welcome to the Envogue API");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/new-game", async (req, res) => {
  try {
    let client = await MongoClient.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
    });
    const database = client.db("account");
    const collection = database.collection("spa_user");

    if (
      req.body.username === process.env.ENVOGUEADMINSSID &&
      req.body.password === process.env.ENVOGUEADMINPASSWORD
    ) {
      return res.status(200).json({
        name: "envogueadmin",
        spa_id: "admin",
        token: "adminnotoken",
      });
    }

    const user = await collection.findOne({ username: req.body.username });

    if (!user) {
      return res.status(400).json("Cannot find user");
    }

    if (
      await bcrypt.compare(req.body.password + process.env.SALT, user.password)
    ) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      });

      await collection.updateOne({ _id: user._id }, { $set: { token: token } });

      res.status(200).json({
        token: token,
        spa_id: user.spa_id,
        name: user.name,
      });
    } else {
      res.status(401).json("Invalid password");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (client) {
      client.close();
    }
  }
});

module.exports = app;
