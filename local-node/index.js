"use strict";
const ws = require("ws");
const dmx = require("enttec-open-dmx-usb");
const dmxDevice = dmx.EnttecOpenDMXUSBDevice;

(async () => {
    const socket = new ws.WebSocket("wss://wl-vz-nyc.ldsync.com");
    //const socket = new ws.WebSocket("ws://localhost:80");
    socket.on("open", function open() {
        console.log("Connected to the controller.");
    });

    const device = new dmxDevice(await dmxDevice.getFirstAvailableDevice());

    socket.on("message", (data) => {
        console.log("received ", JSON.parse(data.toString()));
        const signal = JSON.parse(data.toString());

        device.setChannels({
            [signal.ch]: signal.val,
        });
    });
})();
