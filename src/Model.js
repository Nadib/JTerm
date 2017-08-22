var JTermModel = function(controller){
	
	
	
	JTermEventDispatcher.call(this);
	
	/** @member {array} history - History of executed commands.*/
	this.history = [];

	this.controller = controller;

	/** @member {object} commands - List of available commands.*/
	this.commands = {};
	
};

JTermModel.prototype = Object.create(JTermEventDispatcher.prototype);

/**
 * Add a command executable by the shellUI.
 * 
 * @param {string} name - The command name.
 * @param {function} callback - The callback funcion for the command.
 * @param {Object} options - Object of options.
 * 
 * @return {ShellUICommand} Command instance
 */
JTermModel.prototype.addCommand = function(name, callback, options) {
	this.commands[name] = new JTermCommand(name, callback, this, options);
	return this.commands[name];
};

/**
 * Execute a command.
 * 
 * @param {string} The command as text.
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
		this.dispatchEvent(new JTermEvent("commandStart"));
		commandInstance.execute(parser.getArguments());
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

JTermModel.prototype.getCommandFromHistory = function(index) {
	if(this.history[index]) {
		return this.history[index];
	}
	return null;
	
};