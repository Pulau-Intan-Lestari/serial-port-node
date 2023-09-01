const { SerialPort } = require('serialport')

const writePort = new SerialPort({
    path: '/dev/ttys007',
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

    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // The port is now open
    writePort.write(getRndInteger(10, 200).toString(), (err) => {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('Message written to port');
    });

    writePort.write("\r\n", (err) => {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('Message written to port');
    });
});