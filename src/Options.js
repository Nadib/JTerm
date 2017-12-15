/**
 * Options constructor
 * @classdesc Options object.
 * 
 * @constructor
 * @param {object} [options] - Options given as argument.
 * @param {object} [defaultOptions] - Default options values.
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermOptions = function(options, defaultOptions) {
	if(!defaultOptions){
		defaultOptions = {};
	}

	/** 
	 * @property {Object} options - Options.
	 * @acces private
	 */
	this.options = Object.assign( defaultOptions, options);
};

/**
 * Get an option value
 * 
 * @param {string} name - Option name.
 * @return {*} Option value or undefined.
 */
JTermOptions.prototype.getOption = function(name) {
	return this.options[name];
};

/**
 * Set/create an option value
 * @param {string} name - Option name.
 * @param {*} value _ The value to assign.
 */
JTermOptions.prototype.setOption = function(name, value) {
	this.options[name] = value;
};