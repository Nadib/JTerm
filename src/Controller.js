/**
 * Terminal controller constructor.
 * 
 * 
 * @classdesc Terminal main controller.
 * 
 * @constructor
 * @param {JTermView} view - View instance.
 * @param {object} [options=null] - Options object.
 * @param {boolean} [options.helpEnabled=true] - Make help command available.
 * @param {boolean} [options.setLangEnabled=true] - Define if the setLang command is enabled, default value 'true'.
 * @param {string} [options.lang=Detected client language "navigator.language"] - Set the lang.
 * @param {string} [options.failbackLang=en] - Failback language.
 * 
 * @extends JTermOptions
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
	
	/** 
 	 * @property {JTermView} view - View instance.
 	 */
	this.view = view;
	
	/** 
 	 * @property {JTermModel} model - Model instance.
 	 */
	this.model = new JTermModel();
	
	this.model.addEventListener("commandNotFound", this.commandNotFound.bind(this));
	this.model.addEventListener("argumentError", this.argumentError.bind(this));
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

/** 
 * @property {number} currentHistory - Index of the current browsed command history.
 * @access private
 */
JTermController.prototype.currentHistory = null;

/**
 * @property {boolean} preventPaste - Prevent paste.
 * @access private
 */
JTermController.prototype.preventPaste = false;

/** 
 * @member {boolean} controlPressed - True when ctrl key is pressed.
 * @access private
 */
JTermController.prototype.controlPressed = false;

/**
 * Add a terminal command.
 * 
 * @example <caption>Add a Hello World command</caption>
 * controller.addCommand("hello",function(){return "Hello world...";});
 * 
 * @example <caption>Add a command with argument and validators</caption>
 * controller.addCommand(
 *    "helloSomebody",
 *    function(name) { return "You said hello to "+name },
 *    {
 * 	     args : { 
 *          name : { validators : [new JTermValidatorType("string"), new JTermValidatorRequired()]}
 *       }
 *    }
 * );
 * 
 * @example <caption>Add async command with 2 arguments, default value and help.</caption>
 * controller.addCommand(
 *    "asyncHello",
 *    function(name, duration){
 *       setTimeout(function(){
 *          this.endCommand("You said hello asynchronously to "+name+" during "+duration+"ms");
 *       }.bind(this), duration);
 *    },
 *    {
 *       async : true,
 *       args : {
 *          name : {
 * 	           validators : [new JTermValidatorType("string"), new JTermValidatorRequired()]
 *          },
 *          duration : {
 * 	           defaultValue : 3000, 
 *             validators : [new JTermValidatorType("string")]
 *          }
 *       }
 *       summary : 'Async hello command.',
 *       help : 'Long Help text'
 *    }
 * );
 * 
 * @param {string} name - Command name.
 * @param {function} callback - Command callback function.
 * @param {object} [options] - Command options.
 * @param {boolean} [options.async] - True for asynchronous command.
 * @param {string} [options.summary] - Command short description or lang file identifier.
 * @param {string} [options.help] - Help text or lang file identifier.
 * @param {object} [options.args] - Arguments list.
 * @param {*} [options.args.defaultValue] - Arguments list.
 * @param {JTermValidator[]} [options.args.validators] - Arguments validators.
 * @param {string} [options.args.alias] - Alias for this argument.
 * 
 * @returns {JTermCommand} Command instance
 * 
 * @see JTermModel.addCommand
 */
JTermController.prototype.addCommand = function(name, callback, options) {
	return this.model.addCommand(name, callback, options);
};

/**
 * Execute a command.
 * 
 * @param {string} command - Command as string.
 * @returns {[string]} The commad output if is available.
 */
JTermController.prototype.execute = function(command) {
	return this.model.execute(command);
};

/**
 * Get a command object.
 * 
 * @param {string} name - Command name.
 * @returns {JTermCommand} Command instance or null.
 */
