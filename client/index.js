import websocket from 'websocket-stream';
import BridgeClientDriver from '../lib/BridgeClientDriver';

export function initFivetwelveClient(websocketUrl) {
  // ---- init websocket and brower side dmx-output
  const socket = websocket(websocketUrl);
  const driver = new BridgeClientDriver();

  // ---- output-stream is tunneled through the websocket
  driver.pipe(socket);

  return driver;
}