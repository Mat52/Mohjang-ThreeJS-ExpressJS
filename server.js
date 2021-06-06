//======zmienne stałe======//

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
const PORT = process.env.PORT || 3000;

var Datastore = require('nedb');
const { debugPort } = require("process");
let room = 0
let clientNo = 0
let roomNo
var db = {}
db.players = new Datastore({
  filename: 'players.db',
  autoload: true
});


//CORS





//======pliki statyczne======//
app.use(express.static("dist"));

//======testowa tablica na użytkowników======//
let users = [];

//======get intro.html======//
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/dist/intro.html"));
});

app.get("/game", function (req, res) {
  res.sendFile(path.join(__dirname + "/dist/game.html"));
});
//======zdarzenie połączenia z socketem======//
io.on("connection", async (socket) => {
  

  
  clientNo++;
  console.log(clientNo)
  console.log("a user connected");
  //======zdarzenie rejestracji użytkownika======//
  socket.on("register user", (user) => {
    
    console.log(user)
      socket.join(Math.round(clientNo/2))
      roomNo = Math.round(clientNo/2)
      console.log("room" + roomNo)
      db.players.loadDatabase();
      let userkey = Math.random() * 10
      db.players.count({}, function (err, count) {
      let userId = userkey;
      socket.userkey = userkey;
      socket.join(userId)


      if (err) {
        console.log("błąd")
      }
      console.log(user + " zarejestrowany");
      
    var player = {
      name:user,
      points:0,
      userkey:userkey,
      room:roomNo,

  };
  io.to(userId).emit('serverMsg', roomNo);
  db.players.insert(player, function (err, newDoc) {      
  });
  db.players.find({room: roomNo}, function (err, docs) {
    users = docs
    io.to(userId).emit('users', users);

  })

  db.players.find({room: roomNo}, function (err, docs) {
    users = docs
    console.log(docs)
    var __FOUND = docs.find(function(post, index) {
      if(post.userkey != userkey)
        return true;
    });
    console.log(__FOUND);
    if(__FOUND != undefined){
      let name = __FOUND.name
      console.log(name)
      io.to(userId).emit('oponent', name);
      io.to(__FOUND.userkey).emit('oponent1', user)
    }

  })
  
  });
  
    })
    

    
  //======zdarzenie rozłączenia z socketem======//
  socket.on("ready", () => {
    db.players.loadDatabase();
    db.players.find({userkey: socket.userkey}, function (err, docs) {
      users = docs
      db.players.find({room: users[0].room}, function (err, docs) {
        users = docs
        var __FOUND = users.find(function(post, index) {
          if(post.userkey != socket.userkey)
            return true;
        });
        if(__FOUND != undefined){
          let userkey = __FOUND.userkey
          io.to(userkey).emit('opready', userkey)
        }
    })

    
  })
  socket.on("disconnect", () => {
   if(socket.userkey != undefined){
    var connectionMessage = socket.userkey + " Disconnected";
    console.log(connectionMessage);
    db.players.loadDatabase();
    db.players.find({userkey: socket.userkey}, function (err, docs) {
      users = docs
      console.log(users[0].room)
      db.players.find({room: users[0].room}, function (err, docs) {
        users = docs
        var __FOUND = users.find(function(post, index) {
          if(post.userkey != socket.userkey)
            return true;
        });
        if(__FOUND != undefined){
          let userkey = __FOUND.userkey
          io.to(userkey).emit('oponentdisconected', userkey)
        }
      
    })
    
     
  
    })
    
  }

  });
  socket.on('redirect', () =>{
    var destination = '/game';
    let userkey = socket.userkey
    io.to(userkey).emit('redirect', destination, userkey)
  })
  
});
})
//======nasłuch na określonym porcie======//
server.listen(PORT, function () {
  console.log(`server running at http://localhost:${PORT}/`);
});
