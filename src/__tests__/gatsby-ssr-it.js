import React from 'react';
import {JSDOM} from 'jsdom';
import {createRoot} from 'react-dom/client';
import {act} from 'react-dom/test-utils';

const mockDOM = () => {
  // We could use jest-jsdom --->
  //  /* @jest-environment jsdom \n @jest-environment-options {"runScripts": "dangerously", "resources": "usable"} */
  // However, with explicit JSDOM usage we can even insert a `debugger` statement in the real script to analyze problems
  // such as the one with the missing URL.createObjectURL() function.
  const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body /></html>', {
    resources: 'usable',
    runScripts: 'dangerously'
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.window.URL.createObjectURL = jest.fn(() => 'the-url');
  const $root = document.createElement('div');
  $root.innerHTML = '<div id="root"></div>';
  global.document.body.append($root);
  return $root;
};

describe('gatsby-ssr integration test suite', () => {
  let gatsbySsr;
  let headComponents;
  let setHeadComponents;
  let postBodyComponents;
  let setPostBodyComponents;
  let $root;
  let render;
  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    $root = mockDOM();
    gatsbySsr = require('../gatsby-ssr');
    headComponents = [];
    postBodyComponents = [];
    setHeadComponents = components => headComponents.push(...components);
    setPostBodyComponents = components => postBodyComponents.push(...components);
    render = async ({trackingId, getEnv}) => {
      gatsbySsr.onRenderBody({setHeadComponents, setPostBodyComponents}, {trackingId, getEnv});
      return act(() => {
        const root = createRoot($root);
        root.render(<>
          <div key='head' id='head'>{headComponents}</div>
          <div key='body' id='body'>{postBodyComponents}</div>
        </>);
      });
    };
  });
  afterEach(() => {
    $root.remove();
  });
  describe('Production', () => {
    let getEnv;
    beforeEach(() => {
      getEnv = () => 'production';
    });
    describe('without trackingId', () => {
      beforeEach(async () => {
        await render({getEnv});
      });
      test('should not add head components', () => {
        expect(window.document.getElementById('head').innerHTML).toBe('');
      });
      test('should not add body components', () => {
        expect(window.document.getElementById('body').innerHTML).toBe('');
      });
    });
    describe('with trackingId', () => {
      beforeEach(async () => {
        await render({trackingId: 'THE-ID', getEnv});
      });
      test('should add head components', () => {
        expect(Array.from(window.document.querySelectorAll('#head link[rel="preconnect"]')))
          .toHaveLength(1);
        expect(Array.from(window.document.querySelectorAll('#head link[rel="dns-prefetch"]')))
          .toHaveLength(1);
      });
      test('should add google tag manager remote script to body', () => {
        expect(window.document.querySelector('#body script[src]').getAttribute('src'))
          .toBe('https://www.googletagmanager.com/gtag/js?id=THE-ID');
      });
      test('should add local script', () => {
        expect(document.querySelector('#body script:not([src])').innerHTML)
          .toContain('const GA_CLIENT_ID_KEY = \'ga:clientId\';');
      });
      test('script can be evaluated', () => {
        // Workaround to allow JSDOM to evaluate the script
        const $script = document.querySelector('#body script:not([src])');
        $script.remove();
        const $evaluatedScript = document.createElement('script');
        $evaluatedScript.innerHTML = $script.innerHTML;
        document.body.append($evaluatedScript);
        expect(window.dataLayer).toHaveLength(2);
      });
    });
  });
});
