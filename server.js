(function() {
	
	var fs = require("fs");
	var express = require('express');
	var bodyParser = require('body-parser');
	
	var app = express();
	
	app.use(express["static"](__dirname + '/app'));
	app.use(bodyParser.json({limit: '50mb'}));
	//app.use(express.bodyParser({limit: '50mb'}));
	
	app.get('/getfoldersindir', function(req, res) {
		var directory = __dirname + '/app/' + req.query.directory;
		fs.readdir(directory, function(err, files) {
			if (files) {
				files = files.filter(function(f) {
					return fs.statSync(directory+f).isDirectory();
				});
			}
			res.send(files);
		});
	});
	
	app.get('/getallfiles', function(req, res) {
		var directory = req.query.directory;
		fs.readdir(directory, function(err, files) {
			res.send(files);
		});
	});
	
	app.get('/getsourcefilesindir', function(req, res) {
		getFilesInDir(req.query.directory, ["m4a", "mp3", "wav"], function(files) {
			res.send(files);
		});
	});
	
	app.get('/getfeaturefilesindir', function(req, res) {
		getFilesInDir(req.query.directory, ["json", "n3"], function(files) {
			res.send(files);
		});
	});
	
	function getFilesInDir(directory, fileTypes, callback) {
		fs.readdir(__dirname + '/app/' + directory, function(err, files) {
			if (err) {
				console.log(err);
			} else if (files) {
				var files = files.filter(function(f) {
					//check if right extension
					return fileTypes.indexOf(f.split('.').slice(-1)[0]) >= 0;
				});
			}
			callback(files);
		});
	}
	
	app.post('*', function(req, res) {
		fs.writeFile('app/' + req.path, JSON.stringify(req.body), function (err) {
			if (err) return res.send(err);
			res.send('file saved at ' + req.path);
		});
	});
	
	app.listen("8080");
	
	console.log('Server started at http://localhost:8080');
	
}).call(this);
