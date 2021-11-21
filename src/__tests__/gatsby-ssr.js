describe('gatsby-ssr test suite', () => {
  let gatsbySsr;
  let setHeadComponents;
  let setPostBodyComponents;
  beforeEach(() => {
    jest.resetModules();
    gatsbySsr = require('../gatsby-ssr');
    setHeadComponents = jest.fn();
    setPostBodyComponents = jest.fn();
  });
  test('onRenderBody, with NODE_ENV=dev and no trackingId, should return null', () => {
    // Given
    process.env.NODE_ENV = 'dev';
    // When
    const result = gatsbySsr.onRenderBody({setHeadComponents, setPostBodyComponents}, {});
    // Then
    expect(result).toBeNull();
  });
  test('onRenderBody, with NODE_ENV=production and no trackingId, should return null', () => {
    // Given
    process.env.NODE_ENV = 'production';
    // When
    const result = gatsbySsr.onRenderBody({setHeadComponents, setPostBodyComponents}, {});
    // Then
    expect(result).toBeNull();
  });
});

