// Jinjector is THE alternative for loading scripts into a website, without disturbing the devs
// if you host Jinjector yourself, you don't have to use third party tools like GTM

var Jinjector = {};

Jinjector.init = function(){
	// load the scripts defined in the config file
	Jinjector.status = 'initializing';
	try{
		Jinjector.Xhr.GET('Jinjector.config', function(d){
			Jinjector.config = JSON.parse(d);
			Jinjector.status = 'loading';
			
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
			
			Jinjector.status = 'loaded';
		});
	} catch(e){
			console.error('An expection occured while reading the Jinjector configuration: '+ e);
			Jinjector.status = 'loading_error';
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
			
			if (xmlhttp.readyState==4 && xmlhttp.status==200){
				callback(xmlhttp.responseText);
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
				callback(xmlhttp.responseText);
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
