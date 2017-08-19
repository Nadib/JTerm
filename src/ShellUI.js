/**
 * Shell UI object constructor.
 * @constructor
 * @classdesc Shell UI class.
 * @param {string|Element} inputElement - The dom id or Element of the input element generally a span.
 * @param {string|Element} outputElement - The dom id or Element of the shell output element generally a div.
 * @param {object} options - Options object.
 * 
 * Available options :
 * 	- prefix {string} Prefix for the shell input, default value '$'.
 *  - highlightColor {string} Highlight color, default value '#a5a5a5'.
 *  - helpEnabled {boolean} Define if the help command is enabled, default value 'true'.
 *  - language {string} Override the detected language, default 'navigator.language'.
 *  - failbackLanguage {string} The failback language, default 'en'.
 *  - basePath {string} The base path, default 'src'.
 * 
 * Supported events :
 *  - commandComplete Fired when a command is completed.
 *  - cancel Fired when a command was cancelled
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
"use strict";
var ShellUI = function(inputElement, outputElement, options) {
	
	/** @member {Object} options - ShellUI options.*/
	this.options = Object.assign( {
		prefix : "$",
		highlightColor : "#a5a5a5",
		helpEnabled : true,
		language : navigator.language,
		failbackLanguage : "en",
		basePath : "src"
	}, options);

	/** @member {Element} inputElement - Dom element used as input, generally a span element. */
	this.inputElement = inputElement;

	/** @member {Element} outputElement - Dom element used as shell output container.*/
	this.outputElement = outputElement;

	/** @member {array} commandHistory - History of executed commands.*/
	this.commandHistory = [];

	/** @member {object} commands - List of available commands.*/
	this.commands = {};

	/** @member {object} eventListeners - Events listeners.*/
	this.eventListeners = {};
	
	// Init the shell UI when Dom is ready.
	if( document.readyState === "complete" ) {
		this.init();
	}else{
		document.addEventListener("DOMContentLoaded", this.init.bind(this));
	}
	// Enable help
	if(this.options.helpEnabled === true){
		this.addCommand("help", this.helpCommand.bind(this));
	}
};

var ShellUILanguage = {};

/** @member {Number} Index of the current selected character.*/
ShellUI.prototype.keyboardSelected = null;

/** @member {Number} Index of the current browsed command history.*/
ShellUI.prototype.currentHistory = null;

/** @member {boolean} Prevent paste.*/
ShellUI.prototype.preventPaste = false;

/** @member {boolean} True when ctrl key is pressed.*/
ShellUI.prototype.controlPressed = false;

/**
 * Initialize the shellUI after dom ready event.
 */
ShellUI.prototype.init = function() {
	// Input Element
	if (typeof this.inputElement === "string") {
		this.inputElement = document.getElementById(this.inputElement);
	}
	this.inputElement.style["white-space"] = "pre";
		
	// Output element
	if (typeof this.outputElement === "string") {
		this.outputElement = document.getElementById(this.outputElement);
	}
	this.outputElement.style["white-space"] = "pre";
		
	// endline Element
	this.endlineElement = this.createElement("span", " ");
	this.endlineElement.style["background-color"] = this.options.highlightColor;
	this.endlineElement.style["white-space"] = "pre";
	this.endlineElement.style["padding-left"] = "3px";
	this.inputElement.parentElement.insertBefore(this.endlineElement, this.inputElement.nextSibling);
	
	// Prefix Element
	this.prefixElement = this.createElement("span", this.options.prefix+" ");
	this.inputElement.parentElement.insertBefore(this.prefixElement, this.inputElement);
	
	// Drag Drop events
	document.addEventListener("dragover", this.dragOver.bind(this), false);
 	document.addEventListener("drop", this.dropText.bind(this));
	document.addEventListener("paste", this.pasteText.bind(this));

	// Keyboard events
	document.addEventListener("keypress", this.keyboardCallback.bind(this));
	document.addEventListener("keydown", this.keyboardInteraction.bind(this));
	document.addEventListener("keyup", this.keyboardUp.bind(this));
		
	// Internal events
	this.addEventListener("commandComplete", this.commandComplete.bind(this));
		
	// Load language files
	this.loadDependancy(this.options.basePath+"/languages/"+this.options.language+".js");
	if(this.options.language !== this.options.failbackLanguage){
		this.loadDependancy(this.options.basePath+"/languages/"+this.options.failbackLanguage+".js");
	}
};

