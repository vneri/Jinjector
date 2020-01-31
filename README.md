![alt text](https://github.com/vneri/Jinjector/blob/master/Jinjector_logo_small.png?raw "Jinjector")
# Jinjector
Easily inject JavaScript and CSS files by specifying them in a configuration, without having to change the target site every time.
Useful when you cannot use GTM for loading external scripts or stylesheets.

## Usage

- Host Jinjector.js and Jinjector.config on a webspace you control
- Create the scripts you need to inject to the website
- Install Jinjector once to the target website
- Add the scripts and stylesheets you need to the configuration file

## Installation

Add Jinjector to the target site:
```html
<script src="Jinjector.js"></script>
```

In this case, Jinjector will load the configuration from Jinjector.config.
If you wish to specify a different configuration file, because you use Jinjector on different pages, then you have to add the data-configuration-file attribute:
```html
<script src="Jinjector.js" data-configuration-file="myConfig.json"></script>
```


## Configuration
Add the reference to the script files to the configuration file. You can also specify, whether Jinjector gives a status over the console. With "trigger" you can optionally specify an expression that, when validate to "true" triggers a script or a stylesheet:
```javascript
{
  "outputOnConsole":false,
  "scripts":
    [
      {
        "name": "Popup Offer January 1st",
        "description": "Shows the offer popup",
        "URL": "/offerPopupJan.js",
        "trigger": "(activatePopup == true)"
      },
      {
        "name": "Redirector",
        "description": "Redirect users from EU because of GDPR",
        "URL": "/EURedirector.js"
      },
    ],
  "stylesheets":
    [
      {
        "name": "NiceStyling",
        "description": "The nice stylesheet",
        "URL": "/nice.css"
      },
      {
        "name": "Popup related styles",
        "description": "Styling for all the popups",
        "URL:": "/popups.css",
        "trigger": "(activatePopup == true)"
      }
    ]
}
```

