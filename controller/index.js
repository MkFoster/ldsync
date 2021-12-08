"use strict";

const express = require("express");
const fs = require("fs");
//const https = require("https");
const http = require("http");
const ws = require("ws");
const cors = require("cors");
require("dotenv").config({ path: "variables.env" });

//Todo: Replace authentication with a proper auth mechanism (I.e., Express w/Passport)
var userList = {
    ld: process.env.LD_PASS,
};

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

let heartbeat = false;

wss.on("connection", (socket, req) => {
    //This server becomes a repeater
    socket.on("message", (msg) => {
        const msgStr = msg.toString();
        //console.log("msgStr: ", msgStr);
        const msgObj = JSON.parse(msgStr);
        if (msgObj.type == "auth") {
            if (authenticate(msgObj.user, msgObj.password)) {
                socket.authenticated = true;
                socket.send(JSON.stringify({ type: "authOK" }));
                console.log(msgObj.user + " has authenticated.");
            } else {
                socket.send(JSON.stringify({ type: "authFailed" }));
                console.log(msgObj.user + " failed login.");
            }
        } else {
            if (socket.authenticated) {
                socket.authenticated = true;
                wss.clients.forEach((client) => {
                    if (
                        client !== socket &&
                        client.readyState === WebSocket.OPEN
                    ) {
                        client.send(msgStr);
                    }
                });
            }
        }
    });

    if (!heartbeat) {
        heartbeat = setInterval(() => {
            wss.clients.forEach((client) => {
                client.send(JSON.stringify({ heartbeat: "ping" }));
            });
        }, 3000);
    }
    console.log("Num Clients: ", wss.clients.size);
});

function authenticate(user, password) {
    if (userList[user] && userList[user] == password) {
        return true;
    } else {
        return false;
    }
}

server.listen(80, "localhost");
server.on("listening", () =>
    console.log("LD Sync Controller listening on port 443!")
);
