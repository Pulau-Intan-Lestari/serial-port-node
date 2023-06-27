const { SerialPort } = require("serialport");
const WebSocket = require("ws");
const term = require('terminal-kit').terminal;

const wsServer = "wss://api-ppic.c4budiman.com/socket-biasa";
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

let openws = true;
console.log(`
#      ____  ____  __________                         
#     / __ \/ __ \/  _/ ____/                         
#    / /_/ / /_/ // // /                              
#   / ____/ _____/ // /___                            
#  /_/   /_/   /___/\____/                                           
#     ______                            __            
#    / ________  ____  ____  ___  _____/ /_____  _____
#   / /   / __ \/ __ \/ __ \/ _ \/ ___/ __/ __ \/ ___/
#  / /___/ /_/ / / / / / / /  __/ /__/ /_/ /_/ / /    
#  \____/\____/_/ /_/_/ /_/\___/\___/\__/\____/_/     
#  ${group} - ${location}                                                   
`)

// Set up a WebSocket connection to the server
const ws = new WebSocket(wsServer);

ws.on("open", function open() {
  openws=true
  console.log(`WebSocket client connected to server ${wsServer}`);
  ws.send(JSON.stringify({ subscribe: 2, clientId: `${group}-${location}` }));
});

ws.on("close", function close() {
  console.log(`\nKoneksi ke ${wsServer} terputus... harap close dan buka kembali!`)
  console.log('program akan tertutup otomatis dalam 10 detik')
  openws=false
  setTimeout(() => {
    process.exit(0);
  }, 10000);
})

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
  if(!openws) {
    return;
  }
  console.log(`Connected to ${readoutPort}`);
  var dataWithinOneMinute = {};
  // Handle the data event
  var lineBuffer = "";
  var lastLineBuffer = "";
  readPort.on("data", function (data) {
    if(!openws) {
      return;
    }
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
      
      // Save cursor position
      term.saveCursor();
      term.moveTo(1, 17);
      term.eraseLine();
      term(`Receiving data from ${readoutPort}: ${lastLineBuffer}`);
      term.restoreCursor();

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
      // console.log(
      //   `Most frequent data within the last 10s is: ${mostFrequentData}`
      // );
      // Move the cursor to the beginning of the line below the "Receiving data" line (e.g., 4th line)
      term.moveTo(1, 18);
      term.eraseLine();
      term(`Most frequent data within the last 10s is: ${mostFrequentData}`);

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
