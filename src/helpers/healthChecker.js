'use strict';

/**
 * Status monitor health checker
 *
 * @module healthChecker
 */

const fetch = require('node-fetch-native');

/**
 * Takes an array of promises and returns a promise that resolves after all
 * of the input promises have settled, either fulfilled or rejected
 *
 * @param {Array<Promise>} promises - An array of promises to wait for.
 * @returns {Promise<Array<{ state: string, value: any, reason: any }>>}
 *
 * A promise that resolves to an array of objects, each representing the
 * outcome of each promise in the input array. Each object has a `state`
 * property with a value of either 'fulfilled' or 'rejected', and either
 * a `value` or `reason` property depending on the outcome.
 */
async function allSettled(promises) {
  const wrappedPromises = promises.map((p) =>
    Promise.resolve(p).then(
      (val) => ({ state: 'fulfilled', value: val }),
      (err) => ({ state: 'rejected', reason: err })
    )
  );

  return await Promise.all(wrappedPromises);
}
/**
 * Executes a series of health checks by making HTTP requests to specified URIs
 *
 * @param {Array<{ protocol: string, host: string, port: number, path: string }>} healthChecks
 * - An array of objects specifying the protocol, host, optional port, and path for each health check
 *
 * @returns {Promise<Array<{ path: string, status: string }>>}
 * A promise that resolves to an array of objects, each containing the `path` and `status` of the health check.
 * The `status` will be 'ok' if the request is successful, or 'failed' if the request is rejected.
 */
module.exports = async (healthChecks) => {
  const checkPromises = [];

  for (const healthCheck of healthChecks) {
    let uri = `${healthCheck.protocol}://${healthCheck.host}`;

    if (healthCheck.port) {
      uri += `:${healthCheck.port}`;
    }

    uri += healthCheck.path;

    try {
      const response = await fetch(uri);

      if (response.ok) {
        checkPromises.push(response);
      } else {
        checkPromises.push({
          state: 'rejected',
          reason: new Error(`HTTP error! status: ${response.status}`)
        });
      }
    } catch (err) {
      checkPromises.push({ state: 'rejected', reason: err });
    }
  }

  const results = await allSettled(checkPromises);
  const checkResults = [];

  for (const result of results) {
    if (result.state === 'rejected') {
      checkResults.push({
        path: healthChecks[results.indexOf(result)].path,
        status: 'failed'
      });
    } else {
      const response = result.value;

      if (response.ok) {
        checkResults.push({
          path: healthChecks[results.indexOf(result)].path,
          status: 'ok'
        });
      } else {
        checkResults.push({
          path: healthChecks[results.indexOf(result)].path,
          status: 'failed'
        });
      }
    }
  }

  return checkResults;
};
