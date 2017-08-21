var JTermEventDispatcher = function() {
	
	/** @member {object} eventListeners - Events listeners.*/
	this.listeners = {};
};

/**
 * Add an event listener.
 * 
 * @param {string} name - Event name.
 * @param {function} callback - Callback function to add as listener.
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
 * @param {string} name - Event name.
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
 */
JTermEventDispatcher.prototype.removeEventListener = function(name, callback) {
	if(this.listeners[name]) {
		var i;
		var l = this.listeners[name].length;
		for(i=0;i<l;i++) {
			if(this.listeners[name][i] === callback) {
				this.listeners[name].splice(i,1);
				break;
			}				
		}
	}
};