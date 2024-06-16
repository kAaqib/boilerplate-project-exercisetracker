const express = require('express')
const app = express()
const cors = require('cors')
const mon = require('mongoose');
const bodyParser = require('body-parser');
require('node:util')
require('dotenv').config()

mon.connect("mongodb+srv://fccdb:fccdb@cluster0.teunbos.mongodb.net/fccdb?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true });
const exeSchema = mon.Schema({
  username: String,
  count: {type: Number, default: 0},
  log: [{
    description: String,
    duration: String,
    date: Date
  }],
});

const exeModel = mon.model("exeModel", exeSchema);

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", function(req, res) {
  const uname = req.body.username;
  var user = new exeModel({
    username: uname
  })
  user.save()
  if (uname != "") {
    exeModel.findOne({username: uname})
      .then(function(data) {
        const id = data._id;
        //res.send(data);
        res.json({username: uname, _id: id})
      })
    }
});

app.get("/api/users", function(req, res) {
  exeModel.find()
    .then(function(users) {
      var userMap = [];
      users.forEach(function(user) {
        userMap.push = user;
      });
      res.send(users);
    })
});

app.post("/api/users/:_id/exercises", function(req, res) {
  const id = req.params._id;
  const desc = req.body.description;
  const dur = req.body.duration;
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const d = new Date(date);
  const exe = {description: desc, duration: dur, date: date}
  exeModel.findById({_id: id})
    .then(function(user) {
      user.log.push(exe);
      user.count++;
      user.save()
      .then(function(updatedUser) {
        const formattedUser = updatedUser.toObject();
        formattedUser.log = formattedUser.log.map(entry => ({
          description: entry.description,
          duration: entry.duration,
          date: entry.date.toDateString() // format the date
        }));
      })
      res.json({_id: id, username: user.username, date: d.toDateString(), duration: dur, description: desc});
    })
});

app.get("/api/users/:_id/logs", function(req, res) {
  const id = req.params._id;
  exeModel.findById({_id: id})
    .select({__v: 0})
    .then(function(user) {
      const formattedUser = user.toObject();
      formattedUser.log = formattedUser.log.map(entry => ({
        description: entry.description,
        duration: Number(entry.duration),
        date: entry.date.toDateString() // format the date
      }));
      res.status(200).send(formattedUser);
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
