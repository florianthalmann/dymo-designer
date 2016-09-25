(function() {
	
	var fs = require('fs');
	var express = require('express');
	var path = require('path');
	var formidable = require('formidable');
	var bodyParser = require('body-parser');
	var async = require('async');
	var util = require('./util.js');
	
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
	
	var currentFeatures;
	var currentPath;
	
	function extractFeatures(path, callback) {
		currentPath = path;
		async.mapSeries(currentFeatures, extractFeature, callback);
	}
	
	//extracts the given feature from the current audio file (currentPath) if it doesn't exist yet
	function extractFeature(feature, callback) {
		var audioFolder = currentPath.slice(0, currentPath.lastIndexOf('/')+1);
		var audioFilename = currentPath.slice(currentPath.lastIndexOf('/')+1);
		var featureOutPath = currentPath.replace(currentPath.slice(currentPath.lastIndexOf('.')), '');
		var featureDestPath = audioFolder+(featureOutPath+'_').slice(currentPath.lastIndexOf('/')+1) + feature.name + '.json';
		fs.stat(featureDestPath, function(err, stat) {
			if (err) { // only extract if file doesn't exist yet
				console.log('extracting '+feature.name+' for '+audioFilename);
				util.execute('sonic-annotator -d ' + feature.plugin + ' ' + currentPath + ' -w jams', function(success) {
					if (success) {
						util.execute('mv '+featureOutPath+'.json '+featureDestPath, function(success) {
							callback();
						});
					}
				});
			} else {
				callback();
			}
		})
	}
	
	app.post('/setFeatureSelection', function(req, res) {
		currentFeatures = req.body;
		res.end("feature selection updated");
	});
	
	app.post('/postAudioFile', function(req, res) {
		var form = new formidable.IncomingForm();
		form.multiples = true;
		form.uploadDir = 'app/input/';
		form.on('file', function(field, file) {
			var currentDir = form.uploadDir+file.name.replace(/\./g,'_')+'/';
			if (!fs.existsSync(currentDir)){
				fs.mkdirSync(currentDir);
			}
			var currentPath = path.join(currentDir, file.name);
			fs.rename(file.path, currentPath);
			extractFeatures(currentPath, function() {
				res.end("features extracted for " + currentPath);
			});
		});
		form.on('error', function(err) {
			console.log('An error has occured: \n' + err);
		});
		form.on('end', function() {
			//res.end('file uploaded and analyzed');
		});
		form.parse(req);
	});
	
	
	
	app.post('/saveDymoFile', function(req, res) {
		fs.writeFile('app/' + req.path, JSON.stringify(req.body), function (err) {
			if (err) return res.send(err);
			res.send('file saved at ' + req.path);
		});
	});
	
	app.listen("8080");
	
	console.log('Server started at http://localhost:8080');
	
}).call(this);
