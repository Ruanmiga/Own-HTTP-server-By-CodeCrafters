const net = require("net");
const{ join }  = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const directory = args[0] === '--directory' ? args[1] : __dirname;

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const path = extractPath(data);

        if(path === "/") socket.write(makeResponse("200 Ok"));
        else if(path === "/user-agent"){
        const userAgent = searchHeader("User-Agent:", data);
        socket.write(makeResponse("200 Ok", "text/plain", userAgent.length, userAgent));
        }
        else if(path.includes("echo")){
        const param = path.substring(6, path.length);
        socket.write(makeResponse("200 Ok", "text/plain", param.length, param));
        }
        else if(path === "files"){
        const fileName = path.substring(6, path.length);
        const filePath = join(directory, fileName);

        if(fs.existsSync(filePath)){
            const file = fs.readFileSync(filePath);
            socket.write(makeResponse("200 Ok", "application/octet-stream", file.length, file));
        }
        else socket.write(makeResponse("404 Not Found"));
        }
        else socket.write(makeResponse("404 Not Found"));
        socket.end();
    });
    socket.on("close", () => {
        socket.end();
        server.close();
 });
});

server.listen(4221, "localhost");

function extractPath(data){
    return (data.toString().split("\r\n")[0]).split(" ")[1];
}

function extractHeaders(data){
    return data.toString().split("\r\n");
}

function searchHeader(name, data){
     const headers = data.toString().split("\r\n");
        for(let i = 0; i < headers.length; i++){
            if(headers[i].includes(name)){
                return headers[i].split(" ")[1];
            }
        }
    return null;
}

function makeResponse(code, type, length, body){
    let response = "";
    if(code) response += "HTTP/1.1 " + code + "\r\n";
    if(type) response += "Content-Type: " + type + "\r\n";
    if(length) response += "Content-Length: " + length + "\r\n";
    if(body) response += "\r\n" + body;
    else response += "\r\n";

    return response;
}