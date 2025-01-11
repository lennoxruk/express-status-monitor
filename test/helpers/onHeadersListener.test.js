'use strict';

const onHeadersListener = require('../../src/helpers/onHeadersListener');
const defaultConfig = require('../../src/helpers/defaultConfig');

describe('onHeadersListener', () => {
  describe('when invoked', () => {
    it('then for all spans, responses length should equal 1', () => {
      const spans = defaultConfig.spans.map((span) => ({
        ...span,
        responses: []
      }));

      onHeadersListener(404, process.hrtime(), spans);

      expect(spans.every((span) => span.responses.length === 1)).toBe(true);
    });

    describe('when invoked after 1 second', () => {
      it('then for span interval 1, responses length should equal 2', () => {
        const spans = defaultConfig.spans.map((span) => ({
          ...span,
          responses: []
        }));

        jest.useFakeTimers().setSystemTime(new Date().getTime() + 1000);
        onHeadersListener(500, process.hrtime(), spans);

        jest.useFakeTimers().setSystemTime(new Date().getTime() + 2000); // Add this line
        onHeadersListener(500, process.hrtime(), spans);

        expect(
          spans.every((span) =>
            span.interval === 1
              ? span.responses.length === 2
              : span.responses.length === 1
          )
        ).toBe(true);
        jest.useRealTimers();
      });
    });
  });
});
