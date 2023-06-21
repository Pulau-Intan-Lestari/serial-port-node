const { SerialPort } = require('serialport')

const readPort = new SerialPort({
    path: 'COM3',
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    autoOpen: false,
});

readPort.open(function (err) {
    if (err) {
        return console.log('Error opening read port: ', err.message);
    }

    // Handle the data event
    readPort.on('data', function (data) {
        console.log('Data received: ' + data);
    });
});
