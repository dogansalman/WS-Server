var io = require('socket.io')(process.env.PORT);
var socketioJwt   = require("socketio-jwt");
var fs = require('fs');

var secretKey = fs.readFileSync('.secret.key').toString();

io.use(socketioJwt.authorize({
    secret: secretKey,
    handshake: true
}));

io.on('connection', function(socket) {
    if (socket.decoded_token.isServer) io.emit('connected', socket.decoded_token);

    socket.on('notification', function (data) {
        if (typeof data != "object" || !data.hasOwnProperty('user_id')) return;
        if (socket.decoded_token.id == data.user_id) io.emit('notification', data);
    });

    socket.on('message', function (data) {
        if (typeof data != "object" || !data.hasOwnProperty('user_id')) return;
        if (socket.decoded_token.id == data.user_id) io.emit('notification', data);
    });

    socket.on('disconnect', function () {
        if (socket.decoded_token.isServer) io.emit('disconnected', socket.decoded_token);
    });
});

