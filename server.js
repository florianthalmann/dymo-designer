(function() {
	
	var fs = require("fs");
	var express = require('express');
	var bodyParser = require('body-parser');
	
	var app = express();
	
	app.use(express["static"](__dirname + '/app'));
	app.use(bodyParser.json({limit: '50mb'}));
	//app.use(express.bodyParser({limit: '50mb'}));
	
	app.get('/getsourcefilesindir', function(req, res) {
		var fileTypes = ["m4a", "mp3", "wav"];
		var directory = req.query.directory;
		fs.readdir(__dirname + '/app/' + directory, function(err, files) {
			var files = files.filter(function(f) {
				//check if right extension
				return fileTypes.indexOf(f.split('.').slice(-1)[0]) >= 0;
			});
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
