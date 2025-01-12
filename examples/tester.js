const fetch = require('node-fetch-native');

const port = 3000;
const interval = 50;
const requestUrl = `http://0.0.0.0:${port}/return-status/`;

/**
 * Makes a random request to the server at a random interval
 *
 * @returns {undefined}
 */
const makeDummyCall = () =>
  setTimeout(async () => {
    const code = 200 + Math.random() * 399;

    await fetch(`${requestUrl}${code}`).catch(() => {});

    makeDummyCall();
  }, interval);

makeDummyCall();
