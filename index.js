const express = require('express')
const app = express()
const cors = require('cors')
const mon = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config()

mon.connect("mongodb+srv://fccdb:fccdb@cluster0.teunbos.mongodb.net/fccdb?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true });
const exeSchema = mon.Schema({
  username: String,
  log: [{
    description: String,
    duration: String,
    date: Date
  }]
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
  exeModel.findOne({username: uname})
    .then(function(data) {
      const id = data._id;
      res.json({username: uname, _id: id})
    })
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
