const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/createMessage');
const {generateLocationMessage} = require('./utils/createMessage');
const publicPath = path.join(__dirname + "/../public");
const port = process.env.port || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

io.on('connection' , (socket) => {
    console.log("new user connected");

    socket.on('disconnect' , () => {
        console.log('user was disconnected');
    });

    socket.emit('newMessage' , generateMessage('admin' , 'welcome to chat app'));

    socket.broadcast.emit('newMessage' , generateMessage('admin' , 'new user joined'));

    socket.on('createMessage' , (message , callback) =>{
        console.log('createmessage' , message);
        io.emit('newMessage' , generateMessage(message.from , message.text));
        if(callback) {
            callback();
        }
    });

    socket.on('createLocationMessage' , (coords) => {
        io.emit('newLocationMessage' , generateLocationMessage('admin' , coords.latitude, coords.longitude));
    });
});

app.use(express.static(publicPath));


server.listen(port, () => {
    console.log(`listening at port ${port}`);
});

