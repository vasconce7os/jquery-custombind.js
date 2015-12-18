# jQuery Custom Bind plugin

This plugin is used to bind data into html containers (usually div tags) using jb-bind, jb-context and jb-event-* attributes

## Demo

DEMO #1 - <a href="http://ole1986.github.io/jquery-custombind.js/examples/demo-1.html" target="_blank">click here</a> 

## Example

`examples/demo-1.html`

```html
<div class="demoFrame" jb-context="demo-1-context">
	<div class="code">
		&lt;div class="ctxFrame" jb-context="demo-1-context"&gt;
	</div>

	<!-- Single property //-->
	<label>Single Property using 'jb-bind' attribute and 'jb-event-*' for event handlers</label>
	<div class="code">
		&lt;span jb-bind="name" jb-event-click="testClick"&gt;&nbsp;&lt;/span&gt;
	</div>
	<label>Result:</label>
	<div><span jb-bind="name" jb-event-click="testClick">&nbsp;</span></div>
	
	<div>&nbsp;</div>
	<!-- Use repeating list //-->
	<label>Repeating data using 'jb-repeat' attribute</label>
	<div class="code">
			&lt;div style="margin-top: 1em;" jb-repeat="(k, v) in items"&gt;
			&lt;/div&gt;
	</div>
	<label>Result:</label>
	<div style="margin-top: 1em;" jb-repeat="(k, v) in items">
		<div>
			<span jb-bind="k" style="display: inline-block;"></span>
			<span jb-bind="v.name" style="display: inline-block; margin-left: 1em;"></span>
		</div>
	</div>
	
	<div>&nbsp;</div>
	<!-- Once the Load() method is called , all events will be available //-->
	<label>Interaction using button events</label>
	<div class="code">
		&lt;input type="button" jb-bind jb-event-click="loadOtherData" value="Load Other data" /&gt;
	</div>
	<div>
		<input type="button" jb-bind jb-event-click="loadOtherData" value="Load Other data" />
	</div>
</div>
```

`examples/demo.js`

```javascript
$(function(){
	var demo1ctx = new CustomBind('demo-1-context', { 
			allowHide: true, /* allow the context to get hidden from other context calls */
			hideOther: true, /* hide all other context containers having 'allowHide' set to true */
			showLoading: true, /* display loading context, when defined */
			hideDelay: 0, /* set a delay when this context gets hidden */ 
			noAsync: false, /* do not use setTimeout to render asynchronouse */
			persistent: false, /* do not replace BUT append all data to repeater lists */
			lifetime: 0,  /* define a lifetime to all bindings (IN MILLISECONDS) - 0 is disabled */
			debug: 1, /* display debug info */
			events: {
				testClick: function(obj, data){
					alert('This is a test click from testClick event handler');
				},
				loadOtherData: function(obj, data){
					// fill context with new data using Load method and force rebind
					demo1ctx.Load({ name: 'Other Data', items: [ { name: "Replacement 1" },  {name: "Replacement 2"},  {name: "Extra 3"} ]}, true);
				},
			}
	});
	
	// initialize the context with the below JSON data
	demo1ctx.onDataBind = { name: "You can click me", items: [ { name: "Test 1" }, {name: "Test 2"} ] };
	// and load it
	
	// This setTimeout is not neccessary but used to represent the changes 
	setTimeout(function(){
		// bind the data
		demo1ctx.Load();
	}, 2000);
	
	// CustomBind has a loading event implemented by default. Set the CustomBind option "showLoading: false" to disable it
	//CustomBind.$ctxLoading.Show();
});
```
