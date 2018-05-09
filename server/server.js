const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/createMessage');
const {isRealString} = require('./utils/validation.js');
const {generateLocationMessage} = require('./utils/createMessage');
const publicPath = path.join(__dirname + "/../public");
const port = process.env.PORT || 3000;
var app = express();
const {Users} = require('./utils/users');
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
io.on('connection' , (socket) => {
    console.log("new user connected");

    socket.on('disconnect' , () => {
        var user = users.removeUser(socket.id);
        io.to(user.room).emit('updateUserList' , users.getUserList(user.room));
        io.to(user.room).emit('newMessage' , generateMessage('admin' , `${user.name} left the ${user.room} room`));
    });

    socket.on('join' , (params , callback) => {

        if(!isRealString(params.room) || !isRealString(params.name)) {
            return callback('name and room name should be a valid string');
        }
        socket.join(params.room);
        users.addUser(socket.id , params.name , params.room);

        io.to(params.room).emit('updateUserList' , users.getUserList(params.room));
        socket.emit('newMessage' , {from: 'admin' , text: 'welcome to the chat app'});
        socket.broadcast.to(params.room).emit('newMessage' , generateMessage('admin' , `${params.name} joined`));
        
        callback();
    });

    socket.on('createMessage' , (message , callback) =>{
        console.log('createmessage' , message);
        var user = users.getUser(socket.id);
        if(user) {
            io.to(user.room).emit('newMessage' , generateMessage(message.from , message.text));
        }
        if(callback) {
            callback();
        }
    });


    socket.on('createLocationMessage' , (coords) => {
        var user = users.getUser(socket.id);
        if(user) {
            io.to(user.room).emit('newLocationMessage' , generateLocationMessage(coords.name , coords.latitude, coords.longitude));
        }
    });
});

app.use(express.static(publicPath));


server.listen(port, () => {
    console.log(`listening at port ${port}`);
});

