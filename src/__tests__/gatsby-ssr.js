import React from 'react';

describe('gatsby-ssr test suite', () => {
  let gatsbySsr;
  let setHeadComponents;
  let setPostBodyComponents;
  beforeEach(() => {
    gatsbySsr = require('../gatsby-ssr');
    setHeadComponents = jest.fn();
    setPostBodyComponents = jest.fn(() => true);
  });
  describe('onRenderBody', () => {
    test('with NODE_ENV=dev and no trackingId, should return null', () => {
      // Given
      process.env.NODE_ENV = 'dev';
      // When
      const result = gatsbySsr.onRenderBody({setHeadComponents, setPostBodyComponents}, {});
      // Then
      expect(result).toBeNull();
    });
    test('with NODE_ENV=production and no trackingId, should return null', () => {
      // Given
      process.env.NODE_ENV = 'production';
      // When
      const result = gatsbySsr.onRenderBody({setHeadComponents, setPostBodyComponents}, {});
      // Then
      expect(result).toBeNull();
    });
    test('with NODE_ENV=production and trackingId, should setHeadersComponents', () => {
      // Given
      process.env.NODE_ENV = 'production';
      // When
      const result = gatsbySsr.onRenderBody({setHeadComponents, setPostBodyComponents}, {trackingId: 'UA-1337'});
      // Then
      expect(result).not.toBeNull();
      expect(setHeadComponents).toHaveBeenCalledTimes(1);
      expect(setHeadComponents).toHaveBeenCalledWith(expect.arrayContaining([
        <link rel='preconnect' key='preconnect-google-gtag' href='https://www.googletagmanager.com' />,
        <link rel='dns-prefetch' key='dns-prefetch-google-gtag' href='https://www.googletagmanager.com' />
      ]));
    });
    test('with NODE_ENV=production and trackingId, should setPostBodyComponents with valid trackingId', () => {
      // Given
      process.env.NODE_ENV = 'production';
      // When
      const result = gatsbySsr.onRenderBody({setHeadComponents, setPostBodyComponents}, {trackingId: 'UA-1337'});
      // Then
      expect(result).not.toBeNull();
      expect(setPostBodyComponents).toHaveBeenCalledTimes(1);
      expect(setPostBodyComponents.mock.calls[0][0][0].props.src)
        .toBe('https://www.googletagmanager.com/gtag/js?id=UA-1337');
      expect(setPostBodyComponents.mock.calls[0][0][1].props.dangerouslySetInnerHTML.__html)
        .toContain('gtag(\'config\', \'UA-1337\', {');
    });
    test('with NODE_ENV=production and trackingId, should setPostBodyComponents with gtag init calls', () => {
      // Given
      process.env.NODE_ENV = 'production';
      // When
      gatsbySsr.onRenderBody({setHeadComponents, setPostBodyComponents}, {trackingId: 'UA-1337'});
      // Then
      expect(setPostBodyComponents.mock.calls[0][0][1].props.dangerouslySetInnerHTML.__html)
        // eslint-disable-next-line max-len
        .toMatch(/[\s\S]*gtag\('js', new Date\(\)\);[\s\S]*gtag\('consent', 'default', {[\s\S]*gtag\('config', 'UA-1337', {[\s\S]*/);
    });
  });
});
