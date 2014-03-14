# while-connected [![Build Status](https://travis-ci.org/jasonkuhrt/while-connected.png?branch=master)](https://travis-ci.org/jasonkuhrt/while-connected)


Invoke a function given that the socket is connected


## Installation

    npm install while-connected



## Example

```js
var whileConnected = require('while-connected');

...

tcpServer.on('connection', function(socket){
  socket.id = ...;
  trackConnection(socket, 5000);
})

// Every milliseconds update a database field
// regarding this sockets connection status.
function trackConnection(socket, interval_ms){
  var key = 'connections:'+ conn.id;
  // Make the key's ttl slightly longer than our loop
  // to minimize false positives.
  var key_ttl = (interval_ms/1000) + 2;

  whileConnected(socket, ms, function(again){
    // Refresh a database key re this socket's
    // connection that expires in 7 seconds.
    db.setex(key, key_ttl, true, function(){
      if (err) return console.error(err);
      again();
    });
  });
}
```



## API

#### whileConnected(socket, debounce_ms, handler(again()))

    whileConnected :: Socket a, Int b, (( -> void) -> *) -> void

  - `socket` –– An instance of or inherited from `net.Socket`.

  - `debounce_ms` –– The maximum loop speed. See `handler` for more info.

  - `handler` ––

    Run some desired logic while the socket is connected.

    `handler` receives `again` function. Invoke `again` to re-run
    handler.

    1. `whileConnected` is invoked
      - if `socket` is connected: `handler(again)` (goto 2)
    2. `debounce_ms` countdown begins, once done goto 3
    3. if `again()` occured: `handler(again)` (goto 2)
      - otherwise, when next `again()` does occur: `handler(again)` (goto 2)

    Multiple `again()`s in a single "loop" is a noop.

    Immediately upon `socket` disconnection, `handler(again)` never occurs again. Loop effectively stops if it is running, `again` is a noop, etc.


