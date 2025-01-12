'use strict';

/**
 * Gathers OS metrics and sends them to the connected clients using socket.io
 *
 * @module gatherOSMetrics
 */

const pidusage = require('pidusage');
const os = require('os');
const v8 = require('v8');
const sendMetrics = require('./sendMetrics');

let eventLoopStats;

/**
 * Sets up the event loop stats module. If the module is not available or
 * requireEventLoopStats is false, it sets the eventLoopStats variable to null.
 *
 * @param {boolean} requireEventLoopStats - Whether the event loops stats is required
 */
module.exports.setup = (requireEventLoopStats) => {
  if (eventLoopStats || eventLoopStats === null) return;

  if (requireEventLoopStats) {
    try {
      eventLoopStats = require('event-loop-stats');
      return;
    } catch {
      console.warn(
        'event-loop-stats not found, ignoring event loop metrics...'
      );
    }
  }

  eventLoopStats = null;
};

/**
 * Gathers OS metrics and sends them to the connected clients using socket.io
 *
 * @param {object} io - Socket.io instance
 * @param {object} span - Span object
 */
module.exports.gather = (io, span) => {
  const defaultResponse = {
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    count: 0,
    mean: 0,
    timestamp: Date.now()
  };

  pidusage(process.pid, (err, stat) => {
    if (err) {
      console.error(err);
      return;
    }

    const last = span.responses[span.responses.length - 1];

    // Convert from B to MB
    stat.memory = stat.memory / 1024 / 1024;
    stat.load = os.loadavg();
    stat.timestamp = Date.now();
    stat.heap = v8.getHeapStatistics();

    if (eventLoopStats) {
      stat.loop = eventLoopStats.sense();
    }

    span.os.push(stat);
    if (
      !span.responses[0] ||
      (last.timestamp + span.interval) * 1000 < Date.now()
    ) {
      span.responses.push(defaultResponse);
    }

    if (span.os.length >= span.retention) span.os.shift();
    if (span.responses[0] && span.responses.length > span.retention)
      span.responses.shift();

    sendMetrics(io, span);
  });
};
