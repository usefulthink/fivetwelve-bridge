import {Writable} from 'readable-stream';

export default class BridgeInputStream extends Writable {
  constructor(output = null) {
    super();

    this.setOutput(output);
    this.dmxBuffers = [];
  }

  setOutput(output) {
    this.output = output;
  }

  addUniverse(index) {
    this.dmxBuffers[index] = new Buffer(512);
    this.dmxBuffers[index].fill(0);
  }

  _write(buffer, encoding, callback) {
    const n = buffer.length / 3;
    if (buffer.length % 3 !== 0) {
      throw Error('FIXME: we should be able to handle truncated packets');
    }

    // update local state from diff-stream
    for (let i = 0; i < n; i++) {
      const channel = buffer.readUInt16BE(3 * i);
      const value  = buffer.readUInt8(3 * i + 2);
      const universe = (channel & 0xfe00) >> 9;
      const universeIndex = universe - 1;

      if (!this.dmxBuffers[universeIndex]) {
        this.addUniverse(universeIndex);
      }

      this.dmxBuffers[universeIndex][channel & 0x01ff] = value;
    }

    this.emit('dmxdata', this.dmxBuffers);

    if (this.output) {
      this.dmxBuffers.forEach((buffer,  index) => {
        buffer.copy(this.output.getBuffer(index + 1));
      });
    }

    callback();
  }
}
