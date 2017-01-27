var http = require('http');
var socketioJwt   = require("socketio-jwt");
var fs = require('fs');
var secretKey = fs.readFileSync('.secret.key').toString();
var clients = [];
var io = null;
var serverIp = ["::1", "127.0.0.1", "85.109.59.244"];

var server = http.createServer((request, res) => {
    var headers = request.headers;
    var method = request.method;
    var url = request.url;
    var ip = request.socket.remoteAddress.replace("::ffff:", "");
    var body = [];
    request.on('error', function(err) {
        console.error(err);
    }).on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        body = Buffer.concat(body).toString();
        if (serverIp.indexOf(ip) === -1) {
            res.statusCode = 400;
            res.end("Unauthorized");
            return;
        }
        try {
            data = JSON.parse(body);
            clients.filter(s => data.user_id === "*" || s.decoded_token.id == data.user_id).forEach(s => s.emit(data.subject, data.message));
            res.statusCode = 200;
            res.end(JSON.stringify('OK'));
        } catch (err) {
            res.statusCode = 400;
            res.end("400 - Bad request");
        }
    });
});

io = require('socket.io')(server);

io.use(socketioJwt.authorize({
    secret: secretKey,
    handshake: true
}));

io.on('connection', function(socket) {
    if (clients.indexOf(socket) === -1) clients.push(socket);

    socket.on('disconnect', function () {
        var index = clients.indexOf(socket);
        if (index !== -1) clients.splice(index ,1);
    });
});

server.listen(process.env.PORT || 9898);