import path from 'path';
import http from 'http';
import websocket from 'websocket-stream';
import {Server as StaticServer} from 'node-static';

import BridgeInputStream from './lib/BridgeInputStream';

export function initFivetwelveBridge(output = null) {
  const fileServer = new StaticServer(path.join(__dirname, 'build'));
  const server = http.createServer((req, res) => {
    req.addListener('end', function () {
      fileServer.serve(req, res);
    }).resume();
  });

  let dmxInput = new BridgeInputStream(output);
  let websocketStream = null;

  websocket.createServer({server}, stream => {
    if (websocketStream) {
      // only supports one client for now: kick off any previous sender
      websocketStream.unpipe();
      websocketStream.end();
    }

    stream.pipe(dmxInput, {end: false});
    websocketStream = stream;
  });

  return {
    server,
    listen(...args) { server.listen(...args); },
    setOutput(output) { dmxInput.setOutput(output); }
  }
}