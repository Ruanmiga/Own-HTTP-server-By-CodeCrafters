const net = require("net");
const{ join }  = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const directory = args[0] === '--directory' ? args[1] : __dirname;

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const path = extractPath(data);
        const method = extractMethod(data);

        if(path === "/" && method === "GET") socket.write(makeResponse("200 Ok"));
        else if(path === "/user-agent" && method === "GET"){
        const userAgent = searchHeader("User-Agent:", data);
        socket.write(makeResponse("200 Ok", "text/plain", userAgent.length, userAgent));
        }
        else if(path.includes("echo") && method === "GET"){
        const param = path.substring(6, path.length);
        socket.write(makeResponse("200 Ok", "text/plain", param.length, param));
        }
        else if(path.includes("files") && method === "GET"){
        const fileName = path.substring(7, path.length);
        const filePath = join(directory, fileName);

        try{
            const file = fs.readFileSync(filePath);
            socket.write(makeResponse("200 Ok", "application/octet-stream", file.length, file));
        }catch(err){
            socket.write(makeResponse("404 Not Found"));
        }
        }
        else if(path.includes("files") && method === "POST"){
        const fileName = path.substring(7, path.length);
        const filePath = join(directory, fileName);
        const fileContent = extractBody(data);
        console.log(fileContent);
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

function extractMethod(data){
    return (data.toString().split("\r\n")[0]).split(" ")[0];
}

function extractPath(data){
    return (data.toString().split("\r\n")[0]).split(" ")[1];
}

function extractHeaders(data){
    return data.toString().split("\r\n");
}

function extractBody(data){
    const headers = extractHeaders(data);
    let body = "";
    for(let i = 0; i < headers.length; i++){
        if(headers[i] === ""){
            body = headers.slice(i + 1, headers.length).join("\r\n");
            break;
        }
    }
    return body;
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