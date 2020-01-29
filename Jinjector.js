// Jinjector is THE alternative for loading scripts into a website, without disturbing the devs
// if you host Jinjector yourself, you don't have to use third party tools like GTM

var Jinjector = {};

Jinjector.init = function(){
	// load the scripts defined in the config file
	Jinjector.status = 'initializing';
	try{
		var scripts = document.getElementsByTagName('script');
		var thisScript = scripts[scripts.length - 1];
		console.log(thisScript);
		// this is the standard configuration, in no other has been specified in the attribute
		// the HTML property is data-configuration-URI
		var configurationURI = 'Jinjector.config';
		var configurationsAttr = thisScript.getAttribute("data-configuration-file");
		
		if (configurationsAttr != undefined && configurationsAttr != ""){
			configurationURI = configurationsAttr;
		}
		Jinjector.Xhr.GET(configurationURI, function(result){
			if (result.status < 300){
				Jinjector.config = JSON.parse(result.body);
				Jinjector.status = 'loading';
				if (Jinjector.config.scripts != null){
					Jinjector.config.scripts.forEach(function(script){
							var newScript = document.createElement('script');
							if (Jinjector.config.outPutOnConsole){
								console.log('----');
								console.log('Loading script "' + script.name + '"...');
								console.log('Description:' + script.description);
								console.log('URL: ' + script.URL);
								newScript.onload = function () {
									console.log('Script "' + script.name + '" has been loaded');
								};
							}
							newScript.src = script.URL;
							document.head.appendChild(newScript);
						}
					);
				}
				if (Jinjector.config.stylesheets != null){ 
					Jinjector.config.stylesheets.forEach(function(stylesheet){
						var stylesheet = document.createElement("link")
						if (Jinjector.config.outPutOnConsole){
							console.log('----');
							console.log('Loading stylesheet "' + stylesheet.name + '"...');
							console.log('Description:' + stylesheet.description);
							console.log('URL: ' + stylesheet.URL);
							newScript.onload = function () {
								console.log('Script "' + script.name + '" has been loaded');
							};
						}
						stylesheet.setAttribute("rel", "stylesheet");
						stylesheet.setAttribute("type", "text/css");
						stylesheet.setAttribute("href", stylesheet.URL);
						document.head.appendChild(stylesheet);
						}
					);
				}			
				Jinjector.status = 'loaded';
			} else {
				console.error('An error occurred while reading the Jinjector configuration: HTTP '+result.status);
				Jinjector.status = 'loading_error_' + result.status;
			}
		});
	} catch(e){
		console.error('An expection occured while reading the Jinjector configuration: '+ e);
		Jinjector.status = 'loading_error_JSON';
	}
}


// provide self-contained AJAX functions

Jinjector.Xhr={	
	GET:function(url, callback, body, auth){
		var xmlhttp;
		if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		xmlhttp.onreadystatechange=function(){
			if (xmlhttp.readyState==4){
				var result = {};
				result.body = xmlhttp.responseText;
				result.status = xmlhttp.status;
				callback(result);
			}
		}
		
		xmlhttp.open("GET",url,true);
		if (auth != undefined)
			xmlhttp.setRequestHeader("Authorization", "Basic " + btoa(auth['username'] + ":" + auth['password']));
		xmlhttp.send(body);
	},

	POST:function(url, callback, body, auth, contentType){
		var xmlhttp;
		if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}		
		
		
		xmlhttp.onreadystatechange=function(){
			if (xmlhttp.readyState==4){
				var result = {};
				result.body = xmlhttp.responseText;
				result.status = xmlhttp.status;
				callback(result);
			}
		}
		
		xmlhttp.open("POST",url,true);
		if (contentType != undefined)
			xmlhttp.setRequestHeader("Content-Type", contentType);
		if (auth != undefined)
			xmlhttp.setRequestHeader("Authorization", "Basic " + btoa(auth['username'] + ":" + auth['password']));
		xmlhttp.send(JSON.stringify(body));
	}
}

if (document.readyState === "complete" || document.readyState === "loaded") {
	Jinjector.init();
} else {
	document.addEventListener('DOMContentLoaded', Jinjector.init);
}
