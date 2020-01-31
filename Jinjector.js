// Jinjector is THE alternative for loading scripts into a website, without disturbing the devs
// if you host Jinjector yourself, you don't have to use third party tools like GTM

var Jinjector = {};

Jinjector.triggerIntervals = [];

Jinjector.init = function(){
	// load the scripts defined in the config file
	Jinjector.status = 'initializing';
	try{
		// search for the script, so we can read the configuration
		var scripts = document.getElementsByTagName('script');
		var thisScript;
		for (var i = 0; i< scripts.length; i++){
			if (scripts[i].src.indexOf('Jinjector.js')!=-1){
				thisScript = scripts[i];
			}
		};
				
		// this is the standard configuration, in no other has been specified in the attribute
		// the HTML property is data-configuration-file
		var configurationURI = 'Jinjector.config.json';
		if (thisScript != undefined)
			var configurationsAttr = thisScript.getAttribute("data-configuration-file");
		
		if (configurationsAttr != undefined && configurationsAttr != ""){
			configurationURI = configurationsAttr;
		}
		Jinjector.Xhr.GET(configurationURI, function(result){
		console.log(configurationURI);
			if (result.status < 300){
				Jinjector.config = JSON.parse(result.body);
				Jinjector.status = 'loading';
				if (Jinjector.config.scripts != null){
					Jinjector.config.scripts.forEach(function(script){
							if (script.trigger != undefined){
								Jinjector.triggerIntervals[script.name] = window.setInterval(function(){
									Jinjector.watch(script.name, script.trigger, function(){
										Jinjector.loadScript(script, Jinjector.config.outPutOnConsole);
									});
								}, 500)
							} else {
								Jinjector.loadScript(script, Jinjector.config.outPutOnConsole);
							}
						}
					);
				}
				if (Jinjector.config.stylesheets != null){ 
					Jinjector.config.stylesheets.forEach(function(stylesheet){
							if (stylesheet.trigger != undefined){
								Jinjector.triggerIntervals[stylesheet.name] = window.setInterval(function(){
									Jinjector.watch(stylesheet.name, stylesheet.trigger, function(){
										Jinjector.loadStylesheet(stylesheet, Jinjector.config.outPutOnConsole);
									});
								}, 500)
							} else {
								Jinjector.loadStylesheet(stylesheet, Jinjector.config.outPutOnConsole);
							}
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

Jinjector.watch = function(name, expression, callback){
	try{
		if (eval(expression)){
			window.clearInterval(Jinjector.triggerIntervals[name]);
			callback();
		}
	} catch{
	}
}

Jinjector.loadScript = function(script, outPutOnConsole){
	if(typeof outPutOnConsole == undefined) {
		outPutOnConsole = false;
	}
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

Jinjector.loadStylesheet = function(stylesheet, outPutOnConsole){
	if(typeof outPutOnConsole == undefined) {
		outPutOnConsole = false;
	}
	var newStylesheet = document.createElement("link")
	if (Jinjector.config.outPutOnConsole){
		console.log('----');
		console.log('Loading stylesheet "' + stylesheet.name + '"...');
		console.log('Description:' + stylesheet.description);
		console.log('URL: ' + stylesheet.URL);
	}
	newStylesheet.setAttribute("rel", "stylesheet");
	newStylesheet.setAttribute("type", "text/css");
	newStylesheet.setAttribute("href", stylesheet.URL);
	document.head.appendChild(newStylesheet);
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
