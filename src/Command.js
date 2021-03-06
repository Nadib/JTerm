/**
 * Command constructor.
 * @constructor
 * @classdesc Command object.
 * @param {string} name - Command name.
 * @param {function} callback - The function to call.
 * @param {object} [options] - Options object.
 * @param {boolean} [options.async] - True for asynchronous command.
 * @param {string} [options.summary] - Command short description or lang file identifier.
 * @param {string} [options.help] - Help text or lang file identifier.
 * @param {object} [options.args] - Arguments list.
 * @param {*} [options.args.defaultValue] - Arguments list.
 * @param {JTermValidator[]} [options.args.validators] - Arguments validators.
 * @param {string} [options.args.alias] - Alias for this argument.
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermCommand = function(name, callback, model, options) {
	
	if(!options) {
		options = {};
	}
	/** @property {string} name - Command name.*/
	this.name = name;
	/** @property {function} callback - Command callback function.*/
	this.callback = callback;
	/** @property {JTermModel} model - Model instance.*/
	this.model = model;
	/** @property {object} [options] - Command options.*/
	this.options = options;
	this.cancelBound = this.cancelCallback.bind(this);
	
	this.args = {};
	this.argsOrder = [];
	
	if(this.options.args) {
		for (var prop in this.options.args) {
			this.addArgument(prop, this.options.args[prop]);
		}
	}else{
		var args = this.callback.toString ().replace (/[\r\n\s]+/g, " ").match (/function\s*\w*\s*\((.*?)\)/)[1].split (/\s*,\s*/);
        var i;
        var l = args.length;
        for(i=0;i<l;i++) {
        	if(args[i]){
        		this.addArgument(args[i]);
        	}
        }
	}
};

/**
 * Add an argument.
 * 
 * @param {string} name - Argument name.
 * @param {object} options - Argument options.
 * 
 * @return {JTermArgument}
 */
JTermCommand.prototype.addArgument = function(name, options) {
	
	this.args[name] = new JTermArgument(name, options);
	this.argsOrder.push(name);
	return this.args[name];
	
};

JTermCommand.prototype.getArgument = function(arg) {
	if(isNaN(arg) == false){
		return this.args[this.argsOrder[arg]];
	}else if(typeof arg === "string"){
		return this.args[arg];
	}
	return null;
};



/**
 * Execute the command
 * 
 * @param {array} args - List of arguments.
 * 
 * @return mixed
 */
JTermCommand.prototype.execute = function(args) {
	this.cancel = false;
	this.model.removeEventListener("cancel", this.cancelBound);
	this.model.addEventListener("cancel", this.cancelBound);
	// Validators
	
	if(this.options.async === true) {
		this.callback.apply(this, args);
	} else {
		this.endCommand(this.callback.apply(this, args));
	}
};

/**
 * Ending the command.
 * 
 * @param {string} returnContent - content returned.
 */
JTermCommand.prototype.endCommand=function(content) {
	if(!this.cancel) {
		var event = new JTermEvent("commandComplete", {returnContent:content, command:this});
		this.model.dispatchEvent(event);
	}
};

/**
 * Cancel cllback method.
 * 
 * @param {JTermEvent} e - ShellUI event cancel.
 */
JTermCommand.prototype.cancelCallback = function(e) {
	this.cancel = true;
	var event = new JTermEvent("commandComplete", {returnContent:undefined, command:this});
	this.model.dispatchEvent(event);
};

/**
 * Get the command signature.
 * @return {string}
 */
JTermCommand.prototype.getSignature = function() {
	if(!this.signature) {
		this.signature = this.name;
		var args=this.getArguments();
		var i;
		var l = args.length;
		for(i=0;i<l;i++) {
			this.signature += " ["+args[i]+"]";
		}
	}
	return this.signature;
};

/**
 * Get arguments list.
 */
JTermCommand.prototype.getArguments=function() {
	
	return this.args;
};