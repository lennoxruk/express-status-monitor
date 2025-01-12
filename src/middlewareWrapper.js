/* eslint-disable jsdoc/no-defaults */

'use strict';

/**
 * Express status monitor middleware wrapper
 *
 * Adapted version of package express-status-monitor
 * merged into application
 *
 * Alterations:
 *
 * Replaced axios with node-fetch for commonjs compatibility with packaging tools like pkg\
 * Changed health checker to use node-fetch-native instead of axios\
 * Fixed issue with health checker for non-200 status code responses\
 * Removed branding from UI
 *
 * @module expressStatusMonitor
 */

const fs = require('fs');
const path = require('path');
const onHeaders = require('on-headers');
const Handlebars = require('handlebars');
const validate = require('./helpers/validate');
const onHeadersListener = require('./helpers/onHeadersListener');
const socketIoInit = require('./helpers/socketIOInit');
const healthChecker = require('./helpers/healthChecker');

/**
 * Create a middleware function that creates a /status page with charts and
 * starts logging data to the charts.
 *
 * @param {object} config - The configuration object
 * @param {string} [config.title='Express Status'] - The text to display as the title of the page
 * @param {string} [config.path='/status'] - The path to serve the status page at
 * @param {string} [config.theme='default.css'] - The theme to use
 * @param {number} [config.port] - The port to create a websocket connection to
 * @param {object} [config.websocket] - The websocket server to use
 * @param {boolean} [config.iframe=false] - Whether to remove X-Frame-Options from the response headers
 * @param {object} [config.chartVisibility] - Key-value pairs of the types of charts to display and their visibility
 * @param {Array} [config.spans] - An array of objects with two properties,
 * interval and retention, which are the interval between data points and the
 * number of data points to retain
 * @param {Array} [config.healthChecks] - An array of health checks to run every time the page is loaded
 *
 * @returns {Function} A middleware function that will serve the status page when the path matches the config.path property
 */
const middlewareWrapper = (config) => {
  const validatedConfig = validate(config);
  const bodyClasses = Object.keys(validatedConfig.chartVisibility)
    .reduce((accumulator, key) => {
      if (validatedConfig.chartVisibility[key] === false) {
        accumulator.push(`hide-${key}`);
      }
      return accumulator;
    }, [])
    .join(' ');

  const data = {
    title: validatedConfig.title,
    port: validatedConfig.port,
    socketPath: validatedConfig.socketPath,
    bodyClasses,
    script: fs.readFileSync(path.join(__dirname, '/public/javascripts/app.js')),
    style: fs.readFileSync(
      path.join(__dirname, '/public/stylesheets/', validatedConfig.theme)
    )
  };

  const htmlTemplate = fs
    .readFileSync(path.join(__dirname, '/public/index.html'))
    .toString();

  const render = Handlebars.compile(htmlTemplate);

  /**
   * The main middleware function
   *
   * When a request is made to the path specified in the config, render the\
   * status page. If the path is not the status page, attach a listener to the\
   * 'headers' event to log the request once the headers have been written.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  const middleware = (req, res, next) => {
    socketIoInit(req.socket.server, validatedConfig);

    const startTime = process.hrtime();

    if (req.path === validatedConfig.path) {
      healthChecker(validatedConfig.healthChecks).then((results) => {
        data.healthCheckResults = results;
        if (validatedConfig.iframe) {
          if (res.removeHeader) {
            res.removeHeader('X-Frame-Options');
          }

          if (res.remove) {
            res.remove('X-Frame-Options');
          }
        }

        res.send(render(data));
      });
    } else {
      if (!req.path.startsWith(validatedConfig.ignoreStartsWith)) {
        onHeaders(res, () => {
          onHeadersListener(res.statusCode, startTime, validatedConfig.spans);
        });
      }

      next();
    }
  };

  /* Provide two properties, the middleware and HTML page renderer separately
   * so that the HTML page can be authenticated while the middleware can be
   * earlier in the request handling chain.  Use like:
   * ```
   * const statusMonitor = require('expressStatusMonitor')(config);
   * server.use(statusMonitor);
   * server.get('/status', isAuthenticated, statusMonitor.pageRoute);
   * ```
   */
  middleware.middleware = middleware;

  /**
   * Handle a request to the configured path (or the path property of the
   * options object if given).  The response is an HTML page which renders the
   * data collected by the middleware since the last time the page was loaded.
   *
   * @function pageRoute
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  middleware.pageRoute = (req, res) => {
    healthChecker(validatedConfig.healthChecks).then((results) => {
      data.healthCheckResults = results;
      res.send(render(data));
    });
  };
  return middleware;
};

module.exports = middlewareWrapper;
