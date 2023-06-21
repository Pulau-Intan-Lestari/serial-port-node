const { SerialPort } = require("serialport");
const WebSocket = require("ws");

const readPort = new SerialPort({
  path: "COM3",
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  autoOpen: false,
});

// Set up a WebSocket connection to the server
const ws = new WebSocket("ws://127.0.0.1:9334");

ws.on("open", function open() {
  console.log("WebSocket client connected");
});

ws.on("error", function error(err) {
  console.error("WebSocket encountered error: ", err.message);
});

readPort.open(function (err) {
  if (err) {
    return console.log("Error opening read port: ", err.message);
  }

  // Handle the data event
  readPort.on("data", function (data) {
    console.log("Data received: " + data);
    // send it to our socket server
    if (ws.readyState === WebSocket.OPEN) {
      const object = {
        type: 1,
        data: data.toString(),
      };
      const datasend = JSON.stringify(object).toString()
      ws.send(datasend);
    }
  });
});
