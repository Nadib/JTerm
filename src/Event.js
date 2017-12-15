/**
 * JTerm event constructor.
 * @constructor
 * @classdesc JTerm event.
 * @param {string} name - Event name.
 * @param {object} [options] - Options object.
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermEvent = function(name, options) {
	/** @property {string} name - Event name */
	this.name = name;
	/** @property {object} [options] - Event options */
	this.options = options;
};