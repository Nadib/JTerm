/**
 * JTerm Controller.
 * @constructor
 * @classdesc JTerm Controller.
 * @param {JTermView} view - View instance.
 * @param {string|Element} outputElement - The dom id or Element of the shell output element generally a div.
 * @param {object} options - Options object.
 * 
 * Available options :
 *  - helpEnabled {boolean} Define if the help command is enabled, default value 'true'.
 *  - setLangEnabled {boolean} Define if the setLang command is enabled, default value 'true'.
 *  - language {string} Override the detected language, default 'navigator.language'.
 *  - failbackLanguage {string} The failback language, default 'en'.
 *  - basePath {string} The base path, default 'src'.
 * 
 * @extends JTermEventDispatcher
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermController = function(view, options) {
	
	JTermOptions.call(this, options, {
		helpEnabled : true,
		setLangEnabled : true,
		lang : navigator.language.split('-')[0],
		failbackLang : "en"
	});
	
	this.view = view;
	this.model = new JTermModel();

	this.model.addEventListener("commandNotFound", this.commandNotFound.bind(this));
	this.model.addEventListener("commandStart", this.commandStart.bind(this));
	this.model.addEventListener("commandComplete", this.commandComplete.bind(this));	
	
	// Init the shell UI when Dom is ready.
	if( document.readyState === "complete" ) {
		this.init();
	}else{
		document.addEventListener("DOMContentLoaded", this.init.bind(this));
	}
	
};
JTermController.prototype = Object.create(JTermOptions.prototype);

/** @member {Number} Index of the current browsed command history.*/
JTermController.prototype.currentHistory = null;

/** @member {boolean} Prevent paste.*/
JTermController.prototype.preventPaste = false;

/** @member {boolean} True when ctrl key is pressed.*/
JTermController.prototype.controlPressed = false;

JTermController.prototype.commandNotFound = function(e) {	
	this.view.printToOutput(this.getMessage("commandNotFound", null, [e.options.command]));
};

JTermController.prototype.commandStart = function() {
	this.view.getElement("inputStart").style.display = "none";
};

JTermController.prototype.addCommand = function(name, callback, options) {
	return this.model.addCommand(name, callback, options);
};

JTermController.prototype.execute = function(command) {
	return this.model.execute(command);
};

JTermController.prototype.getCommand = function(name) {
	return this.model.getCommand(name);
};

/**
 * Initialize the shellUI after dom ready event.
 */
JTermController.prototype.init = function() {
	this.view.init();
	// Drag Drop events
	document.addEventListener("dragover", this.dragOver.bind(this), false);
	document.addEventListener("drop", this.dropText.bind(this));
	document.addEventListener("paste", this.pasteText.bind(this));

	// Keyboard events
	document.addEventListener("keypress", this.keyboardCallback.bind(this));
	document.addEventListener("keydown", this.keyboardInteraction.bind(this));
	document.addEventListener("keyup", this.keyboardUp.bind(this));
	
	
	// Load langs files
	if(!JTerm.langs[this.options.lang]){
		this.options.lang = this.options.failbackLang;
	}
	
	JTerm.getLang(this.options.lang).load();
	this.loadingLength = 1;
	JTerm.getLang(this.options.lang).addEventListener('langLoaded', this.langLoaded.bind(this));
	
	if(this.options.lang !== this.options.failbackLang){
		JTerm.getLang(this.options.failbackLang).load();
		this.loadingLength = 2;
		JTerm.getLang(this.options.failbackLang).addEventListener('langLoaded', this.langLoaded.bind(this));
	}
	
};

JTermController.prototype.langLoaded = function(e){
	this.loadingLength--;
	if(this.loadingLength == 0){
		this.initCommands();
	}
};

JTermController.prototype.initCommands = function(){
	// Enable help
	if(this.getOption('helpEnabled')){
		this.addCommand(
			"help", 
			this.helpCommand.bind(this),
			{
				args : ['command'],
				summary: "helpSummary"
			}
		);
	}
	
	if(this.getOption('setLangEnabled')){
		this.addCommand(
			"setLang", 
			this.setLangCommand.bind(this), 
			{
				args : ["lang"],
				summary: "setLangSummary"
			}
		);
	}
	
};
/**
 * Help command.
 * 
 * @param {string} command - Command name.
 * @return {string} Help text.
 */
