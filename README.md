# fivetwelve-bridge

The fivetwelve-bridge connects fivetwelve running in the browser to a
server-instance handling communication with the dmx-interfaces.

It provides a minimal http-server with websocket-support that takes
care of two things:

 - provides a browser-version of the fivetwelve-library as well as the
   driver required to transport dmx-data over the websocket.
 - automatically establishes the websocket-connection for the dmx-data
   from the browser to the server

## install

    npm install --save fivetwelve-bridge

## usage

### server-side

In node, you need to setup the output the bridge will be writing to
(this is the one that's connected to your dmx-interface) and attach the
bridge to it:

```javascript
import fivetwelve from 'fivetwelve';
import bridge from 'fivetwelve-bridge';

// setup the real dmx-output with your drivers
const output = fivetwelve(dmxDriver);
output.start(1000/30);

// start the bridge-server
const bridge = bridge(output);
bridge.listen(31821, 'localhost', () => {
  console.log('fivetwelve-bridge is listening on localhost:31821');
});
```

You can also start the bridge before the output is initialized:

```javascript

// start the bridge-server
const bridge = bridge(output);
bridge.listen(31821, 'localhost', () => {
  console.log('fivetwelve-bridge is listening on localhost:31821');
});

// then sometime later, when your output is available (or changed)
bridge.setOutput(dmxOutput);
```

(see also `dev-server.js` for a minimal example)

### client-side (simple)

In your browser-code you can load the client-library directly from the server started in the previous step:

```html
<script src="localhost:31821/fivetwelve-client.js"></script>
```

This will provide you with the full fivetwelve-library via the global variable
`window.fivetwelve` and the driver to connect to the server as `window.fivetwelve.driver`.
You can now use the following code to start using fivetwelve in the browser:

```javascript
const output = new fivetwelve.DmxOutput(fivetwelve.driver);
output.start(1000/30);

// initialize devices etc. – all changes to the outputs dmx-buffers will
// automatically appear on the server.
```


### client-side (bundled)

However, most of the time you are probably using a module-bundler anyway.
In this case, you might want to use this module as a library, which could be done like this:

```javascript
import fivetwelve from 'fivetwelve';
import {initFivetwelveClient} from 'fivetwelve-bridge/client';

const driver = initFivetwelveClient('ws://localhost:31821');
const output = fivetwelve(driver);
```

> **PLEASE NOTE** As all fivetwelve-modules, this module was written
> in ES6 using modules-syntax and does not provide a compiled-to-es5-version
> with the package. To consume this module, you will need to configure your
> application accordingly.
>
> For example by using `babel-register` like this:
>
> ```javascript
> require('babel-register')({
>   presets: ['node6'],
>   ignore: /node_modules\/(?!fivetwelve)/
> });
> ```

## testing and development

For running a quick test and for development, you can run

    npm install
    npm start

This will start a development-server on port 1234 that serves an empty
(well, except for loading `fivetwelve-client.js`) html-file as index.html
and prints the state of the dmx-universe received on the server to your
console.