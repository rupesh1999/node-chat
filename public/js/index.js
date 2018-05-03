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

socket.on('newLocationMessage' , function(message) {
    var li= $('<li></li>');
    var a = $('<a target="_blank">My Current Location</a>');

    li.text(`${message.from}: `);
    a.attr('href', message.url);
    li.append(a);

    $('#messages').append(li);
});

$('#message-form').on('submit' , function(e) {
    e.preventDefault();
    
    socket.emit('createMessage' , {
        from: 'User',
        text: $('[name=message]').val()
    } , function() {
        $('[name=message]').val('')
    });
});

var locationButton = $('#send-location');

locationButton.on('click' , function() {
    if(!navigator.geolocation) {
        return alert('geolocation not supported by your browser');
    }

    locationButton.attr('disabled' , 'disabled').text('Sending Location...');

    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage' , {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function() {
        locationButton.removeAttr('disabled').text('Send Location');
        alert('unable to fetch location');
    });
});