# @lennoxruk/express-status-monitor

![NPM Version](https://img.shields.io/npm/v/%40lennoxruk%2Fexpress-status-monitor)
![NPM Downloads](https://img.shields.io/npm/dw/%40lennoxruk%2Fexpress-status-monitor)

Simple, self-hosted module based on Socket.io and Chart.js to report realtime server metrics for Express-based node servers.

## Independent fork notice

This is an independent fork of [express-status-monitor](https://github.com/RafalWilinski/express-status-monitor) with a number of updates. It is detached from the original project as the updates have divulged somewhat from the original. The original structure of the project is still maintained but all source files have been refactored.

Notable changes:

* All security vulnerabilities in package dependencies have been fixed
* Replaced axios with node-fetch-native for commonjs compatibility with packaging tools
* Changed health checker to use node-fetch-native instead of axios
* Fixed issue with health checker for non-200 status code responses
* Fixed event loop showing when set to false in config
* Removed branding from UI
* Changed all unit tests to jest

## Support for other Node.js frameworks

* [koa-monitor](https://github.com/capaj/koa-monitor) for Koa
* [hapijs-status-monitor](https://github.com/ziyasal/hapijs-status-monitor) for hapi.js

## Installation & setup

1. Run `npm install @lennoxruk/express-status-monitor --save`
2. Before any other middleware or router add following line:
`app.use(require('@lennoxruk/express-status-monitor')());`
3. Run server and go to `/status`

Note: This plugin works on Node versions > 4.x

## Run examples

1. Run `npm run example`
1. Go to UI at `http://0.0.0.0:3000`

To run status code tester, whilst example is running,

1. Go to examples folder `cd examples`
2. Run `node tester.js`
3. View UI for status code updates at random intervals

## Options

Monitor can be configured by passing options object into `expressMonitor` constructor.

Default config:

```javascript
title: 'Express Status',  // Default title
theme: 'default.css',     // Default styles
path: '/status',
socketPath: '/socket.io', // In case you use a custom path
websocket: existingSocketIoInstance,
spans: [{
  interval: 1,            // Every second
  retention: 60           // Keep 60 datapoints in memory
}, {
  interval: 5,            // Every 5 seconds
  retention: 60
}, {
  interval: 15,           // Every 15 seconds
  retention: 60
}],
chartVisibility: {
  cpu: true,
  mem: true,
  load: true,
  eventLoop: true,
  heap: true,
  responseTime: true,
  rps: true,
  statusCodes: true
},
healthChecks: [],
ignoreStartsWith: '/admin'
```

## Health Checks

You can add a series of health checks to the configuration that will appear below the other stats. The health check will be considered successful if the endpoint returns a 200 status code.

```javascript
// config
healthChecks: [{
  protocol: 'http',
  host: 'localhost',
  path: '/admin/health/ex1',
  port: '3000'
}, {
  protocol: 'http',
  host: 'localhost',
  path: '/admin/health/ex2',
  port: '3000'
}]
```

![Health Checks](https://i.imgur.com/6tY4OhA.png "Health Checks")

## Securing endpoint

The HTML page handler is exposed as a `pageRoute` property on the main
middleware function.  So the middleware is mounted to intercept all requests
while the HTML page handler will be authenticated.

Example using <https://www.npmjs.com/package/connect-ensure-login>

```javascript
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()

const statusMonitor = require('express-status-monitor')();
app.use(statusMonitor);
app.get('/status', ensureLoggedIn, statusMonitor.pageRoute)
```

Credits to [@mattiaerre](https://github.com/mattiaerre)

Example using [http-auth](https://www.npmjs.com/package/http-auth)

```javascript
const auth = require('http-auth');
const basic = auth.basic({realm: 'Monitor Area'}, function(user, pass, callback) {
  callback(user === 'username' && pass === 'password');
});

// Set '' to config path to avoid middleware serving the html page (path must be a string not equal to the wanted route)
const statusMonitor = require('express-status-monitor')({ path: '' });
app.use(statusMonitor.middleware); // use the "middleware only" property to manage websockets
app.get('/status', basic.check(statusMonitor.pageRoute)); // use the pageRoute property to serve the dashboard html page
```

## Using module with socket.io in project

If you're using socket.io in your project, this module could break your project because this module by default will spawn its own socket.io instance. To mitigate that, fill websocket parameter with your main socket.io instance as well as port parameter.

## Tests and coverage

In order to run test and coverage use the following npm commands:

```bash
npm test
npm run coverage
```

## License

[MIT License](https://opensource.org/licenses/MIT)
