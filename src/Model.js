var ShellUIModel = function(){
	
	ShuellUIEventDispatcher.call(this);
	
	/** @member {array} commandHistory - History of executed commands.*/
	this.commandHistory = [];

	/** @member {object} commands - List of available commands.*/
	this.commands = {};
	
};

// ShellUI extends ShellUIEventDispatcher
ShellUIModel.prototype = Object.create(ShuellUIEventDispatcher.prototype);

/**
 * Add a command executable by the shellUI.
 * 
 * @param {string} name - The command name.
 * @param {function} callback - The callback funcion for the command.
 * @param {Object} options - Object of options.
 * 
 * @return {ShellUICommand} Command instance
 */
ShellUIModel.prototype.addCommand = function(name, callback, options) {
	this.commands[name] = new ShellUICommand(name, callback, options, this);
	return this.commands[name];
};

ShellUIModel.prototype.getCommandFromHistory = function(index) {
	if(this.commandHistory[index]){
		return this.commandHistory[index];
	}
	return null;
	
};


/**
 * Get a command instance.
 * 
 * @param {string} name - Command name.
 * @return {ShellUICommand|null} The command instance or null if not exists.
 */
ShellUIModel.prototype.getCommand = function(name){
	if(this.commands[name]){
		return this.commands[name];
	}
	return null;
};

/**
 * Execute a command.
 * 
 * @param {string} The command as text.
 */
ShellUIModel.prototype.executeCommand = function(command){
	
	this.commandHistory.push(command);
	var parser = new ShellUICommandParser(command);
	var commandInstance = this.getCommand(parser.command);
	if(commandInstance === null){
		this.dispatchEvent(new ShellUIEvent('commandNotFound', {command : parser.command}));
	}else{
		this.dispatchEvent(new ShellUIEvent('commandStart'));		
		commandInstance.execute(parser.getArguments());
	}
};