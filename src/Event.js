/**
 * Shell UI event object.
 * @constructor
 * @classdesc Shell UI command.
 * @param {string} name - Event name.
 * @param {object} options - Options object.
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var ShellUIEvent = function(name, options) {
	/** @member {string} name - Event name */
	this.name = name;
	/** @member {object} options - Event options */
	this.options = options;
};