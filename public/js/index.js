var socket = io();

socket.on('connect' , function() {
    console.log('new user connected');
})
socket.on('newMessage' , function(message) {
    console.log('new message' , message);
    var li = $('<li></li>');
    li.text(`${message.from}: ${message.text}`);

    $('#messages').append(li);
});

socket.on('disconnect' , function() {
    console.log('user disconnected');
});

$('#message-form').on('submit' , function(e) {
    e.preventDefault();
    
    socket.emit('createMessage' , {
        from: 'User',
        text: $('[name=message]').val()
    });
});