/**
 * Load dependency file at execution.
 * 
 * @param {string} file - JS file to load.
 */
ShellUI.prototype.loadDependancy = function(file) {
	var script = document.createElement("script");
	script.src = file;
	document.body.appendChild(script);
};

/**
 * Help command.
 * 
 * @param {string} command - Command name.
 * @return {string} Help text.
 */
ShellUI.prototype.helpCommand = function(command) {
	var helpText = "";
	if(command === undefined){
		helpText = this.getMessage("commandListTitle")+"\r\n\r\n";
		for (var prop in this.commands) {
			if(prop !== "help"){					
				helpText += " - "+this.commands[prop].getHelp(true)+"\r\n";
			}
		}
		helpText += "\r\n "+this.getMessage("commandHelp");
	}else if(command){
		if(this.getCommand(command) === null){
			helpText += this.getMessage("commandNotFound").printf(command);
		}else{
			helpText += this.commands[command].getHelp();	
		}		
	}
	return helpText;
};

/**
 * Get message
 * 
 * @param {string} message - The message identifier.
 * @param {string} language - If set the specific language to get.
 * 
 * @return {string} The message.
 */
ShellUI.prototype.getMessage = function(message, language) {		
	if(language === undefined){
		language = this.options.language;
	}
	if(ShellUILanguage[language][message]){
		return ShellUILanguage[language][message];
	}
	if(ShellUILanguage[this.options.failbackLanguage][message]){
		return ShellUILanguage[this.options.failbackLanguage][message];
	}	
	return undefined;
};

/**
 * Add a command executable by the shellUI.
 * 
 * @param {string} name - The command name.
 * @param {function} callback - The callback funcion for the command.
 * @param {Object} options - Object of options.
 */
ShellUI.prototype.addCommand = function(name, callback, options) {
	this.commands[name] = new ShellUICommand(name, callback, options, this);
};

/**
 * Get a comand instance.
 * 
 * @param {string} name - Command name.
 * @return {ShellUICommand|null} The command instance or null if not exists.
 */
