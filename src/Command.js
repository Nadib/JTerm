/**
 * Shell UI command.
 * @constructor
 * @classdesc Shell UI command.
 * @param {string} name - Command name.
 * @param {function} callback - The function to call.
 * @param {object} options - Options object.
 * 
 * List of available options :
 * 	async {boolean} true if the command is asynchronous.
 *  summary {string} short description.
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermCommand = function(name, callback, model, options) {
	
	if(!options) {
		options = {};
	}
	/** @member {string} Command name.*/
	this.name = name;
	/** @member {function} Command callback function.*/
	this.callback = callback;
	/** @member {ShellUI} Shell instance.*/
	this.model = model;
	/** @member {object} Command options.*/
	this.options = options;
	this.cancelBound = this.cancelCallback.bind(this);
};

/**
 * Execute the command
 * 
 * @param {array} arguments - List of arguments.
 * 
 * @return mixed
 */
JTermCommand.prototype.execute = function(args) {
	this.cancel = false;
	this.model.removeEventListener("cancel", this.cancelBound);
	this.model.addEventListener("cancel", this.cancelBound);
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
 * Get Help
 * 
 * @param {boolean} summary - If true return only a short summary.
 * 
 * @return {string} The help text.
 */
JTermCommand.prototype.getHelp = function(summary) {
	var helpText = this.getSignature();
	if(this.options.summary) {
		helpText += " "+this.options.summary;
	}
	if(summary === true) {
		return helpText;
	}
	if(this.options.help) {
		helpText += " \r\n"+this.options.help;
	}
	return helpText;
};

/**
 * Get arguments list.
 */
JTermCommand.prototype.getArguments=function() {
	if(!this.arguments) {
		this.arguments = [];
		var args = this.callback.toString ().replace (/[\r\n\s]+/g, " ").match (/function\s*\w*\s*\((.*?)\)/)[1].split (/\s*,\s*/);
        var i;
        var l = args.length;
        for(i=0;i<l;i++) {
        	this.arguments.push(args[i]);
        }
	}
	return this.arguments;
};