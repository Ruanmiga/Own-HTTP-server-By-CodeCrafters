const net = require("net");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        console.log(data.toString().split("\r\n")[0]);
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
        socket.end();
    });
    socket.on("close", () => {
        socket.end();
        server.close();
 });
});

server.listen(4221, "localhost");
