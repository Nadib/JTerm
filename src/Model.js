/**
 * Jterm Model
 * 
 * @param {JtermController} controller - Controller instance
 */
/**
 * JTerm model constructor.
 * @constructor
 * @classdesc JTerm Model.
 * @param {JtermController} controller - Controller instance.
 * 
 * @fires JTermModel#commandNotFound
 * @fires JTermModel#argumentError
 * @fires JTermModel#commandStart
 * @fires JTermModel#cancel
 * @fires JTermModel#commandComplete
 * 
 * @extends .JTermEventDispatcher
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermModel = function(controller) {
	
	JTermEventDispatcher.call(this);
	
	/**
	 *  @property {array} history - History of executed commands.
	 */
	this.history = [];

	/** 
	 * @property {object} commands - List of available commands.
	 */
	this.commands = {};
	
};
JTermModel.prototype = Object.create(JTermEventDispatcher.prototype);

/**
 * Add a command executable by the shellUI.
 * 
 * @param {string} name - The command name.
 * @param {function} callback - The callback funcion for the command.
 * @param {Object} [options] - Object of options.
 * 
 * @see JTermController.addCommand
 * @return {ShellUICommand} Command instance
 */
JTermModel.prototype.addCommand = function(name, callback, options) {
	this.commands[name] = new JTermCommand(name, callback, this, options);
	return this.commands[name];
};

/**
 * Execute a command.
 * 
 * @param {string} command - The command as text.
 */
JTermModel.prototype.execute = function(command) {
	if(!command){
		return;
	}
	this.history.push(command);
	var parser = new JTermCommandParser(command);
	var commandInstance = this.getCommand(parser.command);
	if(commandInstance === null) {
		this.dispatchEvent(new JTermEvent("commandNotFound", {command : parser.command}));
	} else {
		
		// Types arguments
		var commandargs = parser.getArguments();
		
		// Validation result
		var validation;
		// Is Valid
		var valid = true;
		// Issues object
		var issues = {};
		var l = commandInstance.argsOrder.length;
		var i;
		var val;
		var arg;
		var newArgs = [];
		for(i = 0;i < l;i++) {
			
			arg = commandInstance.getArgument(commandInstance.argsOrder[i]);			
			val = null;
			for(var opt in parser.opts) {
				console.log(opt);
				console.log(arg.name);
				if(opt === arg.name) {
					val = parser.opts[opt];
					break;
				}
			}
			if(val === null && commandargs[i]) {
				val = commandargs[i];
			}else if(arg.options.defaultValue) {
				val = arg.options.defaultValue;
			}
			validation = arg.validate(val);
			if(validation !== true) {
				valid = false;
				issues[i] = validation;
			}
			newArgs.push(val);	
		}
		if(valid === false) {
			this.dispatchEvent(new JTermEvent("argumentError", {issues : issues, command : commandInstance}));
			return;
		}
		this.dispatchEvent(new JTermEvent("commandStart"));
		commandInstance.execute(newArgs);
	}
};

/**
 * Get a command instance.
 * 
 * @param {string} name - Command name.
 * @return {ShellUICommand|null} The command instance or null if not exists.
 */
JTermModel.prototype.getCommand = function(name) {
	if(this.commands[name]) {
		return this.commands[name];
	}
	return null;
};

/**
 * Retrieve command from history
 * @param {number} index - Command index in history.
 * @return {string}
 */
JTermModel.prototype.getCommandFromHistory = function(index) {
	if(this.history[index]) {
		return this.history[index];
	}
	return null;
	
};