'use strict';

const defaultConfig = require('../../src/helpers/defaultConfig');
const validate = require('../../src/helpers/validate');

describe('validate', () => {
  describe('when config is null or undefined', () => {
    const config = validate();

    it(`then title === ${defaultConfig.title}`, () => {
      expect(config.title).toBe(defaultConfig.title);
    });

    it(`then path === ${defaultConfig.path}`, () => {
      expect(config.path).toBe(defaultConfig.path);
    });

    it(`then spans === ${JSON.stringify(defaultConfig.spans)}`, () => {
      expect(config.spans).toEqual(defaultConfig.spans);
    });

    it('then port === null', () => {
      expect(config.port).toBeNull();
    });

    it('then websocket === null', () => {
      expect(config.websocket).toBeNull();
    });
  });

  describe('when config is invalid', () => {
    const config = validate({
      title: true,
      path: false,
      spans: 'not-an-array',
      port: 'abc',
      websocket: false
    });

    it(`then title === ${defaultConfig.title}`, () => {
      expect(config.title).toBe(defaultConfig.title);
    });

    it(`then path === ${defaultConfig.path}`, () => {
      expect(config.path).toBe(defaultConfig.path);
    });

    it(`then spans === ${JSON.stringify(defaultConfig.spans)}`, () => {
      expect(config.spans).toEqual(defaultConfig.spans);
    });

    it('then port === null', () => {
      expect(config.port).toBeNull();
    });

    it('then websocket === null', () => {
      expect(config.websocket).toBeNull();
    });
  });

  describe('when config is valid', () => {
    const customConfig = {
      title: 'Custom title',
      path: '/custom-path',
      spans: [{}, {}, {}],
      port: 9999,
      websocket: {}
    };
    const config = validate(customConfig);

    it(`then title === ${customConfig.title}`, () => {
      expect(config.title).toBe(customConfig.title);
    });

    it(`then path === ${customConfig.path}`, () => {
      expect(config.path).toBe(customConfig.path);
    });

    it(`then spans === ${JSON.stringify(customConfig.spans)}`, () => {
      expect(config.spans).toEqual(customConfig.spans);
    });

    it('then websocket === {}', () => {
      expect(config.websocket).toEqual({});
    });

    it(`then port === ${customConfig.port}`, () => {
      expect(config.port).toBe(customConfig.port);
    });
  });
});
