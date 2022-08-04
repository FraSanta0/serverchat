const express = require('express');
const cors = require('cors');
const { Socket } = require('socket.io');

const app = express();
const http = require('http').createServer(app);

const io = require('socket.io')(http, {
    cors : {
        origin: '*'
    }
});

app.get('/', (req,res) => {
    res.send('Hello world');
});

let userList = new Map();

io.on('connection', (socket) => {
    let id_account = socket.handshake.query.id_account;
    let room1;

    socket.on('message', (msg) => {
        console.log(msg);
        socket.broadcast.emit('message-broadcast', {message: msg.msg, id_account: id_account, date: msg.date, time: msg.time});
    })

    socket.on('messageRoom', (msg) => {
        console.log(msg);
        socket.in(room1).emit('message2', {message: msg.msg, id_account: id_account, date: msg.date, time: msg.time});
    })

    socket.on('disconnect', (reason) => {
        removeUser(id_account, socket.id);
    })

    socket.on('create', (room) => {
        socket.join(room);
        io.sockets.in(room).emit('connectToRoom', "You are in room no. "+room);
        room1=room;
        addUser(id_account, socket.id);
        socket.broadcast.emit('user-list', [...userList.keys()]);
        socket.emit('user-list', [...userList.keys()]);
      });
});

function addUser(id_account, id) {
    if(!userList.has(id_account)) {
        userList.set(id_account, new Set(id));
    } else {
        userList.get(id_account).add(id);
    }
}

function removeUser(id_account, id) {
    if(userList.has(id_account)) {
        let userIds = userList.get(id_account);
        if(userIds.size == 0){
            userList.delete(id_account);
        }
    }
}

http.listen(3000, () => {
    console.log('server is running')
});