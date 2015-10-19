(function() {
	
	var fs = require("fs");
	var express = require('express');
	var bodyParser = require('body-parser');
	
	var app = express();
	
	app.use(express["static"](__dirname + '/app'));
	app.use(bodyParser.json());
	
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
	
	app.post('*', function(req, res) {
		fs.writeFile('app/' + req.path, JSON.stringify(req.body), function (err) {
			if (err) return res.send(err);
			res.send('file saved at ' + req.path);
		});
	});
	
	app.listen("8080");
	
	console.log('Server started at http://localhost:8080');
	
}).call(this);
