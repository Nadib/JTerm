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
"use strict";
var ShellUICommand = function(name, callback, options, shell) {
	
	if(options === undefined){
		options = {};
	}
	/** @member {string} Command name.*/
	this.name = name;
	/** @member {function} Command callback function.*/
	this.callback = callback;
	/** @member {ShellUI} Shell instance.*/
	this.shell = shell;
	/** @member {object} Command options.*/
	this.options = options;
	this.cancelBound = this.cancelCallback.bind(this);
};

/** @member {boolean} True when the command is cancelling.*/
ShellUICommand.prototype.cancel = false;

/**
 * Execute the command
 * 
 * @param {array} arguments - List of arguments.
 * 
 * @return mixed
 */
ShellUICommand.prototype.execute = function(args) {
	this.cancel = false;
	this.shell.removeEventListener('cancel', this.cancelBound);
	this.shell.addEventListener('cancel', this.cancelBound);
	if(this.options.async === true){
		this.callback.apply(this, args);
	}else{
		this.endCommand(this.callback.apply(this, args));
	}
};

/**
 * Ending the command.
 * 
 * @param {string} returnContent - content returned.
 */
ShellUICommand.prototype.endCommand=function(returnContent){
	if(this.cancel === false){
		var event = new ShellUIEvent('commandComplete', {returnContent:returnContent, command:this});
		this.shell.dispatchEvent(event);
	}
};

/**
 * Cancel cllback method.
 * 
 * @param {ShellUIEvent} e - ShellUI event cancel.
 */
ShellUICommand.prototype.cancelCallback = function(e){
	this.cancel = true;
	var event = new ShellUIEvent('commandComplete', {returnContent:undefined, command:this});
	this.shell.dispatchEvent(event);
};

/**
 * Get the command signature.
 * @return {string}
 */
ShellUICommand.prototype.getSignature = function(){
	if(!this.signature){
		this.signature = this.name;
		var args=this.getArguments();
		var i;
		var l = args.length;
        for(i=0;i<l;i++){
   	    	this.signature += ' ['+args[i]+']';
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
ShellUICommand.prototype.getHelp = function(summary){
	var helpText = this.getSignature();
	if(this.options.summary){
		helpText += ' '+this.options.summary;
	}
	if(summary === true){
		return helpText;
	}
	if(this.options.help){
		helpText += " \r\n"+this.options.help;
	}
	return helpText;
};

/**
 * Get arguments list.
 */
ShellUICommand.prototype.getArguments=function(){
	if(!this.arguments){
		this.arguments = [];
		var args = this.callback.toString ().replace (/[\r\n\s]+/g, ' ').match (/function\s*\w*\s*\((.*?)\)/)[1].split (/\s*,\s*/);
        var i;
        var l = args.length;
        for(i=0;i<l;i++){
        	this.arguments.push(' ['+args[i]+']');
        }
	}
	return this.arguments;
};

/**
 * Command parser
 * 
 * @param {string} command Command as string
 */
var ShellUICommandParser = function(command){
	var cd = command.match(/'[^']*'|"[^"]*"|\S+/g) || [];
	this.command = cd[0];
	this.arguments=[];
	var i=1;
	var l = cd.length;
	for(i=1;i<l;i++){
		if(cd[i][0] === '"' && cd[i][(cd[i].length-1)] === '"'){
			cd[i] = cd[i].substr(1);
			cd[i] = cd[i].substr( 0, cd[i].length-1);
		}else if(cd[i][0] === "'" && cd[i][(cd[i].length-1)] === "'"){
			cd[i] = cd[i].substr(1);
			cd[i] = cd[i].substr( 0, cd[i].length-1);
		}
		this.arguments.push(cd[i]);
	}
};

/**
 * Get parsed arcguments.
 * @return {Array}
 */
ShellUICommandParser.prototype.getArguments = function(){
	return this.arguments;
};