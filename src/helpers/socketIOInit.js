'use strict';

/**
 * Initializes socket.io with the provided Express server and configuration
 *
 * @module socketIOInit
 */

const socketIo = require('socket.io');
const gatherOsMetrics = require('./gatherOSMetrics');

let io;

/**
 * Adds socket event listeners for emitting and handling 'esm_start' and 'esm_change' events
 *
 * @param {object} socket - The socket instance to add events to
 * @param {object} config - Configuration object containing spans for the 'esm_start' event
 */
const addSocketEvents = (socket, config) => {
  socket.emit('esm_start', config.spans);
  socket.on('esm_change', () => {
    socket.emit('esm_start', config.spans);
  });
};

/**
 * Initializes socket.io with the provided Express server and configuration
 *
 * @param {object} server - The Express server to attach to
 * @param {object} config - The configuration object containing spans, authorization function, and websocket server
 *
 * @returns {undefined}
 */
module.exports = (server, config) => {
  gatherOsMetrics.setup(config?.chartVisibility?.eventLoop ?? false);

  if (io === null || io === undefined) {
    if (config.websocket !== null) {
      io = config.websocket;
    } else {
      io = socketIo(server);
    }

    io.on('connection', (socket) => {
      if (config.authorize) {
        config
          .authorize(socket)
          .then((authorized) => {
            if (!authorized) socket.disconnect('unauthorized');
            else addSocketEvents(socket, config);
          })
          .catch(() => socket.disconnect('unauthorized'));
      } else {
        addSocketEvents(socket, config);
      }
    });

    config.spans.forEach((span) => {
      span.os = [];
      span.responses = [];
      const interval = setInterval(
        () => gatherOsMetrics.gather(io, span),
        span.interval * 1000
      );

      // Don't keep Node.js process up
      interval.unref();
    });
  }
};
