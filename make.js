var fs = require('fs');
var compressor = require('node-minify');

// Using Google Closure
new compressor.minify({
    type: 'uglifyjs',
	fileIn: 'src/*.js',
    fileOut: 'build/jquery-custombind.min.js',
	
    callback: function(err, min){
		if(err != null){
			console.log('ERR: ' + err);
			return;
		}
        console.log('Compressed: ' + this.fileOut);
    }
});