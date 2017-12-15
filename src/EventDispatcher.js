/**
 * Event dispatcher constructor.
 * 
 * @classdesc Event dispatcher implementation.
 * @constructor
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermEventDispatcher = function() {
	
	/** 
	 * @property {object} listeners - Events listeners.
	 * @access private
	 */
	this.listeners = {};
};

/**
 * Add an event listener.
 * 
 * @param {string} name - Event name.
 * @param {function} callback - Event callback function.
 */
JTermEventDispatcher.prototype.addEventListener = function(name, callback) {
	if(!this.listeners[name]) {
		this.listeners[name] = [];
	}
	this.listeners[name].push(callback);
};

/**
 * Fire an event.
 * 
 * @param {JTermEvent} event - An event instance to dispatch.
 */
JTermEventDispatcher.prototype.dispatchEvent = function(event) {
	if(this.listeners[event.name]) {
		event.target = this;
		var i;
		var l = this.listeners[event.name].length;
		for(i=0;i<l;i++) {
			this.listeners[event.name][i].apply(this, [event]);
		}
	}
};

/**
 * Remove event listener.
 * 
 * @param {string} name - Event name.
 * @param {function} callback - Callback function to remove from listeners.
 * @returns {boolean} true if a listener was removed or false otherwise.
 */
JTermEventDispatcher.prototype.removeEventListener = function(name, callback) {
	if(this.listeners[name]) {
		var i;
		var l = this.listeners[name].length;
		for(i=0;i<l;i++) {
			if(this.listeners[name][i] === callback) {
				this.listeners[name].splice(i,1);
				return true;
			}				
		}
	}
	return false;
};