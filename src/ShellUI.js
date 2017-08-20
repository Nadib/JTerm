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
var ShellUI = function(view, options) {
	
	ShuellUIEventDispatcher.call(this);
	/** @member {Object} options - ShellUI options.*/
	this.options = Object.assign( {
		helpEnabled : true,
		language : navigator.language.split('-')[0],
		failbackLanguage : "en",
		basePath : "src"
	}, options);
	
	this.view = view;
	this.model = new ShellUIModel();
	this.model.addEventListener('commandNotFound', this.commandNotFound.bind(this));
	this.model.addEventListener('commandStart', this.commandStart.bind(this));
	this.model.addEventListener("commandComplete", this.commandComplete.bind(this));	
	
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

// ShellUI extends ShellUIEventDispatcher
ShellUI.prototype = Object.create(ShuellUIEventDispatcher.prototype);

/** @member {Number} Index of the current browsed command history.*/
ShellUI.prototype.currentHistory = null;

/** @member {boolean} Prevent paste.*/
ShellUI.prototype.preventPaste = false;

/** @member {boolean} True when ctrl key is pressed.*/
ShellUI.prototype.controlPressed = false;

ShellUI.prototype.commandNotFound = function(e) {
	this.view.printToOutput(new ShellUIMessage(this, "commandNotFound").printf(e.options.command));
};

ShellUI.prototype.commandStart = function() {
	this.view.getElement("inputStart").style.display = "none";
};

ShellUI.prototype.addCommand = function(name, callback, options) {
	return this.model.addCommand(name, callback, options);
};

ShellUI.prototype.executeCommand = function(command){
	return this.model.executeCommand(command);
}

/**
 * Initialize the shellUI after dom ready event.
 */
ShellUI.prototype.init = function() {
	this.view.init();
	// Drag Drop events
	document.addEventListener("dragover", this.dragOver.bind(this), false);
	document.addEventListener("drop", this.dropText.bind(this));
	document.addEventListener("paste", this.pasteText.bind(this));

	// Keyboard events
	document.addEventListener("keypress", this.keyboardCallback.bind(this));
	document.addEventListener("keydown", this.keyboardInteraction.bind(this));
	document.addEventListener("keyup", this.keyboardUp.bind(this));
		
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
		for (var prop in this.model.commands) {
			if(prop !== "help"){					
				helpText += " - "+this.model.commands[prop].getHelp(true)+"\r\n";
			}
		}
		helpText += "\r\n "+this.getMessage("commandHelp");
	}else if(command){
		if(this.getCommand(command) === null){
			var message = new ShellUIMessage(this, "commandNotFound");
			helpText += message.printf(command);
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
	if(!language){
		language = this.options.language;
	}
	if(ShellUILanguage[language][message]){
		return ShellUILanguage[language][message];
	}
	if(ShellUILanguage[this.options.failbackLanguage][message]){
		return ShellUILanguage[this.options.failbackLanguage][message];
	}	
	return null;
};

/**
 * Display a command from the history in the shell input box.
 * 
 * @param {number} index - Index of the command in the history.
 */
ShellUI.prototype.repeatCommand = function(index){
	this.currentHistory = index;
	var command = this.model.getCommandFromHistory(index);
	if(command){
		this.view.resetInput();
		var i;
		var l = command.length;
		for(i=0;i<l;i++){
			this.view.getElement("shellInput").appendChild(this.view.createElement("span", command[i]));
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
		this.view.printToOutput(e.options.returnContent);
	}
	this.view.resetInput();
	this.view.getElement('inputStart').style.display = "inline";
};
	
/**
 * Detect the next character to select in the shell input box from left and right keyboard arrows.
 * 
 * @param {string} direction - Direction of the selection 'left' or 'right'.
 */
ShellUI.prototype.selectFromKeyboard = function(direction) {
	this.iterateSelector(this.view.getElement('shellInput').children.length, 
		this.view.selectedChar,
		this.view.selectChar,
		this.view,
		direction);
};

/**
 * Detect the next command to get from history with top and bottom arrow.
 * 
 * @param {string} direction - Direction of the history selection 'top' or 'bottom'.
 */
ShellUI.prototype.selectCommandFromHistory = function(direction) {
	this.iterateSelector(this.model.commandHistory.length, 
		this.currentHistory,
		this.repeatCommand,
		this,
		direction);
};

ShellUI.prototype.iterateSelector = function(length, index, func, source, direction) {
	if(length > 0) {
		if(direction === "left" || direction === "top" ) {
			if(index === null) {
				func.apply(source, [(length-1)]);
			} else if(index > 0) {
				func.apply(source, [(index-1)]);
			}
		} else if(direction === "right" || direction === "bottom"){
			if(index !== null && index < length-1) {
				func.apply(source, [(index+1)]);
			}else{
				func.apply(source, [null]);				
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
			var cmd = this.view.getElement("shellInput").textContent;
			this.view.printToOutput(this.view.getElement("inputStart").textContent+cmd);
			this.view.resetInput();
			if(cmd) {
				this.executeCommand(cmd);
			}
			this.view.shellScrollToBottom();
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
					this.view.resetInput();
					var ev = new ShellUIEvent("cancel", {});
					this.dispatchEvent(ev);
					return;
		    	}
		    	this.view.insertChar(e.key);
		}
	}
};
	
/**
 * KeyboardUp callback
 * 
 * @param {KeyboardEvent} e - KeyboardEvent.
 */
ShellUI.prototype.keyboardUp = function(e) {
	this.keyBoardShortcut(e, false);
};

ShellUI.prototype.keyBoardShortcut = function(e, val) {
	var identifier = e.keyIdentifier || e.key;
	if(identifier === "Control") {
		this.controlPressed = val;
	}else if(identifier === "Meta") {
		this.preventPaste = val;
	}
};
	
/**
 * Callback for special keyboard actions : 'delete', 'left', 'right', 'top', 'bottom'.
 * 
 * @param {KeyboardEvent} e - The dispatched keyboard event.
 */
ShellUI.prototype.keyboardInteraction = function(e) {
	
	this.keyBoardShortcut(e, true);
	switch (e.keyCode) {
		case 8:
			this.view.removeChar();
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
				vl += " ";
			}
			vl += e.dataTransfer.files[i].name;
		}
	} else {
		vl = e.dataTransfer.getData('text');
	}
	this.view.insertChar(vl);
};
	
/**
 * Javascript paste event callback
 * 
 * @param {ClipboardEvent|string} e - The clipboard event or a string.
 */
ShellUI.prototype.pasteText = function(e) {
	this.view.insertChar(e.clipboardData.getData("text"));
};