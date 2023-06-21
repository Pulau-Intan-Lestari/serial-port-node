const { SerialPort } = require('serialport')

const writePort = new SerialPort({
    path: 'COM4',
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    autoOpen: false,
});

writePort.open(function (err) {
    if (err) {
        return console.log('Error opening write port: ', err.message);
    }

    // The port is now open
    writePort.write("100", (err) => {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('Message written to port');
    });
});