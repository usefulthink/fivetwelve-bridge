import {initFivetwelveClient} from './index';
import * as fivetwelve from 'fivetwelve'

// find the script-tag that was used to load this file
const scriptTag = document.querySelector('script[src *= "fivetwelve-client.js"]');
const websocketUrl = scriptTag.src.replace(/http:\/\/([^\/]*)/, 'ws://$1');

window.fivetwelve = fivetwelve;
window.fivetwelve.driver = initFivetwelveClient(websocketUrl);