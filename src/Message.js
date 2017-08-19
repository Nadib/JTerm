var ShellUILanguage = {};

var ShellUIMessage = function(shell, message) {
	this.message = shell.getMessage(message);
};

ShellUIMessage.prototype.printf = function () {
	var args = arguments;
  	var i=0;
  	return this.message.replace(/(%s)/g, function () {
    	return args[i++];
  	});
};