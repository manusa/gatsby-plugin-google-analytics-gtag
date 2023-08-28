# gatsby-plugin-google-analytics-gtag
[![npm](https://img.shields.io/npm/v/gatsby-plugin-google-analytics-gtag)](https://www.npmjs.com/package/gatsby-plugin-google-analytics-gtag)

Gatsby plugin to add Google Analytics support to your site leveraging Google's [gtag.js](https://developers.google.com/tag-platform/gtagjs) library.

The main difference with the official Gatsby plugins is that this one doesn't use cookies to track visitors.

## Usage

```javascript
plugins: [
  {
    resolve: 'gatsby-plugin-google-analytics-gtag',
    options: {
      trackingId: 'UA-YOURIDHERE-1',
      enableSessionStorage: true,
      consentMode: 'granted'
    }
  },
]
```

| Option         | Description                                   | Values                |
|----------------|-----------------------------------------------|-----------------------|
| `constentMode` | Allows to specify the default consent options | `denied` or `granted` |