ShellUI.prototype.getCommand = function(name){
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
ShellUI.prototype.executeCommand = function(command){
	var parser = new ShellUICommandParser(command);
	var commandInstance = this.getCommand(parser.command);
	if(commandInstance === null){
	 	this.printOutput(this.getMessage("commandNotFound").printf(parser.command));
	}else{
		this.prefixElement.style.display = "none";
		commandInstance.execute(parser.getArguments());
	}
};

/**
 * Display a command from the history in the shell input box.
 * 
 * @param {number} index - Index of the command in the history.
 */
ShellUI.prototype.repeatCommand = function(index){
	this.currentHistory = index;
	if(this.commandHistory[this.currentHistory]){
		this.resetInput();
		var i;
		var l = this.commandHistory[this.currentHistory].length;
		for(i=0;i<l;i++){				
			this.inputElement.appendChild(this.createElement("span", this.commandHistory[this.currentHistory][i]));
		}
	}
};

/**
 * Command complete callback.
 * 
 * @param {CustomEvent} e - Custom commandComplete event.
 */
ShellUI.prototype.commandComplete = function(e){
	if(e.options.returnContent){
		this.printOutput(e.options.returnContent);
	}
	this.resetInput();
	this.prefixElement.style.display = "inline";
};

/**
 * Remove event listener.
 * 
 * @param {string} name - Event name.
 * @param {function} callback - Callback function to remove from listeners.
 */
ShellUI.prototype.removeEventListener = function(name, callback){
	if(this.eventListeners[name]){
		var i;
		var l = this.eventListeners[name].length;
		for(i=0;i<l;i++){
			if(this.eventListeners[name][i] === callback){
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
ShellUI.prototype.addEventListener = function(name, callback){
	if(!this.eventListeners[name]){
		this.eventListeners[name] = [];
	}
	this.eventListeners[name].push(callback);
};
	
/**
 * Fire an event.
 * 
 * @param {string} name - Event name.
 */
ShellUI.prototype.dispatchEvent = function(event){
	if(this.eventListeners[event.name]){
		event.target = this;
		var i;
		var l = this.eventListeners[event.name].length;
		for(i=0;i<l;i++){
			this.eventListeners[event.name][i].apply(this, [event]);
		}
	}
};

/**
 * Empty the shell input.
 */
ShellUI.prototype.resetInput = function(){
	this.selectChar(null);
	while (this.inputElement.firstChild) {
       	this.inputElement.removeChild(this.inputElement.firstChild);
   	}
};

/**
 * Print to output container.
 * 
 * @param {string} text - The text to print in the output container
 */
ShellUI.prototype.printOutput = function(text){
	this.outputElement.appendChild(this.createElement("p", text));
};
	
/**
 * Remove a char form the shell input box.
 * 
 * @param {number} index - Index of the character to remove from the input box.
 */
ShellUI.prototype.removeChar = function (index){
	if(index === -1){
		index = this.inputElement.children.length-1;
	}
	if(this.inputElement.children[index]){  			
		this.inputElement.removeChild(this.inputElement.children[index]);
	}
};
	
/**
 * Select a character from the shell input box.
 * 
 * @param {number} index - Index of the character to select in the shell input box.
 */
ShellUI.prototype.selectChar = function(index) {
	if(this.keyboardSelected !== null && this.inputElement.children[this.keyboardSelected]) {
		this.inputElement.children[this.keyboardSelected].style["background-color"] = "transparent";
	}
	this.keyboardSelected = index;
	if(this.keyboardSelected !== null && this.inputElement.children[this.keyboardSelected]) {			
		this.endlineElement.style.display = "none";			
		this.inputElement.children[this.keyboardSelected].style["background-color"] = this.options.highlightColor;
	} else {
		this.endlineElement.style.display = "inline";
	}
};
	
/**
 * Detect the next character to select in the shell input box from left and right keyboard arrows.
 * 
 * @param {string} direction - Direction of the selection 'left' or 'right'.
 */
ShellUI.prototype.selectFromKeyboard = function(direction) {
	this.iterateSelector(this.inputElement.children.length, 
		this.keyboardSelected,
		this.selectChar,
		direction);
};

/**
 * Detect the next command to get from history with top and bottom arrow.
 * 
 * @param {string} direction - Direction of the history selection 'top' or 'bottom'.
 */
ShellUI.prototype.selectCommandFromHistory = function(direction) {
	this.iterateSelector(this.commandHistory.length, 
		this.currentHistory,
		this.repeatCommand,
		direction);
};

ShellUI.prototype.iterateSelector = function(length, index, func, direction) {
	if(length > 0) {
		if(direction === "left" || direction === "top" ) {
			if(index === null) {
				func.apply(this, [(length-1)]);
			} else if(index > 0) {
				func.apply(this, [(index-1)]);
			}
		} else if(direction === "right" || direction === "bottom"){
			if(index !== null && index < length-1) {
				func.apply(this, [(index+1)]);
			}else{
				func.apply(this, [null]);				
			}
		}
	}
};

/**
 * Callback for keyboardEvent when the user type something.
 * 
 * @param {KeyboardEvent} e - The dispatched keyboard event.
 */
ShellUI.prototype.keyboardCallback = function(e) {
	switch (e.keyCode) {
    	case 8:
       	case 37:
       	case 39:
       	case 38:
       	case 40:
       		break;
       	case 13:
       		// Enter -> Command execution
       		var cmd = this.inputElement.textContent;
			this.printOutput(this.prefixElement.textContent+cmd);
			this.resetInput();
			if(cmd) {
				this.commandHistory.push(cmd);
				this.executeCommand(cmd);
			}
			this.outputElement.parentNode.scrollTop = this.outputElement.parentNode.scrollHeight;
			this.currentHistory=null;
        	break;
		default:
			if(!e.key) {
	    		var dec = String.fromCharCode(e.keyCode);
				if(!e.shiftKey) {
					dec = dec.toLowerCase();
				}
				e.key = dec;
		    }		    	
		    if(this.preventPaste === false) {
		    	// CTRL+C Command cancel
		    	if(this.controlPressed === true && (e.key === 'c' || e.keyCode === 3)) {
		    		this.resetInput();
		    		var ev = new ShellUIEvent("cancel", {});
					this.dispatchEvent(ev);		    			
		    		return;
		    	}
		    	// Normal text typing
		    	if(this.keyboardSelected !== null) {						
					this.inputElement.insertBefore(this.createElement("span", e.key), this.inputElement.children[this.keyboardSelected]);
					this.selectChar(this.keyboardSelected+1);					  
				} else {
					this.inputElement.append(this.createElement("span", e.key));
				}
		}
	}
};
	
/**
 * KeyboardUp callback
 * 
 * @param {KeyboardEvent} e - KeyboardEvent.
 */
ShellUI.prototype.keyboardUp = function(e) {
	// Press "control"
	if(e.keyIdentifier === "Control" || e.key === "Control") {
		this.controlPressed = false;
		return;
	}
	// Meta Press
	if(e.keyIdentifier === "Meta" || e.key === "Meta") {
		this.preventPaste = false;
		return;
	}
};
	
/**
 * Callback for special keyboard actions : 'delete', 'left', 'right', 'top', 'bottom'.
 * 
 * @param {KeyboardEvent} e - The dispatched keyboard event.
 */
ShellUI.prototype.keyboardInteraction = function(e) {
	if(e.keyIdentifier === "Meta" || e.key === "Meta") {
		this.preventPaste = true;
		return;
	}
	if(e.keyIdentifier === "Control" || e.key === "Control") {
		this.controlPressed = true;
		return;
	}
	switch (e.keyCode) {
		case 8:
        	if(this.keyboardSelected !== null) {
				if(this.keyboardSelected > 0) {
					this.removeChar(this.keyboardSelected-1);			
					this.selectChar(this.keyboardSelected-1);
				}
			} else {
				this.removeChar(-1);
			}
       		break;        	
       	case 37:
       		this.selectFromKeyboard("left");
       		break;
       	case 39:
       		this.selectFromKeyboard("right");
       		break;
       	case 38:
       		this.selectCommandFromHistory("top");
       		break;
       	case 40:
       		this.selectCommandFromHistory("bottom");
       		break;
	    default:
	}
};

ShellUI.prototype.dragOver = function(e) {
	e.preventDefault();
};

/**
 * Drop callback.
 * 
 * @param {DragEvent} e - Drop event.
 */
ShellUI.prototype.dropText = function(e) {
	e.preventDefault();
	var vl = '';
	var l = e.dataTransfer.files.length;
	if(l > 0) {
		var i;
		for(i=0;i<l;i++) {
			if(i>0) {
				vl += ' ';
			}
			vl += e.dataTransfer.files[i].name;
		}
	} else {
		vl = e.dataTransfer.getData('text');
	}
	this.pasteText(vl);
};
	
/**
 * Javascript paste event callback
 * 
 * @param {ClipboardEvent|string} e - The clipboard event or a string.
 */
ShellUI.prototype.pasteText = function(e) {
	var tx = "";
	if (typeof e === "string") {
		tx = e;
	} else {
		tx = e.clipboardData.getData("text");
	}
	var ptx = this.inputElement.textContent;
	var ptp = '';
	var i;
	var txl = tx.length;
	for(i=0;i<txl;i++) {
		ptp += "<span>"+tx[i]+"</span>";
	}
	if(this.keyboardSelected !== null) {	
		var newContent = '';
		var l = ptx.length;
		for(i=0;i<l;i++) {
			if(i === this.keyboardSelected) {
				newContent += ptp;
			}
			newContent += "<span>"+ptx[i]+"</span>";
		}
		this.inputElement.innerHTML = newContent;
		this.keyboardSelected = this.keyboardSelected+textData.length;	  
	}else{
		this.inputElement.innerHTML += ptp;
	}
};

/**
 * Helper function to create an element.
 * 
 * @param {string} type - The type of the element to create eg: 'span'.
 * @param {string} text - The text to insert in a text node.
 * @return {Element} The created dom element.
 */
ShellUI.prototype.createElement = function(type, text){
	var ne = document.createElement(type);
	var tn = document.createTextNode(text);
	ne.appendChild(tn);
	return ne;
};

String.prototype.printf = function () {
	var args = arguments;
  	var i=0;
  	return this.replace(/(%s)/g, function () {
    return args[i++];
  });
};