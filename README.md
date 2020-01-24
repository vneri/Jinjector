# Jinjector
Easily inject JavaScript by specifying files in a configuration, without having to change the target site.
Useful when you cannot use GTM for loading external scripts.

## Usage

- Host Jinjector.js and Jinjector.config on a webspace you control
- Create the scripts you need to inject to the website
- Install Jinjector once to the target website
- Add the scripts you need to the configuration file

## Installation

Add Jinjector to the target site:
```html
<script src="Jinjector.js" />
```

## Configuration
Add the reference to the script files to the configuration file. You can also specify, whether Jinjector gives a status over the console:
```javascript
{
  "outputOnConsole":false,
  "scripts":
    [
      {
        "name": "Popup Offer January 1st",
        "description": "Shows the offer popup",
        "URL": "/offerPopupJan.js"
      },
      {
        "name": "Redirector",
        "description": "Redirect users from EU because of GDPR",
        "URL": "/EURedirector.js"
      },
    ]
}
```

