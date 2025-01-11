'use strict';

const socketIoInit = require('../../src/helpers/socketIOInit');
const defaultConfig = require('../../src/helpers/defaultConfig');

describe('socket-io-init', () => {
  describe('when invoked', () => {
    it('then all spans should have os and responses property', () => {
      const spans = defaultConfig.spans;

      expect(spans.every((span) => !span.os && !span.responses)).toBe(true);

      socketIoInit({}, defaultConfig);

      expect(spans.every((span) => span.os && span.responses)).toBe(true);
    });
  });
});
