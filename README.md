![alt text](https://github.com/vneri/Jinjector/blob/master/Jinjector_logo_small.png?raw "Jinjector")
# Jinjector
Easily inject JavaScript, CSS files and HTML snippets by specifying them in a configuration, without having to change the target site every time.
Useful when you cannot use GTM for loading external scripts or stylesheets.

## Usage
- Host Jinjector.js and Jinjector.config.json on a webspace you control
- Create the scripts, stylesheets, HTML text, function replacements you need to inject to the website
- Install Jinjector once to the target website
- Change the configuration file and never touch the target website again

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
        Please beware that all the paths should be absolute paths, unless 
        Jinjector.js and the configuration file are hosted in the same folder as the integrating website.

### Avoiding CORS with JSONP
If the server on which you are hosting Jinjector does not support CORS, you can use JSONP for loading the configuration.
In order to do so, include the following lines for the installation:
```html
<script src="Jinjector.js" data-configuration-jsonp="true"></script>
<script src="myConfig.jsonp"></script>
```
Be sure to keep this order, or the callback won't work.
In the file myConfig.jsonp you need to compress the configuration to just one line (or create the object in JavaScript), and pass it to the function Jinjector.executeConf.
```javascript
Jinjector.executeConf('{  "outputOnConsole":false,  "scripts":    [      {        "name": "Popup Offer January 1st",        "description": "Shows the offer popup",        "URL": "/offerPopupJan.js",        "trigger": "(activatePopup == true)"      },      {        "name": "Redirector",        "description": "Redirect users from EU because of GDPR",        "URL": "/EURedirector.js"      },    ],  "stylesheets":    [      {        "name": "NiceStyling",        "description": "The nice stylesheet",        "URL": "/nice.css"      },      {        "name": "Popup related styles",        "description": "Styling for all the popups",        "URL:": "/popups.css",        "trigger": "(activatePopup == true)"      }    ]}');
```

## Features
There are many things that you can do with Jinjector. You can:
- Inject external JavaScript files
- Inject external CSS stylesheets
- Inject HTML into the DOM
- Prepend code to existing functions, manipulate their return value
- Load the configuration via JSONP (avoid CORS)

### Waiting for the document to be loaded
In order to trigger scripts after the document has finished loading, you can use the following internal function as trigger:
```javascript
"trigger": "(Jinjector.DOMContentLoaded)"
```

## Configuration
In the configuration file, you specify the files to be injected and some options.

### General options and features
- "outputOnConsole": with this, you can switch on verbose mode on console
- "scripts[]": configuration for loading JavaScript files
- "stylesheets[]": options for loading CSS stylesheets
- "html[]": options for loading and injecting raw HTML
- "functionIntercepts[]": options for manipulating and intercepting JavaScript functions in the running context

#### Options valid for scripts, stylesheets and html
- "name": An short identifier
- "description": A longer description, use this for reference and documentation
- "URL": The URL from where to load the file from. Please note that relative paths relate to where Jinjector.js is hosted
- "trigger": This applies to scripts and stylesheets only. A JavaScript expression that has to evaluate to "true", in order for the file to be loaded and injected

#### Script specific options
- "inlineLoading": When this is set to true, the given script is loaded via AJAX and executed with eval
- "attributes": This applies to script not loaded inline, but via an injected script tag. You can specify what attributes have to be added to the script tag
- "attributes[]": Inside of the array, object with "name" and "value" for the attributes are expected

#### Function Intercepts
This special feature allows you to capture function calls.
- "functionName": Exact name of the function that needs to be intercepted
- "functionToCallBefore": If specified, this function is called before the intercepted function
- "functionToHandleResult": If specified, this function acts as a proxy for the result, and can modify it
- "functionToHandleExceptions": If specified, this function wraps the intercepted function and is called in case of an expection

### Example configuration file
```javascript
{
  "outputOnConsole":false,
  "scripts":
    [
      {
        "name": "Popup Offer January 1st",
        "description": "Shows the offer popup",
        "URL": "/offerPopupJan.js",
        "trigger": "(activatePopup == true)",
	  "attributes":
		[
		 {				
		  "name": "data-test",
		  "value": "test"
		 }
		]
      },
      {
        "name": "Redirector",
        "description": "Redirect users from EU because of GDPR",
        "URL": "/EURedirector.js",
        "inlineLoading": true
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
    ],
    "html":
    [
      {
        "name": "Name of HTML snippet",
        "description": "Snippet for additional tags, without javascript",
        "URL":"snippet.txt"
	  }
	],
    "functionIntercepts":
	[
	  {
		"functionName": "replaceMe",
		"functionToCallBefore": "executeBefore",
		"functionToHandleResult": "changeTheResult",
		"functionToHandleExceptions": "captureExceptions"
      }
	]
}
```

