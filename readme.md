# Exactly what the hell is this repo all about?

<img src="percoman.PNG">
well your gewinn scale and all other things are in iot device using real serial ports to sending data. so this repo basically just wrap that data sended into computer and into our socket server. then the server processed the received data into one of our clients (web / apps)

# Testing
you need a virtual com, like a pair of com 5 and com 6. you can do that by downloading virtual serial port driver
recommended and free : 

https://freevirtualserialports.com/

- change the connection in test-read.js and test-write.js with your virtual port.
- for example if my computer is com5 the other computer that receiving one is com6. then in test-read.js you specify com6. and in test-write.js you specify com5.
- run the read first
- and then run the write.

if you getting data in read, then the connections is successful...

now test it on real device in the fields.