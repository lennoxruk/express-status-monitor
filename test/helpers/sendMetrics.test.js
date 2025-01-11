'use strict';

const sendMetrics = require('../../src/helpers/sendMetrics');

describe('send-metrics', () => {
  describe('when invoked', () => {
    it('then io.emit called', () => {
      const io = { emit: jest.fn() };
      const span = { os: [], responses: [] };

      sendMetrics(io, span);

      expect(io.emit).toBeCalledWith('esm_stats', expect.any(Object));
    });
  });
});
