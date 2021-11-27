"use strict";

const express = require("express");
const fs = require("fs");
const https = require("https");
const ws = require("ws");

const app = express();

app.use(express.static("static"));

app.get("/", (req, res) => {
    res.send("Hello from the LD Sync Controller!");
});

const server = https.createServer(
    {
        key: fs.readFileSync(`${__dirname}/../privkey.pem`, "utf8"),
        cert: fs.readFileSync(`${__dirname}/../fullchain.pem`, "utf8"),
    },
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

    socket.send("some text");
});

server.listen(443, () =>
    console.log("LD Sync Controller listening on port 443!")
);
