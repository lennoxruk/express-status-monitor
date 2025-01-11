'use strict';

const expressStatusMonitor = require('../src/middlewareWrapper');
const defaultConfig = require('../src/helpers/defaultConfig');

describe('middleware-wrapper', () => {
  describe('when initialised', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    const middleware = expressStatusMonitor();

    it('should be an instance of a Function', () => {
      expect(typeof middleware).toBe('function');
    });

    const req = { socket: {} };
    const res = { send: jest.fn() };
    const next = jest.fn();

    describe('when invoked', () => {
      beforeEach(() => {
        req.path = defaultConfig.path;
        res.send.mockReset();
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it(`and req.path === ${defaultConfig.path}, then res.send called`, (done) => {
        middleware(req, res, next);
        setTimeout(() => {
          expect(res.send).toBeCalled();
          done();
        });
      });

      it(`and req.path !== ${defaultConfig.path}, then res.send not called`, (done) => {
        req.path = '/another-path';
        middleware(req, res, next);
        setTimeout(() => {
          expect(res.send).not.toHaveBeenCalled();
          done();
        });
      });

      it('and res.removeHeader is present, then header is removed', (done) => {
        const middlewareWithConfig = expressStatusMonitor({
          iframe: true
        });
        const resWithHeaders = Object.assign({}, res);

        resWithHeaders.headers = {
          'X-Frame-Options': 1
        };

        resWithHeaders.removeHeader = jest.fn();

        middlewareWithConfig(req, resWithHeaders, next);
        setTimeout(() => {
          expect(resWithHeaders.removeHeader).toHaveBeenCalled();

          resWithHeaders.removeHeader = undefined;
          resWithHeaders.remove = jest.fn();
          middlewareWithConfig(req, resWithHeaders, next);
          setTimeout(() => {
            expect(resWithHeaders.remove).toHaveBeenCalled();
            done();
          });
        });
      });
    });

    describe('and used as separate middleware and page handler', () => {
      it('exposes a page handler', (done) => {
        expect(typeof middleware.pageRoute).toBe('function');
        middleware.pageRoute(req, res, next);
        setTimeout(() => {
          expect(res.send).toHaveBeenCalled();
          done();
        });
      });
    });
  });
});
