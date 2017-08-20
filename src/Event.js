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

var ShuellUIEventDispatcher = function() {
	
	/** @member {object} eventListeners - Events listeners.*/
	this.eventListeners = {};
};

/**
 * Remove event listener.
 * 
 * @param {string} name - Event name.
 * @param {function} callback - Callback function to remove from listeners.
 */
ShuellUIEventDispatcher.prototype.removeEventListener = function(name, callback) {
	if(this.eventListeners[name]) {
		var i;
		var l = this.eventListeners[name].length;
		for(i=0;i<l;i++) {
			if(this.eventListeners[name][i] === callback) {
				this.eventListeners[name].splice(i,1);
				break;
			}				
		}
	}
};
	
/**
 * Add an event listener.
 * 
 * @param {string} name - Event name.
 * @param {function} callback - Callback function to add as listener.
 */
ShuellUIEventDispatcher.prototype.addEventListener = function(name, callback) {
	if(!this.eventListeners[name]) {
		this.eventListeners[name] = [];
	}
	this.eventListeners[name].push(callback);
};
	
/**
 * Fire an event.
 * 
 * @param {string} name - Event name.
 */
ShuellUIEventDispatcher.prototype.dispatchEvent = function(event) {
	if(this.eventListeners[event.name]) {
		event.target = this;
		var i;
		var l = this.eventListeners[event.name].length;
		for(i=0;i<l;i++) {
			this.eventListeners[event.name][i].apply(this, [event]);
		}
	}
};
