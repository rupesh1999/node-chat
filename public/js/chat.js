var socket = io();

function scrollToBottom() {

    var messages = $('#messages');
    var newMessage = messages.children('li:last-child');
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if(clientHeight + scrollTop +newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect' , function() {
    var params = $.deparam(window.location.search);
    socket.emit('join' , params , function(err) {
        if(err) {
            alert(err);
            window.location.href= '/' ;
        }else {
            console.log('no errors');
        }
    });
});


socket.on('newMessage' , function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template =$('#message-template').html();
    var html = Mustache.render(template , {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });
    $('#messages').append(html);
    scrollToBottom();
  /*  console.log('new message' , message);
    var li = $('<li></li>');
    li.text(`${message.from} ${formattedTime}: ${message.text}`);

    $('#messages').append(li);*/
});

socket.on('disconnect' , function() {
    console.log('user disconnected');
});

socket.on('updateUserList' , function(users) {
    var ol = $('<ol></ol>');

    users.forEach( function (user) {
        ol.append($('<li></li>').text(user));
    });
    $('#users').html(ol);
 });


socket.on('newLocationMessage' , function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template =$('#location-message-template').html();
    var html = Mustache.render(template , {
        url: message.url,
        from: message.from,
        createdAt: formattedTime
    });
    scrollToBottom();
    $('#messages').append(html);

    /* var li= $('<li></li>');
    var a = $('<a target="_blank">My Current Location</a>');

    li.text(`${message.from}: `);
    a.attr('href', message.url);
    li.append(a);*/
});

$('#message-form').on('submit' , function(e) {
    e.preventDefault();
    var details = $.deparam(window.location.search);
    socket.emit('createMessage' , {
        from: details.name,
        text: $('[name=message]').val(),
        name: details.name,
        room: details.room
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
        var details = $.deparam(window.location.search);
        socket.emit('createLocationMessage' , {
            name: details.name,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function() {
        locationButton.removeAttr('disabled').text('Send Location');
        alert('unable to fetch location');
    });
});