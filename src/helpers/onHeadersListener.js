'use strict';

/**
 * Listens for the 'headers' event on an Express request and records the response time
 * and status code category for the request into the provided spans
 *
 * @module onHeadersListener
 */

/**
 * Records the response time and status code category for a given request into the provided spans
 *
 * @param {number} statusCode - The HTTP status code of the request
 * @param {Array} startTime - The high-resolution real time at which the request started, as returned by process.hrtime()
 * @param {Array} spans - An array of span objects where the metrics will be recorded. Each span contains an array of responses, and each response records the count and mean response time for different status code categories
 */
module.exports = (statusCode, startTime, spans) => {
  const diff = process.hrtime(startTime);
  const responseTime = (diff[0] * 1e3 + diff[1]) * 1e-6;
  const category = Math.floor(statusCode / 100);

  spans.forEach((span) => {
    const last = span.responses[span.responses.length - 1];

    if (
      last !== undefined &&
      last.timestamp / 1000 + span.interval > Date.now() / 1000
    ) {
      last[category] += 1;
      last.count += 1;
      last.mean += (responseTime - last.mean) / last.count;
    } else {
      span.responses.push({
        2: category === 2 ? 1 : 0,
        3: category === 3 ? 1 : 0,
        4: category === 4 ? 1 : 0,
        5: category === 5 ? 1 : 0,
        count: 1,
        mean: responseTime,
        timestamp: Date.now()
      });
    }
  });
};
