/**
 * jQuery custom binding extension
 * 
 * Author: Ole Koeckemann <ole.k@web.de>
 * Requirements: jQuery jQuery.promise
 */

function CustomBind(contextName, options) {
	var self = this;
	
	var evtSave = function(el, data){
		if(self.settings.debug > 0) console.log('Save event fired in ' + self.settings.contextName);
		updateData(el, data);
	};
	var evtRender = function() {
		if(self.settings.debug > 1) console.log('Rendering ' + contextName + '...');
		
		if(CustomBind.$ctxLoading.settings.contextName != self.settings.contextName && self.settings.showLoading) {
			CustomBind.$ctxLoading.Load({text: 'Rendering ' + contextName}, true);
			//CustomBind.$ctxLoading.Show();
		}
	};
	var evtRenderComplete = function() {
		if(self.settings.debug > 0) console.log('Rendering ' + contextName + ' complete!');
		
		self.Show();
		self.settings.isBound = true;
		if(CustomBind.$ctxLoading.settings.contextName != self.settings.contextName && self.settings.showLoading)
			CustomBind.$ctxLoading.Hide();
	};
	
	var defaults = { contextName: contextName, isBound: false, allowHide: true, hideOther: true, showLoading: true, hideDelay: 0, noAsync: false, persistent: false, lifetime: 0, debug: 0, events: { } };
	var hideDelayTimer;
	var source;
	self.settings = { };
	
	var $element = $('div[jb-context="'+contextName+'"]');
	
	this.onRender = null;
	this.onRenderComplete = null;
	this.onDataBind = function(){ if(self.settings.debug > 0) console.log('Databind event not set in ' + contextName); return []; }
	
	// the "constructor" method that gets called when the object is created
	var init = function() {
		self.settings = $.extend({}, defaults, options);
		CustomBind.$collection.push(self);
	};
	
	var _load = function(optSource, rebind){
		if(rebind) self.settings.isBound = false;
		
		if(optSource)
			source = optSource;
		else if($.isFunction(self.onDataBind))
			source = self.onDataBind();
		else
			source = self.onDataBind;
					
		if(self.settings.hideOther) 
			hideOther();
			
		if(source) {
			$.when(bindControls(), bindRepeater()).then(function(){
				evtRenderComplete(); 
				if(self.onRenderComplete != null) self.onRenderComplete(self);
			});
		} else {
			bindEvents();
			evtRenderComplete();
			if(self.onRenderComplete != null) self.onRenderComplete(self);
		}
	};
	
	this.GetContext = function(){
		return $element;
	}
	
	this.Hide = function(){
		if(self.settings.hideDelay > 0) {
			hideDelayTimer = setTimeout(function(){ $element.hide(); }, self.settings.hideDelay);
		} else {
			$element.hide();
		}
	};
	
	this.Show = function(){
		if(hideDelayTimer) clearTimeout(hideDelayTimer);
		$element.show();
	};
	
	this.Load = function(optSource, rebind) {
		evtRender();
		if(self.onRender != null) self.onRender(self);
			
		// try runing it in another thread to display the loading state properly
		if(self.settings.noAsync)
			_load(optSource, rebind);
		else
			setTimeout(function(){ _load(optSource, rebind); }, 0);
	};
	
	
	var hideOther = function(){
		CustomBind.$collection.forEach(function(value, index){
			if(value.settings.contextName != contextName && value.settings.allowHide)
				value.Hide();
		});
	};
	
	var convertDots = function(v){
		var query = "";
		var res = v.split('.');
		for(var i = 0; i < res.length; i++) {
			if($.isNumeric(res[i]))
				query += '[' + res[i] + ']';
			else 
				query += '["' + res[i] + '"]';
		}
		return query;
	};
	
	var updateData = function(el, data){
		$element.find('*[jb-bind!=""][jb-bind]').each(function(i, item){
			var $item = $(item);
			var tagName =  $item.prop('tagName');
			if(tagName == 'INPUT') {
				eval('data' + convertDots($item.attr('jb-bind')) + ' = "' + $item.val() + '"' );
			}
				
		});
	};
	
	var parseCondition = function(condStr, data){
		if(!condStr) return true;
		if(!data) return true;
		// jb-show attribute - conditional display output
		var m = condStr.match(/^[\w.]+$|([\w.]+)\s+?(==|>|<|<=|>=)\s+?([\w.]+)$/)
		
		if(m[0] && !m[1]) {
			return eval('data' + convertDots(m[0]));
		} else {
			return eval('data' + convertDots(m[1]) + ' ' + m[2] + ' ' + m[3]);
		}
	};
	
	var parseBindText = function(data, v){
		try{
			return eval("data" + convertDots(v));
		}
		catch(e){
			console.log('Failed to bind: ' + v);
			return "";
		}
	};
	
	var parseBindAttr = function(data, el){
		if(!el.attributes) return;
		$.each(el.attributes, function(){
			if(this.name && this.value != "" && this.value.substring(0,1) == "="){
				this.value = eval("data" + convertDots( this.value.substring(1) ));
			}
		});
	};
	
	var bindControls = function(s, el, fromRepeater){
		var dfd = $.Deferred();
		
		var element = $element;
		if(el) element = $(el);
		
		if(!s) s = source;
		
		element.find('*[jb-bind]').each(function(i, item){
			var $item = $(item);
			
			if($item.attr('jb-render') == '1' && self.settings.isBound || $item.attr('jb-render') == '2') return;
			
            // when the controls are inside a repeater, but its not called from the repeater, ignore it
            var found = $item.closest('div[jb-repeat], tr[jb-repeat]');
            if(found.length > 0 && typeof fromRepeater === 'undefined') return;
            
            // bindControls has been called from bindRepeater
            if(typeof fromRepeater !== 'undefined') {
                // skip nested repeaters
                if(found.length > 0 && found != fromRepeater) return;
                
                $item.attr('jb-render', '2');
            } else {
                $item.attr('jb-render', '1');
            }
                        
            // use jb-show attribute to conditionally DISPLAY this element
            var isCond = parseCondition($item.attr('jb-show'), s);
            if(!isCond) {
                $item.hide();
                return;
            }
            
            // use jb-cond attribute to conditionally BIND this element
            isCond = parseCondition($item.attr('jb-cond'), s);
            if(!isCond) {
                // do not bind the value from data source
                return;
            }
            
            var bindValue = $item.attr('jb-bind');
            var tagName =  $item.prop('tagName');
            if(tagName == 'INPUT' && bindValue)
                $item.val( parseBindText(s,bindValue) );
            else
                $item.text( parseBindText(s,bindValue) );
            
            parseBindAttr(s,item);
            // (re)bind all events
            bindEvent(item, s);
            
            // lifetime of the DOM if defined in settings
            if(self.settings.lifetime > 0) setTimeout(function(){ $item.remove() }, self.settings.lifetime);
		});
		dfd.resolve();
		return dfd.promise();
	};
	
	var bindEvents = function(el){
		var element = $element;
		if(el) element = $(el);
		
		element.find('*[jb-bind]').each(function(){
			bindEvent(this, null);
		});
	};
		
	var bindEvent = function(el, data){
		$.each(el.attributes, function(){
			if(this.name && el.value != "" && this.name.substring(0, 9) == 'jb-event-') {
				var evtName = this.name.substring(9);
				var evtValue = this.value;
				if(evtName == 'save') {
					$(el).on('click', function() { evtSave(el, source); self.settings.events[evtValue](el, source); } );
				} else {
					$(el).on(evtName, function() { self.settings.events[evtValue](el, data); } );
				}
				$(el).removeAttr(this.name);
			}
		});
	};
	
	var bindRepeater = function(s, el, nested){
		var dfd = $.Deferred();
		if(!s) s = source;
		if(!s) return false;
        
        if(!el) el = $element;
        
    	// clear everything before (re)bind when its
		if(!self.settings.persistent && !self.settings.isBound && !nested)
			el.find("*[jb-render='2']").remove();
		
        if(nested)
            el.find('*[jb-render]').each(function() { $(this).removeAttr('jb-render'); });
        
        el.find('div[jb-repeat], tr[jb-repeat]').each(function(){
			var repeater = $(this);
            
            if(self.settings.isBound && !nested) return;
			
			repeater.hide();
			var expr = $(this).attr('jb-repeat');
			var matches = expr.match(/\((\w+),\s?(\w+)\s?\) in (\w+)/);
			var keyPath = matches[1];
			var valuePath = matches[2];
			var sourcePath = matches[3];
                        
			if(!s[sourcePath]) return;
			
			for(var i = 0; i < s[sourcePath].length; i++) {
				var copy = $(this).clone();
				copy.removeAttr('jb-repeat');
				copy.css('display','');
				
				
				var obj = {};
				obj[keyPath] = i;
				obj[valuePath] = s[sourcePath][i];
                
                bindRepeater(obj[valuePath] , copy, true);
                
                parseBindAttr(obj, copy[0]);
				bindControls( obj, copy[0] , repeater);
                
				copy.attr('jb-render', '2');
				
				// lifetime of the DOM if defined in settings
				if(self.settings.lifetime > 0) setTimeout(function(){ copy.remove() }, self.settings.lifetime);
				
				repeater.before(copy);
			}
		})
		dfd.resolve();
		return dfd.promise();
	};
	
	init();
}

CustomBind.$collection = [];
$(function(){
	CustomBind.$ctxLoading = new CustomBind('ctxLoading', {allowHide: false, showLoading: false, hideDelay: 500, hideOther: false, persistent: true});
})