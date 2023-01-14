// when we're creating a web server, it can use both express and socketio, it requires to set up express in a slightly different way

const path = require('path');
const http = require('http');
const cookieParser = require('cookie-parser'); //----------------

const express = require('express');
require('./db/mongoose');

const userRouter = require('./routers/user');
const roomRouter = require('./routers/room');

const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocMessage } = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
// server is created and express application is passed into it
// if we dont do it, the express librery does this behind the scenes
const server = http.createServer(app);
// instance of socket.io so that server supports web sockets
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
app.use(express.json());
app.use(cookieParser());
app.use(userRouter);
app.use(roomRouter.router);

// socket is an object that contains information about that('connection') new connection
io.on('connection', socket => {
  console.log('New web socket connection');

  socket.on('join', (options /*{username, room}*/, callback) => {
    const { error, user } = addUser({
      /*here '...' is the spread operator spreading the options object*/
      id: socket.id,
      ...options /*username, room*/,
    });

    if (error) {
      return callback(error);
    }

    /*socket.join will join individual rooms
    can only be used by server*/
    socket.join(user.room);

    /*here generatemsg creates an object*/
    socket.emit('message', generateMessage('Admin', 'Welcome!'));
    /*here .broadcast.emit works same as emit but it will send it(msg) to everybody except this(socket.broadcast) socket
    to(room) emit event to a specific room stored in room variable*/
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('Admin', `${user.username} has joined!`)
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('sendMessage', (msg, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed!!');
    }
    io.to(user.room).emit('message', generateMessage(user.username, msg));

    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'locMessage',
      generateLocMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );

    callback();
  });

  /*LOCK BUTTON*/
  socket.on('lock', async (btnText, callback) => {
    const user = getUser(socket.id);
    const room = user.room;

    const state = await roomRouter.stateChanged(room, btnText);

    io.to(room).emit('lockedStateChanged', state);

    callback();
  });

  /*built in event 'disconnect' should match excatly.
  Should be in connection callback */
  socket.on('disconnect', async () => {
    const user = removeUser(socket.id);

    if (user) {
      /*DELETE EMPTY ROOM*/
      const users = getUsersInRoom(user.room);
      const isEmpty = Object.keys(users).length === 0;

      if (isEmpty) {
        await roomRouter.deleteRoom(user.room);
      }

      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.username} has left!`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is on the port of ${port}!!!`);
});

/*SHORT SUMMARY:
1. socket.emit() --> To emit to that particular connection

2. socket.broadcast.emit() --> To emit it to everybody except that particular connection

3. io.emit() --> To send it to everyone 

FOR ROOMS (VARIATIONS OF 2 & 3)
3.1 io.to.emit --> To everybody in a specific room
2.1 socket.broadcast.to.emit --> To everyone except for the specific client in a specific room*/
