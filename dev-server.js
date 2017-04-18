require('babel-register')({
  presets: ['node6'],
  ignore: /node_modules\/(?!fivetwelve)/
});

const {initFivetwelveBridge} = require('./index');
const {DmxOutput} = require('fivetwelve');

const blessed = require('blessed');
const colormap = require('colormap');

const CliDebugDriver = require('fivetwelve-cli-debug-driver').default;
const output = new DmxOutput(new CliDebugDriver());
output.start(1000/30);

const bridge = initFivetwelveBridge(output);
bridge.listen(1234);
