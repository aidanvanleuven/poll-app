const io = require("socket.io")();

const socketapi = {
  io: io
};

io.on("connection", function (socket) {
  var split = socket.handshake.headers.referer.split('/');
  var id = split[split.length - 1];
  socket.join(id);
});

module.exports = socketapi;