JTermController.prototype.helpCommand = function(command) {
	
	var helpText = "";
	if(!command) {		
		helpText = this.getMessage("commandListTitle")+"\r\n\r\n";
		for (var prop in this.model.commands) {
			helpText += " - "+this.getHelpDetails(this.getCommand(prop), true)+"\r\n";
		}
		helpText += "\r\n "+this.getMessage("commandHelp");
	} else {
		var ci = this.getCommand(command) ;
		if(ci === null){
			helpText += this.getMessage("commandNotFound", null, [command]);
		}else{
			helpText += this.getHelpDetails(ci);	
		}
	}
	return helpText;
};

JTermController.prototype.getHelpDetails = function(command, summary) {
	var helpText = command.getSignature();
	if(command.options.summary) {
		helpText += " "+this.getMessage(command.options.summary);
	}
	if(summary === true) {
		return helpText;
	}
	if(this.options.help) {
		helpText += " \r\n"+this.getMessage(command.options.help);
	}
	return helpText;
};

/**
 * SetLang command.
 * 
 * @param {string} lang - lang code.
 */
JTermController.prototype.setLangCommand = function(lang) {
	var langInstance = JTerm.getLang(lang);
	if(!langInstance){
		return this.getMessage("setLangNotSupported", null, [lang]);
	}else{
		this.options.lang = lang;
		langInstance.addEventListener('langLoaded', function(e){
			this.getCommand("setLang").endCommand(this.getMessage("setLangSuccess", null, [lang]));
		}.bind(this));
		langInstance.load();
	}
};

/**
 * Get message
 * 
 * @param {string} message - The message identifier.
 * @param {string} lang - If set the specific language to get.
 * 
 * @return {string} The message.
 */
JTermController.prototype.getMessage = function(message, lang, args) {		
	if(!lang){
		lang = this.options.lang;
	}
	var msg = JTerm.getLang(lang).get(message, args);
	if(!msg){
		msg = JTerm.getLang(this.options.failbackLang).get(message, args);
	}
	return msg;
};

/**
 * Display a command from the history in the shell input box.
 * 
 * @param {number} index - Index of the command in the history.
 */
JTermController.prototype.repeatCommand = function(index){
	this.currentHistory = index;
	var command = this.model.getCommandFromHistory(index);
	if(command){
		this.view.resetInput();
		this.view.insertChar(command);
	}
};

/**
 * Command complete callback.
 * 
 * @param {CustomEvent} e - Custom commandComplete event.
 */
JTermController.prototype.commandComplete = function(e){
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
JTermController.prototype.selectFromKeyboard = function(direction) {
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
JTermController.prototype.selectCommandFromHistory = function(direction) {
	this.iterateSelector(this.model.history.length, 
		this.currentHistory,
		this.repeatCommand,
		this,
		direction);
};

JTermController.prototype.iterateSelector = function(length, index, func, source, direction) {
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
JTermController.prototype.keyboardCallback = function(e) {
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
			this.execute(cmd);
			this.view.shellScrollToBottom();
			this.currentHistory=null;
			break;
		default:
			if(this.preventPaste === false) {
				var character = this.decodeKeyChar(e);
				// CTRL+C Command cancel
				if(this.controlPressed === true && (character === 'c' || e.keyCode === 3)) {
					this.view.resetInput();
					this.model.dispatchEvent(new JTermEvent("cancel", {}));
					return;
		    	}
		    	this.view.insertChar(character);
		}
	}
};

JTermController.prototype.decodeKeyChar = function(e){
	if(!e.key) {
		var dec = String.fromCharCode(e.keyCode);
		if(!e.shiftKey) {
			dec = dec.toLowerCase();
		}
		return dec;
	}
	return e.key;
};
	
/**
 * KeyboardUp callback
 * 
 * @param {KeyboardEvent} e - KeyboardEvent.
 */
JTermController.prototype.keyboardUp = function(e) {
	this.keyBoardShortcut(e, false);
};

JTermController.prototype.keyBoardShortcut = function(e, val) {
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
JTermController.prototype.keyboardInteraction = function(e) {

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

JTermController.prototype.dragOver = function(e) {
	e.preventDefault();
};

/**
 * Drop callback.
 * 
 * @param {DragEvent} e - Drop event.
 */
JTermController.prototype.dropText = function(e) {
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
JTermController.prototype.pasteText = function(e) {
	this.view.insertChar(e.clipboardData.getData("text"));
};