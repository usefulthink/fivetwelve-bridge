import path from 'path';
import http from 'http';
import websocket from 'websocket-stream';
import {Server as StaticServer} from 'node-static';

import BridgeInputStream from './lib/BridgeInputStream';

let clientId = 0;
let dmxOutput = null;

const clientStates = {};

function updateOutputBuffers(clientId = null, buffers = null) {
  if (clientId !== null) {
    clientStates[clientId] = buffers;
  }

  if (!dmxOutput) {
    return;
  }

  const activeClientIds = Object.keys(clientStates);
  const numUniverses =
    activeClientIds.reduce((max, id) => {
      const universeIndices = Object.keys(clientStates[id]).map(Number);
      return Math.max(max, ...universeIndices);
    }, 0) + 1;

  for (let i = 0; i < numUniverses; i++) {
    const destBuffer = dmxOutput.getBuffer(i + 1);
    const sources = activeClientIds
      .map(id => clientStates[id][i])
      .filter(Boolean);

    for (let j = 0; j < destBuffer.length; j++) {
      destBuffer[j] = Math.max(...sources.map(sourceBuffer => sourceBuffer[j]));
    }
  }
}

export function initFivetwelveBridge(output = null) {
  const fileServer = new StaticServer(path.join(__dirname, 'build'));
  const server = http.createServer((req, res) => {
    req
      .addListener('end', function() {
        fileServer.serve(req, res);
      })
      .resume();
  });

  dmxOutput = output;

  websocket.createServer({server}, websocketStream => {
    const id = ++clientId;
    const inputStream = new BridgeInputStream();

    console.log('client connected: ', id);
    inputStream.on('dmxdata', buffers => {
      updateOutputBuffers(id, buffers);
    });
    websocketStream.pipe(inputStream);
    websocketStream.on('end', () => {
      console.log('stream ended');
      delete clientStates[id];
      updateOutputBuffers();
    });
  });

  return {
    server,
    listen(...args) {
      server.listen(...args);
    },
    setOutput(output) {
      dmxOutput = output;
    }
  };
}
