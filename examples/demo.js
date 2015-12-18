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