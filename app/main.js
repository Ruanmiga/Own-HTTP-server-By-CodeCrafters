const net = require("net");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const path = (data.toString().split("\r\n")[0]).split(" ")[1];
        if(path === "/") {
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
        }else if(path === "/user-agent"){
        const userAgent = (data.toString().split("\r\n")[4]).split(" ")[1];
        console.log(userAgent);
        
        socket.write("HTTP/1.1 200 OK\r\n");
        socket.write("Content-Type: text/plain\r\n");
        socket.write("Content-Length: " + userAgent.length + "\r\n\r\n")
        socket.write(userAgent);
        }
        else if(path.includes("echo")){
        const param = path.substring(6, path.length);
        console.log(param);
        socket.write("HTTP/1.1 200 OK\r\n");
        socket.write("Content-Type: text/plain\r\n");
        socket.write("Content-Length: " + param.length + "\r\n\r\n")
        socket.write(param);
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
