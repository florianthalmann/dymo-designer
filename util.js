var Util = {};
module.exports = Util;

(function(global) {
	"use strict";
	
	var exec = require('child_process').exec;
	
	function execute(command, callback) {
		exec(command, {stdio: ['pipe', 'pipe', 'ignore']}, function(error, stdout, stderr) {
			if (error) {
				console.log(stderr);
				if (callback) { callback(false); }
			} else {
				if (callback) { callback(true); }
			}
		});
	}
	
	global.execute = execute;
	
})(Util);