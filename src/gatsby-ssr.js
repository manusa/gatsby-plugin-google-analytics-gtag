import React from 'react';

export const onRenderBody = ({
  setHeadComponents,
  setPostBodyComponents
}, {
  trackingId,
  enableLocalStorage = false,
  enableSessionStorage = false,
  consentMode = 'denied',
  // Required for integration test
  getEnv = () => process.env.NODE_ENV
}) => {
  if (getEnv() !== 'production' || !trackingId) {
    return null;
  }
  setHeadComponents([
    <link
      rel='preconnect'
      key='preconnect-google-gtag'
      href='https://www.googletagmanager.com'
    />,
    <link
      rel='dns-prefetch'
      key='dns-prefetch-google-gtag'
      href='https://www.googletagmanager.com'
    />
  ]);
  const inlineScripts = [];
  inlineScripts.push(<script key='gtag' async src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`} />);
  // Page views sent manually, check gatsby-browser.js
  inlineScripts.push(<script key='gtag-gatsby' dangerouslySetInnerHTML={{__html: `
    const GA_CLIENT_ID_KEY = 'ga:clientId';
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    const url = URL.createObjectURL(new Blob());
    const uuid = url.substring(url.lastIndexOf('/') + 1);
    let effectiveClientId;
    if (${enableLocalStorage} && window.localStorage) {
      if (!localStorage.getItem(GA_CLIENT_ID_KEY)) {
        window.localStorage.setItem(GA_CLIENT_ID_KEY, uuid)
      }
      effectiveClientId = window.localStorage.getItem(GA_CLIENT_ID_KEY);
    } else if (${enableSessionStorage} && window.sessionStorage) {
      if (!sessionStorage.getItem(GA_CLIENT_ID_KEY)) {
        window.sessionStorage.setItem(GA_CLIENT_ID_KEY, uuid)
      }
      effectiveClientId = window.sessionStorage.getItem(GA_CLIENT_ID_KEY);
    } else {
      effectiveClientId = uuid;
    }
    gtag('consent', 'default', {
      ad_storage: '${consentMode}',
      analytics_storage: '${consentMode}'
    });
    gtag('js', new Date());
    gtag('config', '${trackingId}', {
      send_page_view: false,
      client_storage: 'none',
      client_id: effectiveClientId
    });
  `}}/>);
  return setPostBodyComponents(inlineScripts);
};
