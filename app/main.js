const net = require("net");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const path = (data.toString().split("\r\n")[0]).split(" ")[1];
        if(path === "/") {
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
        } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        }
        socket.end();
    });
    socket.on("close", () => {
        socket.end();
        server.close();
 });
});

server.listen(4221, "localhost");
