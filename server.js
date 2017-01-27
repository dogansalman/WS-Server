var io = require('socket.io')(9898);
var socketioJwt   = require("socketio-jwt");
var fs = require('fs');

var secretKey = fs.readFileSync('.secret.key').toString();

io.use(socketioJwt.authorize({
    secret: secretKey,
    handshake: true
}));

io.on('connection', function(socket) {
    io.emit('connected', socket.decoded_token);

    socket.on('notification', function (data) {
        io.emit('notification', data);
    });

    socket.on('message', function (data) {
        io.emit('message', data);
    });

    socket.on('disconnect', function () {
        io.emit('disconnected');
    });
});

