'use strict';

/**
 * Sends the OS metrics and response data to the connected clients using socket.io
 *
 * @module expressStatusMonitor/sendMetrics
 */

/**
 * Emits the 'esm_stats' event with the second-to-last OS metrics and response data
 *
 * @param {object} io - The socket.io instance used for emitting events
 * @param {object} span - The span object containing OS metrics and response data
 */
module.exports = (io, span) => {
  io.emit('esm_stats', {
    os: span.os[span.os.length - 2],
    responses: span.responses[span.responses.length - 2],
    interval: span.interval,
    retention: span.retention
  });
};
