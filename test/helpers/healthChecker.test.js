'use strict';

const healthCheckerPath =
  '../../src/helpers/healthChecker';

describe('healthChecker', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a successful health check result for a 200 status code', async () => {
    jest.doMock('node-fetch-native', () => {
      return jest.fn().mockResolvedValue({
        ok: true,
        status: 200
      });
    });

    const healthChecker = require(healthCheckerPath);

    const healthChecks = [
      { protocol: 'http', host: 'localhost', port: 3000, path: '/health' }
    ];

    const results = await healthChecker(healthChecks);

    expect(results).toBeInstanceOf(Array);
    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty('path');
    expect(results[0]).toHaveProperty('status');
    expect(results[0].status).toBe('ok');
  });

  it('should return a failed health check result for a non-200 status code', async () => {
    jest.doMock('node-fetch-native', () => {
      return jest.fn().mockResolvedValue({
        ok: false,
        status: 404
      });
    });

    const healthChecker = require(healthCheckerPath);

    const healthChecks = [
      { protocol: 'http', host: 'localhost', port: 3000, path: '/health' }
    ];

    const results = await healthChecker(healthChecks);

    expect(results[0].status).toBe('failed');
  });

  it('should handle multiple health checks', async () => {
    /**
     * A mock fetch function that returns an object with an ok property and a status
     * property. The ok property is true if the status is 200, and the status property
     * is the HTTP status code. This function is used to test the healthChecker when
     * it is given multiple health checks.
     *
     * @param {string} url - The URL to fetch
     * @returns {object} An object with ok and status properties
     */
    const mockFetch = (url) => {
      if (url === 'http://localhost:3000/health1') {
        return { ok: true, status: 200 };
      } else if (url === 'http://localhost:3000/health2') {
        return { ok: true, status: 200 };
      } else {
        return { ok: false, status: 404 };
      }
    };

    jest.doMock('node-fetch-native', () => {
      return jest.fn().mockImplementation(mockFetch);
    });

    const healthChecker = require(healthCheckerPath);

    const healthChecks = [
      { protocol: 'http', host: 'localhost', port: 3000, path: '/health1' },
      { protocol: 'http', host: 'localhost', port: 3000, path: '/health2' },
      { protocol: 'http', host: 'localhost', port: 3000, path: '/bad' }
    ];

    const results = await healthChecker(healthChecks);

    expect(results).toHaveLength(3);
    expect(results[0].status).toBe('ok');
    expect(results[1].status).toBe('ok');
    expect(results[2].status).toBe('failed');
  });

  it('should return a failed health check result for a rejected promise', async () => {
    jest.doMock('node-fetch-native', () => {
      return jest.fn().mockRejectedValue(new Error('Mock error'));
    });

    const healthChecker = require(healthCheckerPath);

    const healthChecks = [
      { protocol: 'http', host: 'localhost', port: 3000, path: '/health' }
    ];

    const results = await healthChecker(healthChecks);

    expect(results[0].status).toBe('failed');
  });
});
