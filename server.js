(function() {
	var app, express, fs;
	
	fs = require("fs");
	
	express = require('express');
	
	app = express();
	
	app.use(express["static"](__dirname + '/app'));
	
	app.get('/getsourcefiles', function(req, res) {
		fs.readdir(__dirname + '/app/audio/', function(err, files) {
			var files = files.filter(function(f) { return f.indexOf('.') != 0; });
			res.send(files);
		});
	});
	
	app.get('/getfeaturefiles', function(req, res) {
		fs.readdir(__dirname + '/app/features/', function(err, files) {
			var sourceName = req.query.source;
			var dotIndex = sourceName.indexOf('.');
			if (dotIndex >= 0) {
				sourceName = sourceName.substring(0, dotIndex);
			}
			files = files.filter(function(f) { return f.indexOf(sourceName) >= 0; });
			res.send(files);
		});
	});
	
	app.listen("8080");
	
	console.log('Server started at http://localhost:8080');
	
}).call(this);
