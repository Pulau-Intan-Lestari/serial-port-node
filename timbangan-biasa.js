const { SerialPort } = require("serialport");
const WebSocket = require("ws");

const wsServer = "ws://c4budiman.com:9334";
const readoutPort = "COM7";
const group = "little-scale";
const location = "cikawung";
const type = 1;

const readPort = new SerialPort({
  path: readoutPort,
  baudRate: 2400,
  dataBits: 7,
  parity: "even",
  stopBits: 1,
  autoOpen: false,
});

// Set up a WebSocket connection to the server
const ws = new WebSocket(wsServer);

ws.on("open", function open() {
  console.log(`WebSocket client connected to server ${wsServer}`);
});

ws.on("error", function error(err) {
  console.error("WebSocket encountered error: ", err.message);
  console.log("Harap restart aplikasi jika error tetap muncul, hubungi admin");
});

readPort.open(function (err) {
  if (err) {
    console.log("Error opening read port: ", err.message);
    console.log(
      "Harap restart aplikasi jika error tetap muncul, hubungi admin"
    );
    return;
  }
  console.log(`Connected to ${readoutPort}`);
  var dataWithinOneMinute = {};
  // Handle the data event
  var lineBuffer = "";
  var lastLineBuffer = "";
  readPort.on("data", function (data) {
    lineBuffer += data.toString();
    if (lineBuffer.indexOf("\r\n") != -1) {
      lastLineBuffer = Number(lineBuffer.match(/\d+/g)?.join("."));
      // console.log(lastLineBuffer)
      if((lastLineBuffer === 0)) {
        // console.log(0)
        lineBuffer = "";
        return;
      }
      if(isNaN(lastLineBuffer)) {
        // console.log('nan')
        lineBuffer = "";
        return;
      }
      
      console.log(`Receiving data from ${readoutPort}: ${lastLineBuffer}`);

      // Keep track of data within one minute
      if (dataWithinOneMinute[lastLineBuffer]) {
        dataWithinOneMinute[lastLineBuffer]++;
      } else {
        dataWithinOneMinute[lastLineBuffer] = 1;
      }

      lineBuffer = "";
    }
  });

  setInterval(() => {
    var mostFrequentData = null;
    var maxCount = 0;

    // Find the most frequent data
    for (const data in dataWithinOneMinute) {
      if (dataWithinOneMinute[data] > maxCount) {
        maxCount = dataWithinOneMinute[data];
        mostFrequentData = data;
      }
    }

    if (mostFrequentData != null) {
      console.log(
        `Most frequent data within the last 10s is: ${mostFrequentData}`
      );
      if (ws.readyState === WebSocket.OPEN) {
        const object = {
          group,
          location,
          type,
          data: mostFrequentData.toString(),
        };
        const datasend = JSON.stringify(object).toString();
        ws.send(datasend, (err) => {
          if (err) {
            return console.log(
              "Error Sending data To Websocket Server: ",
              err.message
            );
          }
        });
      }
    }

    // Clear the data
    dataWithinOneMinute = {};
  }, 10 * 1000);
});
