const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const port = 3000;
const fs = require("fs");
const cors = require("cors");
const games = require("./db.json");

const dbFilePath = "./db.json";

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  res.send("JoGames Middleware active :)");
});

app.get("/data", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };

  res.sendFile(dbFilePath, options, (err) => {
    if (err) console.log(err);
  });
});

app.get("/game/:id", (req, res) => {
  const selectedGame = games.find((game) => game.id === +req.params.id);
  res.send({ game: selectedGame });
});

app.post("/addComment", (req, res) => {
  const { id, comment } = req.body;
  addComment(comment, id);
  saveGames();
  res.send({ status: 200, message: "Comment posted successfully" });
});

app.post("/addRating", (req, res) => {
  const { id, rate } = req.body;

  addRating(rate, id);
  saveGames();
  res.send({ status: 200, message: "Game rated successfully" });
});

app.post("/removeComment", (req, res) => {
  const { gameId, commentId } = req.body;
  removeComment(gameId, commentId);
  saveGames();
  res.send({ status: 200, message: "Comment removed successfully" });
});

app.post(`/updateComment`, (req, res) => {
  const { comment } = req.body;
  const { gameId, commentId } = req.query;

  updateComment(+gameId, +commentId, comment);
  saveGames();
  res.send({ status: 200, message: "Comment edited successfully" });
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

function saveGames() {
  if (fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify(games), (err) => {
      console.log(err);
    });
  } else {
    //Create a file here
    console.log("File does not exist");
  }
}

function addComment(comment, id) {
  const currentDate = new Date().toLocaleDateString("de-DE");
  games.find((game) => game.id === id).comments.push(comment);
}

function addRating(rating, id) {
  games.find((game) => game.id === id).rate = rating;
}

function removeComment(id, commentId) {
  const targetedGame = games.find((game) => game.id === id);
  targetedGame.comments = targetedGame.comments.filter(
    (cm, index) => index !== commentId
  );
}

function updateComment(gameId, commentId, comment) {
  const selectedGame = games.find((game) => game.id === gameId);
  selectedGame.comments[commentId].comment = comment;
  selectedGame.comments[commentId].isEdited = true;
}
