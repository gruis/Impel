/*
Script: Clientcide.js
	The Clientcide namespace.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var Clientcide = {
	version: '806',
	setAssetLocation: function(baseHref) {
		if (window.StickyWin && StickyWin.ui) {
			StickyWin.UI.refactor({
				options: {
					baseHref: baseHref + '/stickyWinHTML/'
				}
			});
			if (StickyWin.alert) {
				var CGFsimpleErrorPopup = StickyWin.alert.bind(window);
				StickyWin.alert = function(msghdr, msg, base) {
				    return CGFsimpleErrorPopup(msghdr, msg, base||baseHref + "/simple.error.popup");
				};
			}
			if (StickyWin.UI.Pointy) {
				StickyWin.UI.Pointy.refactor({
					options: {
						baseHref: baseHref + '/PointyTip/'
					}
				});
			}
		}
		if (window.TagMaker) {
			TagMaker = TagMaker.refactor({
			    options: {
			        baseHref: baseHref + '/tips/'
			    }
			});
		}
		if (window.ProductPicker) {
			ProductPicker.refactor({
			    options:{
			        baseHref: baseHref + '/Picker'
			    }
			});
		}

		if (window.Autocompleter) {
			var AcClientcide = {
					options: {
						baseHref: baseHref + '/autocompleter/'
					}
			};
			Autocompleter.Base.refactor(AcClientcide);
			if (Autocompleter.Ajax) {
				["Base", "Xhtml", "Json"].each(function(c){
					if(Autocompleter.Ajax[c]) Autocompleter.Ajax[c].refactor(AcClientcide);
				});
			}
			if (Autocompleter.Local) Autocompleter.Local.refactor(AcClientcide);
			if (Autocompleter.JsonP) Autocompleter.JsonP.refactor(AcClientcide);
		}

		if (window.Lightbox) {
			Lightbox.refactor({
			    options: {
			        assetBaseUrl: baseHref + '/slimbox/'
			    }
			});
		}

		if (window.Waiter) {
			Waiter.refactor({
				options: {
					baseHref: baseHref + '/waiter/'
				}
			});
		}
	},
	preLoadCss: function(){
		if (window.DatePicker) new DatePicker();
		if (window.ProductPicker) new ProductPicker();
		if (window.TagMaker) new TagMaker();
		if (window.StickyWin && StickyWin.ui) StickyWin.ui();
		if (window.StickyWin && StickyWin.pointy) StickyWin.pointy();
		Clientcide.preloaded = true;
		return true;
	},
	preloaded: false
};
(function(){
	if (!window.addEvent) return;
	var preload = function(){
		if (window.dbug) dbug.log('preloading clientcide css');
		if (!Clientcide.preloaded) Clientcide.preLoadCss();
	};
	window.addEvent('domready', preload);
	window.addEvent('load', preload);
})();
setCNETAssetBaseHref = Clientcide.setAssetLocation;

/*
Script: dbug.js
	A wrapper for Firebug console.* statements.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var dbug = {
	logged: [],	
	timers: {},
	firebug: false, 
	enabled: false, 
	log: function() {
		dbug.logged.push(arguments);
	},
	nolog: function(msg) {
		dbug.logged.push(arguments);
	},
	time: function(name){
		dbug.timers[name] = new Date().getTime();
	},
	timeEnd: function(name){
		if (dbug.timers[name]) {
			var end = new Date().getTime() - dbug.timers[name];
			dbug.timers[name] = false;
			dbug.log('%s: %s', name, end);
		} else dbug.log('no such timer: %s', name);
	},
	enable: function(silent) { 
		var con = window.firebug ? firebug.d.console.cmd : window.console;

		if((!!window.console && !!window.console.warn) || window.firebug) {
			try {
				dbug.enabled = true;
				dbug.log = function(){
						(con.debug || con.log).apply(con, arguments);
				};
				dbug.time = function(){
					con.time.apply(con, arguments);
				};
				dbug.timeEnd = function(){
					con.timeEnd.apply(con, arguments);
				};
				if(!silent) dbug.log('enabling dbug');
				for(var i=0;i<dbug.logged.length;i++){ dbug.log.apply(con, dbug.logged[i]); }
				dbug.logged=[];
			} catch(e) {
				dbug.enable.delay(400);
			}
		}
	},
	disable: function(){ 
		if(dbug.firebug) dbug.enabled = false;
		dbug.log = dbug.nolog;
		dbug.time = function(){};
		dbug.timeEnd = function(){};
	},
	cookie: function(set){
		var value = document.cookie.match('(?:^|;)\\s*jsdebug=([^;]*)');
		var debugCookie = value ? unescape(value[1]) : false;
		if((!$defined(set) && debugCookie != 'true') || ($defined(set) && set)) {
			dbug.enable();
			dbug.log('setting debugging cookie');
			var date = new Date();
			date.setTime(date.getTime()+(24*60*60*1000));
			document.cookie = 'jsdebug=true;expires='+date.toGMTString()+';path=/;';
		} else dbug.disableCookie();
	},
	disableCookie: function(){
		dbug.log('disabling debugging cookie');
		document.cookie = 'jsdebug=false;path=/;';
	}
};

(function(){
	var fb = !!window.console || !!window.firebug;
	var con = window.firebug ? window.firebug.d.console.cmd : window.console;
	var debugMethods = ['debug','info','warn','error','assert','dir','dirxml'];
	var otherMethods = ['trace','group','groupEnd','profile','profileEnd','count'];
	function set(methodList, defaultFunction) {
		for(var i = 0; i < methodList.length; i++){
			dbug[methodList[i]] = (fb && con[methodList[i]])?con[methodList[i]]:defaultFunction;
		}
	};
	set(debugMethods, dbug.log);
	set(otherMethods, function(){});
})();
if ((!!window.console && !!window.console.warn) || window.firebug){
	dbug.firebug = true;
	var value = document.cookie.match('(?:^|;)\\s*jsdebug=([^;]*)');
	var debugCookie = value ? unescape(value[1]) : false;
	if(window.location.href.indexOf("jsdebug=true")>0 || debugCookie=='true') dbug.enable();
	if(debugCookie=='true')dbug.log('debugging cookie enabled');
	if(window.location.href.indexOf("jsdebugCookie=true")>0){
		dbug.cookie();
		if(!dbug.enabled)dbug.enable();
	}
	if(window.location.href.indexOf("jsdebugCookie=false")>0)dbug.disableCookie();
}


/*
Script: JsonP.js
	Defines JsonP, a class for cross domain javascript via script injection.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var JsonP = new Class({
	Implements: [Options, Events],
	options: {
//	onComplete: $empty,
//	globalFunction: '',
//	abortAfter: 0,
		callBackKey: "callback",
		queryString: "",
		data: {},
		timeout: 5000,
		retries: 0
	},
	initialize: function(url, options){
		this.setOptions(options);
		this.url = this.makeUrl(url).url;
		this.fired = false;
		this.scripts = [];
		this.requests = 0;
		this.triesRemaining = [];
	},
	request: function(url, requestIndex){
		var u = this.makeUrl(url);
		if(!$chk(requestIndex)) {
			requestIndex = this.requests;
			this.requests++;
		}
		if(!$chk(this.triesRemaining[requestIndex])) this.triesRemaining[requestIndex] = this.options.retries;
		var remaining = this.triesRemaining[requestIndex]; //saving bytes
		dbug.log('retrieving by json script method: %s', u.url);
		var dl = (Browser.Engine.trident)?50:0; //for some reason, IE needs a moment here...
		(function(){
			var script = new Element('script', {
				src: u.url, 
				type: 'text/javascript',
				id: 'jsonp_'+u.index+'_'+requestIndex
			});
			this.fired = true;
			this.addEvent('onComplete', function(){
				try {script.dispose();}catch(e){}
			}.bind(this));
			script.inject(document.head);
			
			if ($chk(this.options.abortAfter) && ! remaining) script.dispose.delay(this.options.abortAfter, script);

			if(remaining) {
				(function(){
					this.triesRemaining[requestIndex] = remaining - 1;
					if(script.getParent() && remaining) {
						dbug.log('removing script (%o) and retrying: try: %s, remaining: %s', requestIndex, remaining);
						script.dispose();
						this.request(url, requestIndex);
					}
				}).delay(this.options.timeout, this);
			}
		}.bind(this)).delay(dl);
		return this;
	},
	makeUrl: function(url){
		var index;
		if (JsonP.requestors.contains(this)) {
			index = JsonP.requestors.indexOf(this);
		} else {
			index = JsonP.requestors.push(this) - 1;
			JsonP.requestors['request_'+index] = this;
		}
		if(url) {
			var separator = (url.test('\\?'))?'&':'?';
			var jurl = url + separator + this.options.callBackKey + "=JsonP.requestors.request_" +
				index+".handleResults";
			if(this.options.queryString) jurl += "&"+this.options.queryString;
			jurl += "&"+Hash.toQueryString(this.options.data);
		} else {
			var jurl = this.url;
		}
		if ($chk(this.options.globalFunction)) {
			window[this.options.globalFunction] = function(r){
				JsonP.requestors[index].handleResults(r)
			};
		}
		return {url: jurl, index: index};
	},
	handleResults: function(data){
		dbug.log('jsonp received: ', data);
		this.fireEvent('onComplete', [data, this]);
	}
});
JsonP.requestors = [];
