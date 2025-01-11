'use strict';

const gatherOSMetrics = require('../../src/helpers/gatherOSMetrics');
const pidusage = require('pidusage');
const v8 = require('v8');
const sendMetrics = require('../../src/helpers/sendMetrics');

jest.mock('pidusage');
jest.mock(
  '../../src/helpers/sendMetrics'
);

describe('gatherOsMetrics', () => {
  it('should call pidusage with the correct pid', () => {
    const io = {};
    const span = {};

    gatherOSMetrics(io, span);

    expect(pidusage).toHaveBeenCalledTimes(1);
    expect(pidusage).toHaveBeenCalledWith(process.pid, expect.any(Function));
  });

  it('should handle pidusage error', () => {
    const io = {};
    const span = {};
    const error = new Error('Mock error');

    pidusage.mockImplementation((pid, callback) => {
      callback(error);
    });

    gatherOSMetrics(io, span);

    expect(sendMetrics).not.toHaveBeenCalled();
  });

  it('should send metrics with the correct data', () => {
    const io = {};
    const span = {
      os: [],
      responses: [],
      interval: 1,
      retention: 60
    };
    const stat = {
      memory: 100,
      load: [1, 2, 3],
      timestamp: Date.now(),
      heap: v8.getHeapStatistics()
    };

    pidusage.mockImplementation((pid, callback) => {
      callback(null, stat);
    });

    gatherOSMetrics(io, span);

    expect(sendMetrics).toHaveBeenCalledTimes(1);
    expect(sendMetrics).toHaveBeenCalledWith(io, span);
    expect(span.os).toEqual([stat]);
    expect(span.responses).toEqual([
      expect.objectContaining({
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        count: 0,
        mean: 0,
        timestamp: expect.any(Number) // allow any number
      })
    ]);
  });

  it('should handle eventLoopStats sense error', () => {
    const io = {};
    const span = {
      os: [],
      responses: [],
      interval: 1,
      retention: 60
    };
    const stat = {
      memory: 100,
      load: [1, 2, 3],
      timestamp: Date.now(),
      heap: v8.getHeapStatistics()
    };

    pidusage.mockImplementation((pid, callback) => {
      callback(null, stat);
    });

    try {
      require('event-loop-stats');
    } catch {
      // ignore
    }

    gatherOSMetrics(io, span);

    expect(sendMetrics).toHaveBeenCalled();
    expect(sendMetrics).toHaveBeenCalledWith(io, span);
    expect(span.os).toEqual([stat]);
    expect(span.responses).toEqual([
      expect.objectContaining({
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        count: 0,
        mean: 0,
        timestamp: expect.any(Number) // allow any number
      })
    ]);
  });
});