JTermController.prototype.getCommand = function(name) {
	return this.model.getCommand(name);
};


/**
 * Insert text into command input.
 * 
 * @param {string} text - Text to insert into command input.
 */
JTermController.prototype.insertText = function(text) {
	this.view.insertChar(text);
};

/**
 * Get message
 * 
 * @param {string} message - The message identifier.
 * @param {string} [lang] - If set the specific language to get.
 * @param {array} [args] - Variable to replace into lang definition.
 * 
 * @returns {string} The message.
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
 * Initialize the shellUI after dom ready event.
 * @access private
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
	if(!JTerm.langs[this.options.lang]) {
		this.options.lang = this.options.failbackLang;
	}
	JTerm.getLang(this.options.lang).load();
	this.loadingLength = 1;
	JTerm.getLang(this.options.lang).addEventListener('langLoaded', this.langLoaded.bind(this));
	
	if(this.options.lang !== this.options.failbackLang) {
		JTerm.getLang(this.options.failbackLang).load();
		this.loadingLength = 2;
		JTerm.getLang(this.options.failbackLang).addEventListener('langLoaded', this.langLoaded.bind(this));
	}
	
};

/**
 * Langs loaded callback
 * @param {JtermEvent} e - Event object.
 * @access private
 */
JTermController.prototype.langLoaded = function(e) {
	this.loadingLength--;
	if(this.loadingLength == 0){
		this.initCommands();
	}
};

/**
 * Init prepackaged commands
 * @access private
 */
JTermController.prototype.initCommands = function(){
	// Enable help
	if(this.getOption('helpEnabled')){
		this.addCommand(
			"help", 
			this.helpCommand.bind(this),
			{
				args : { "command": {
						validators : [new JTermValidatorType("string")]
					}
				},
				summary: "helpSummary"
			}
		);
	}
	
	if(this.getOption('setLangEnabled')){
		this.addCommand(
			"setLang", 
			this.setLangCommand.bind(this), 
			{
				args : {"lang" : {
					validators : [new JTermValidatorType("string")]
				}},
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
 * @access private
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

/**
 * @access private
 */
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
 * @access private
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
 * Display a command from the history in the shell input box.
 * 
 * @param {number} index - Index of the command in the history.
 * @access private
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
 * @access private
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
 * @access private
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
 * @access private
 */
JTermController.prototype.selectCommandFromHistory = function(direction) {
	this.iterateSelector(this.model.history.length, 
		this.currentHistory,
		this.repeatCommand,
		this,
		direction);
};

/**
 * @access private
 */
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
 * @access private
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

/**
 * @access private
 */
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
 * @access private
 */
JTermController.prototype.keyboardUp = function(e) {
	this.keyBoardShortcut(e, false);
};

/**
 * @access private
 */
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
 * @access private
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

/**
 * @access private
 */
JTermController.prototype.dragOver = function(e) {
	e.preventDefault();
};

/**
 * Drop callback.
 * 
 * @param {DragEvent} e - Drop event.
 * @access private
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
 * @access private
 */
JTermController.prototype.pasteText = function(e) {
	this.view.insertChar(e.clipboardData.getData("text"));
};

/**
 * @access private
 * @param {Object} e
 */
JTermController.prototype.commandNotFound = function(e) {	
	this.view.printToOutput(this.getMessage("commandNotFound", null, [e.options.command]));
};

/**
 * @access private
 * @param {Object} e
 */
JTermController.prototype.argumentError = function(e) {
	var op = "Argument(s) error : \r\n";
	if(e.options.issues){
		for(var idx in e.options.issues){
			op += " - "+idx+" ("+e.options.command.argsOrder[idx]+") : "+e.options.issues[idx]+"\r\n";
		}
	}
	this.view.printToOutput(op);
};

/**
 * @access private
 */
JTermController.prototype.commandStart = function() {
	this.view.getElement("inputStart").style.display = "none";
};