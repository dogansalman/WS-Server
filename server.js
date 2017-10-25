var http = require('http');
var fs = require('fs');
var clients = [];
var io = null;

var server = http.createServer((request, res) => {
    var headers = request.headers;
    var method = request.method;
    var url = request.url;

    request.on('error', function(err) {
        console.error(err);
    }).on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
		if(url.indexOf('.well-known/acme-challenge/') < 0) {
            res.statusCode = 401;
            res.end("Unauthorized");
		} else {
			res.statusCode = 200;
			res.end(fs.readFileSync('.well-known/acme-challenge/' + url.split("/").slice(-1)).toString());
		}
    });
});

io = require('socket.io')(server);
io.on('connection', function(socket) {

    if(typeof socket.handshake.query.user != 'undefined' && clients.filter(s => s.handshake.query.user === data.user_id).length === 0 ){
        clients.push(socket);
    }  
    
    socket.on('disconnect', function () {
        var index = clients.indexOf(socket);
        if (index !== -1) clients.splice(index ,1);
    });

    socket.on('emit', function (data) {
        clients.filter(s => parseInt(s.handshake.query.user) === parseInt(data.user_id)).forEach(s => s.emit(data.subject, data.message));
    });

});

server.listen(process.env.PORT || 9898);