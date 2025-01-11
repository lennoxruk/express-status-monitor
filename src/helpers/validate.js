'use strict';

/**
 * Status monitor configuration validation and merging
 *
 * @module expressStatusMonitor/validate
 */

const defaultConfig = require('./defaultConfig');

/**
 * Validates and merges the provided configuration object with default settings.
 *
 * This function ensures that each configuration property is set to an appropriate
 * value, falling back on default settings when necessary. It also handles
 * visibility settings for charts, updating the default chart visibility based on
 * the provided configuration.
 *
 * @param {object} config - The configuration object to validate and merge
 * @param {string} [config.title] - The page title
 * @param {string} [config.theme] - The theme stylesheet to use
 * @param {string} [config.path] - The path for the status page
 * @param {string} [config.socketPath] - The path for the socket connection
 * @param {Array} [config.spans] - Array of span objects defining data intervals and retention
 * @param {number} [config.port] - The port for the application
 * @param {object} [config.websocket] - The websocket server object
 * @param {boolean} [config.iframe] - Whether to allow iframe embedding
 * @param {object} [config.chartVisibility] - Visibility settings for various charts
 * @param {string} [config.ignoreStartsWith] - Path prefix to ignore
 * @param {Array} [config.healthChecks] - List of health check functions or URLs
 *
 * @returns {object} The validated and merged configuration object
 */
module.exports = (config) => {
  if (!config) {
    return defaultConfig;
  }

  /**
   * Merge the provided chart visibility settings with the default visibility settings.
   * Any properties in the provided object that are set to `false` will be used to update
   * the corresponding property in the default chart visibility object.
   *
   * @param {object} configChartVisibility - The chart visibility settings to merge
   * @returns {object} The updated chart visibility object
   */
  const mungeChartVisibility = (configChartVisibility) => {
    Object.keys(defaultConfig.chartVisibility).forEach((key) => {
      if (configChartVisibility[key] === false) {
        defaultConfig.chartVisibility[key] = false;
      }
    });
    return defaultConfig.chartVisibility;
  };

  config.title =
    typeof config.title === 'string' ? config.title : defaultConfig.title;
  config.theme =
    typeof config.theme === 'string' ? config.theme : defaultConfig.theme;
  config.path =
    typeof config.path === 'string' ? config.path : defaultConfig.path;
  config.socketPath =
    typeof config.socketPath === 'string'
      ? config.socketPath
      : defaultConfig.socketPath;
  config.spans =
    typeof config.spans === 'object' ? config.spans : defaultConfig.spans;
  config.port =
    typeof config.port === 'number' ? config.port : defaultConfig.port;
  config.websocket =
    typeof config.websocket === 'object'
      ? config.websocket
      : defaultConfig.websocket;
  config.iframe =
    typeof config.iframe === 'boolean' ? config.iframe : defaultConfig.iframe;
  config.chartVisibility =
    typeof config.chartVisibility === 'object'
      ? mungeChartVisibility(config.chartVisibility)
      : defaultConfig.chartVisibility;
  config.ignoreStartsWith =
    typeof config.path === 'string'
      ? config.ignoreStartsWith
      : defaultConfig.ignoreStartsWith;

  config.healthChecks = Array.isArray(config.healthChecks)
    ? config.healthChecks
    : defaultConfig.healthChecks;

  return config;
};
