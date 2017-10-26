import {Readable} from 'readable-stream';

export default class BridgeClientDriver extends Readable {
  constructor() {
    super();

    this.dmxBuffers = {};
    this.initialized = {};
  }

  send(buffer, universe) {
    const universeIndex = universe - 1;
    const diff = [];
    const numChannels = Math.min(buffer.length, 512);

    let dmxBuffer = this.dmxBuffers[universeIndex];
    if (!dmxBuffer) {
      dmxBuffer = this.addUniverse(universeIndex);
    }

    const isInitialized = this.initialized[universeIndex];

    // determine changes and update local state
    for (let channel = 0; channel < numChannels; channel++) {
      // when initializing a universe, send all values as 0
      if (!isInitialized || dmxBuffer[channel] !== buffer[channel]) {
        const channelNo = (universe << 9) | (channel & 0x01ff);
        dmxBuffer[channel] = buffer[channel];
        diff.push([channelNo, buffer[channel]]);
      }
    }

    if (diff.length === 0) {
      return;
    }

    // bring diff into binary format
    let msgBuf = new Buffer(diff.length * 3);
    for (let i = 0; i < diff.length; i++) {
      msgBuf.writeUInt16BE(diff[i][0], i * 3);
      msgBuf.writeUInt8(diff[i][1], i * 3 + 2);
    }

    this.push(msgBuf);
    this.initialized[universeIndex] = true;
  }

  addUniverse(index) {
    const buffer = new Buffer(512);
    buffer.fill(0);

    this.dmxBuffers[index] = buffer;
    this.initialized[index] = false;

    return buffer;
  }

  _read() {
    // nothing to do
  }
}
