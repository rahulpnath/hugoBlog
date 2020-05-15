/*
	disqusLoader.js v1.0
	A JavaScript plugin for lazy-loading Disqus comments widget.
	-
	By Osvaldas Valutis, www.osvaldas.info
	Available for use under the MIT License
*/

(function(window,document,index){'use strict';var extendObj=function(defaults,options){var prop,extended={};for(prop in defaults)
if(Object.prototype.hasOwnProperty.call(defaults,prop))
extended[prop]=defaults[prop];for(prop in options)
if(Object.prototype.hasOwnProperty.call(options,prop))
extended[prop]=options[prop];return extended},getOffset=function(el){var rect=el.getBoundingClientRect();return{top:rect.top+document.body.scrollTop,left:rect.left+document.body.scrollLeft}},loadScript=function(url,callback){var script=document.createElement('script');script.src=url;script.async=!0;script.setAttribute('data-timestamp',+new Date());script.addEventListener('load',function(){if(typeof callback==='function')
callback()});(document.head||document.body).appendChild(script)},throttle=function(a,b){var c,d;return function(){var e=this,f=arguments,g=+new Date;c&&g<c+a?(clearTimeout(d),d=setTimeout(function(){c=g,b.apply(e,f)},a)):(c=g,b.apply(e,f))}},throttleTO=!1,laziness=!1,disqusConfig=!1,scriptUrl=!1,scriptStatus='unloaded',instance=!1,init=function(){if(!instance||!document.body.contains(instance)||instance.disqusLoaderStatus=='loaded')
return!0;var winST=window.pageYOffset,offset=getOffset(instance).top;if(offset-winST>window.innerHeight*laziness||winST-offset-instance.offsetHeight-(window.innerHeight*laziness)>0)
return!0;var tmp=document.getElementById('disqus_thread');if(tmp)tmp.removeAttribute('id');instance.setAttribute('id','disqus_thread');instance.disqusLoaderStatus='loaded';if(scriptStatus=='loaded'){DISQUS.reset({reload:!0,config:disqusConfig})}else{window.disqus_config=disqusConfig;if(scriptStatus=='unloaded'){scriptStatus='loading';loadScript(scriptUrl,function(){scriptStatus='loaded'})}}};window.addEventListener('scroll',throttle(throttleTO,init));window.addEventListener('resize',throttle(throttleTO,init));window.disqusLoader=function(element,options){options=extendObj({laziness:1,throttle:250,scriptUrl:!1,disqusConfig:!1,},options);laziness=options.laziness+1;throttleTO=options.throttle;disqusConfig=options.disqusConfig;scriptUrl=scriptUrl===!1?options.scriptUrl:scriptUrl;if(typeof element==='string')instance=document.querySelector(element);else if(typeof element.length==='number')instance=element[0];else instance=element;if(instance)instance.disqusLoaderStatus='unloaded';init()}}(window,document,0))