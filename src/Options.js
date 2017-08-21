var JTermOptions = function(options, defaultOptions) {
	/** @member {Object} options - ShellUI options.*/
	this.options = Object.assign( defaultOptions, options);
};

JTermOptions.prototype.getOption = function(name) {
	return this.options[name];
};

JTermOptions.prototype.setOption = function(name, value) {
	this.options[name] = value;
};