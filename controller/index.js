"use strict";

const express = require("express");
const fs = require("fs");
//const https = require("https");
const http = require("http");
const ws = require("ws");
const cors = require("cors");

const app = express();

const options = {
    index: "index.html",
};

app.use(cors());
app.use(express.static(__dirname + "/static", options));

const server = http.createServer(
    //const server = https.createServer(
    /*{
        key: fs.readFileSync(`${__dirname}/../privkey.pem`, "utf8"),
        cert: fs.readFileSync(`${__dirname}/../fullchain.pem`, "utf8"),
    },*/
    app
);

const wss = new ws.WebSocketServer({ server });

wss.on("connection", (socket, req) => {
    //This server becomes a repeater
    socket.on("message", (msg) => {
        console.log("msg: ", msg.toString());
        socket.send(msg.toString());
        wss.clients.forEach((client) => {
            client.send(msg.toString());
        });
    });

    const heartbeat = setInterval(() => {
        wss.clients.forEach((client) => {
            client.send(JSON.stringify({ heartbeat: "ping" }));
        });
    }, 3000);
});

server.listen(80, "localhost");
server.on("listening", () =>
    console.log("LD Sync Controller listening on port 443!")
);
