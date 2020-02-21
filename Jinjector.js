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
		var configurationType = thisScript.getAttribute("data-configuration-jsonp");
			if (configurationType != undefined){
				// configuration will be loaded by config file
				return;
			}
		if (thisScript != undefined){
			var configurationsAttr = thisScript.getAttribute("data-configuration-file");
		}
		if (configurationsAttr != undefined && configurationsAttr != ""){
			configurationURI = configurationsAttr;
		}
		Jinjector.Xhr.GET(configurationURI, function(result){
			if (result.status < 300){
				Jinjector.executeConf(result.body);
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

Jinjector.executeConf = function(confText){
	if (confText == "" || confText == undefined){
		return;
	}
	Jinjector.config = JSON.parse(confText);
	Jinjector.status = 'loading';
	if (Jinjector.config.scripts != null){
		Jinjector.config.scripts.forEach(function(script){
			try{
				if ( (script.trigger != undefined) && !Jinjector.safeEval(script.trigger) ){
					Jinjector.triggerIntervals[script.name] = window.setInterval(function(){
						Jinjector.watch(script.name, script.trigger, function(){
							Jinjector.loadScript(script, Jinjector.config.outputOnConsole);
						});
					}, 500)
				} else {
					Jinjector.loadScript(script, Jinjector.config.outputOnConsole);
				}
			} catch(e){
				console.error(e);
			}			
		});
	}
	if (Jinjector.config.stylesheets != null){ 
		Jinjector.config.stylesheets.forEach(function(stylesheet){
			if (stylesheet.trigger != undefined){
				Jinjector.triggerIntervals[stylesheet.name] = window.setInterval(function(){
					Jinjector.watch(stylesheet.name, stylesheet.trigger, function(){
						Jinjector.loadStylesheet(stylesheet, Jinjector.config.outputOnConsole);
					});
				}, 500)
			} else {
				Jinjector.loadStylesheet(stylesheet, Jinjector.config.outputOnConsole);
			}
		});
	}
	if (Jinjector.config.html != null){ 
		Jinjector.config.html.forEach(function(html){
			Jinjector.loadHTML(html, Jinjector.config.outputOnConsole);
		});
	}

	Jinjector.functionAvailableOrNotNeeded = function(singleFunction, reallyNeeded){
		// this checks if the given function is available
		if ((singleFunction != "") && (singleFunction != undefined) && (singleFunction != null)){
			return (eval('window.'+singleFunction) != undefined)
		} else {
			if (reallyNeeded == true){
				return false;
			} else {
				return true;
			}
		}
	}

	Jinjector.interceptFunctionsAvailableOrNotNeeded = function(functionIntercept){
		return Jinjector.functionAvailableOrNotNeeded(functionIntercept.functionName, true)
				&&
				Jinjector.functionAvailableOrNotNeeded(functionIntercept.functionToHandleResult)
				&&
				Jinjector.functionAvailableOrNotNeeded(functionIntercept.functionToCallBefore)
				&&
				Jinjector.functionAvailableOrNotNeeded(functionIntercept.functionToHandleExceptions);
	}

	if (Jinjector.config.functionIntercepts != null){
		Jinjector.config.functionIntercepts.forEach(function(functionIntercept, interceptIndex){
			if (Jinjector.config.outputOnConsole){
				console.log('Evaluating the interception nr '+interceptIndex+' of function ' + functionIntercept.functionName);
			}

			if (Jinjector.interceptFunctionsAvailableOrNotNeeded(functionIntercept)){
				eval(functionIntercept.functionName+ ' =  Jinjector.intercept(functionIntercept, Jinjector.config.outputOnConsole);');
			} else {
				Jinjector.triggerIntervals[functionIntercept.functionName] = window.setInterval(function(){
					Jinjector.watch(functionIntercept.functionName,'Jinjector.interceptFunctionsAvailableOrNotNeeded(Jinjector.config.functionIntercepts['+interceptIndex+'])' , function(){
						eval(functionIntercept.functionName+ ' = Jinjector.intercept(functionIntercept, Jinjector.config.outputOnConsole);');
					});
				}, 500);
			};		
		});
	}
	
	Jinjector.status = 'loaded';
};

Jinjector.safeEval = function(expression){
	try{
		if (eval('typeof('+expression+') == "function"')){
			return true;
		} else {
			return eval(expression);
		}
	}catch(e){
		return false;
	}
}

Jinjector.watch = function(name, expression, callback){
	try{
		if (Jinjector.safeEval(expression)){
			window.clearInterval(Jinjector.triggerIntervals[name]);
			callback();
		}
	} catch(e){
		window.clearInterval(Jinjector.triggerIntervals[name]);
		console.error('An error occurred while evaluating a trigger ' +e);
	}
}

Jinjector.loadScript = function(script, outputOnConsole){
	if(typeof outputOnConsole == undefined) {
		outputOnConsole = false;
	}
	var newScript = document.createElement('script');
	if (Jinjector.config.outputOnConsole){
		console.log('----');
		console.log('Loading script "' + script.name + '"...');
		console.log('Description:' + script.description);
		console.log('URL: ' + script.URL);
		newScript.onload = function () {
			console.log('Script "' + script.name + '" has been loaded');
		};
	}
	// loading inline or as <script> meta tag
	if (script.inlineLoading){
		Jinjector.Xhr.GET(script.URL, function(result){
			if (result != undefined && (result.status < 300) && result.body != "" && result.body != undefined){
				if (Jinjector.config.outputOnConsole){
					console.log('Inline loading ' + script.URL);
				}
				eval(result.body);
			}
		});
	} else {
		// set passed attributes
		if (script.attributes != undefined){
			for (var a=0; a < script.attributes.length; a++){
				newScript.setAttribute(script.attributes[a].name, script.attributes[a].value);
			}
		}
		newScript.src = script.URL;
		document.head.insertAdjacentElement('afterbegin', newScript);
	}
}

Jinjector.loadStylesheet = function(stylesheet, outputOnConsole){
	if(typeof outputOnConsole == undefined) {
		outputOnConsole = false;
	}
	var newStylesheet = document.createElement("link")
	if (Jinjector.config.outputOnConsole){
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

Jinjector.loadHTML = function(html, outputOnConsole){
	Jinjector.Xhr.GET(html.URL, function(result){
		if (result != undefined && (result.status < 300) && result.body != "" && result.body != undefined){
			var targetElements = document.querySelectorAll(html.targetElement);
			for (var el=0; el < targetElements.length; el++){
				targetElements[el].insertAdjacentHTML('afterbegin', result.body);
				if (outputOnConsole){
					console.log('HTML text "'+html.name+'" loaded into element ' + targetElements[el]);
				}
			}	
		}
	});
}

Jinjector.intercept = function (functionIntercept, outputOnConsole){
	try{
		eval('functionIntercept.originalFunction = eval(functionIntercept.functionName)');
		functionIntercept.functionToHandleResult = eval(functionIntercept.functionToHandleResult);
		functionIntercept.functionToCallBefore = eval(functionIntercept.functionToCallBefore);
		functionIntercept.functionToHandleExceptions = eval(functionIntercept.functionToHandleExceptions);
		if (outputOnConsole){
			console.log('Intercepting function: '+ functionIntercept.functionName);
		}
	}catch(e){
		console.error(e);
		return null;
	}
	return function(){
		// check if a function to call before has been passed
		if (functionIntercept.functionToCallBefore != undefined && functionIntercept.functionToCallBefore != null){
			if (outputOnConsole){
				console.log('Calling function for '+functionIntercept.functionName);
			}
			functionIntercept.functionToCallBefore();
		}
		// check if a function to handle the result has been passed, otherwise just return the result
		if (functionIntercept.functionToHandleResult == undefined || functionIntercept.functionToHandleResult == null){
			functionIntercept.functionToHandleResult = function(result){
				return result;
			}
		}
		try{
			// call the original function
			return (functionIntercept.functionToHandleResult(functionIntercept.originalFunction.apply(null, arguments)));
		} catch(e){
			if (functionIntercept.functionToHandleExceptions != null && functionIntercept.functionToHandleExceptions != undefined){
				console.error(e);
				functionIntercept.functionToHandleExceptions(e);
			} else {
				throw(e);
			}
		}
	}
};

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

Jinjector.DOMContentLoaded = function(){
	return document.readyState === "complete" || document.readyState === "loaded";
}

Jinjector.init();

/*
if (document.readyState === "complete" || document.readyState === "loaded") {
	Jinjector.init();
} else {
	document.addEventListener('DOMContentLoaded', Jinjector.init);
}
*/