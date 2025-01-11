const chai = require('chai');
const sinon = require('sinon');

chai.should();

const sendMetrics = require('../../src/helpers/sendMetrics');

describe('sendMetrics', () => {
  describe('when invoked', () => {
    it('then io.emit called', () => {
      const io = { emit: sinon.stub() };
      const span = { os: [], responses: [] };

      sendMetrics(io, span);

      sinon.assert.calledWith(io.emit, 'esm_stats');
    });
  });
});
