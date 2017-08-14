/**
 * Shell UI object constructor.
 * @constructor
 * @classdesc Shell UI class.
 * @param {string} inputElement - The dom id of the input element generally a span.
 * @param {string} outputElement - The dom id of the shell output element generally a div.
 * @param {object} options - Options object.
 * 
 * Available options :
 * 	- prefix {string} Prefix for the shell input, default value '$'.
 *  - highlightColor {string} Highlight color, default value '#a5a5a5'.
 *  - helpEnabled {boolean} Define if the help command is enabled, default value 'true'.
 *  - language {string} Override the detected language, default 'navigator.language'.
 *  - failbackLanguage {string} The failback language, default 'en'.
 * 
 * Supported events :
 *  - commandComplete Fired when a command is completed.
 *  - cancel Fired when a command was cancelled
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var ShellUI = function(inputElement, outputElement, options) {
	if(options === undefined){
		options = {};
	}
	if(options.prefix === undefined){
		options.prefix = '$';
	}
	if(options.highlightColor === undefined){
		options.highlightColor = '#a5a5a5';
	}
	if(options.helpEnabled === undefined){
		options.helpEnabled = true;
	}
	if(options.language === undefined){
		options.language = navigator.language;
	}
	if(options.failbackLanguage === undefined){
		options.failbackLanguage = 'en';
	}
	
	


	
	/** @member {object} Options object*/
	this.options = options;
	/** @member {Element} Dom element used as input, generally a span element. */
	this.inputElement = inputElement;
	/** @member {Element} Dom element used as shell output container.*/
	this.outputElement = outputElement;
	/** @member {Element} Endline element.*/
	this.endlineElement = null;
	/** @member {Element} Prefix element.*/
	this.prefixElement = null;
	/** @member {Number} Index of the current selected character.*/
	this.keyboardSelected=null;
	/** @member {Number} Index of the current browsed command history.*/
	this.currentHistory=null;
	/** @member {array} History of executed commands.*/
	this.commandHistory=[];
	/** @member {object} List of available commands.*/
	this.commands={};
	/** @member {boolean} Prevent paste.*/
	this.preventPaste=false;
	/** @member {boolean} True when ctrl key is pressed.*/
	this.controlPressed=false;
	/** @member {object} Events listeners.*/
	this.eventListeners = {};
	/** @member {string} Current language.*/
	this.language = this.options.language;
	/** @member {string} Current failback language.*/
	this.failbackLanguage = this.options.failbackLanguage;
	
	/**
	 * Initialize the shellUI after dom ready event.
	 */
	this.init = function() {
		this.inputElement = document.getElementById(this.inputElement);
		this.inputElement.style['white-space'] = 'pre';
		
		document.addEventListener("dragover", function( event ) {
      		// prevent default to allow drop
      		event.preventDefault();
  		}, false);
 		document.addEventListener("drop", this.dropText.bind(this));
		document.addEventListener("paste", this.pasteText.bind(this));

		this.outputElement = document.getElementById(this.outputElement);
		this.outputElement.style['white-space'] = 'pre';
		this.endlineElement = this.createElement('span', ' ');
		this.endlineElement.style['background-color'] = this.options.highlightColor;
		this.endlineElement.style['white-space'] = 'pre';
		this.endlineElement.style['padding-left'] = '3px';
  
		this.inputElement.parentElement.insertBefore(this.endlineElement, this.inputElement.nextSibling);
		this.prefixElement = this.createElement('span', this.options.prefix+' ');
		this.inputElement.parentElement.insertBefore(this.prefixElement, this.inputElement);		
		document.addEventListener('keypress', this.keyboardCallback.bind(this));
		document.addEventListener('keydown', this.keyboardInteraction.bind(this));
		document.addEventListener('keyup', this.keyboardUp.bind(this));
		this.addEventListener('commandComplete', this.commandComplete.bind(this));
		if(this.options.helpEnabled === true){
			this.addCommand('help', this.helpCommand.bind(this));
		}
		
		var languageScript = document.createElement("script");
		languageScript.src = "languages/"+this.language+'.js';
		document.body.appendChild(languageScript);
		if(this.language !== this.failbackLanguage){
			var languageScript2 = document.createElement("script");
			languageScript2.src = "languages/"+this.failbackLanguage+'.js';
			document.body.appendChild(languageScript2);
		}
		
	};
	
	/**
	 * Help command.
	 * 
	 * @param {string} command - Command name.
	 */
	this.helpCommand = function(command){
		var helpText = '';
		if(command === undefined){
			helpText = this.getMessage('command_list_title')+'\r\n\r\n';
			for (var prop in this.commands) {
				if(prop !== 'help'){					
					helpText += ' - '+this.commands[prop].getHelp(true)+'\r\n';
				}
			}
			helpText += '\r\n '+this.getMessage('command_help');
		}else if(command){
			if(this.commands[command] === undefined){
				helpText += this.getMessage('command_not_found').printf(command);
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
	this.getMessage = function(message, language){		
		if(language === undefined){
			language = this.language;
		}
		if(ShellUILanguage[language] && ShellUILanguage[language][message]){
			return ShellUILanguage[language][message];
		}
		if(ShellUILanguage[this.failbackLanguage] && ShellUILanguage[this.failbackLanguage][message]){
			return ShellUILanguage[this.failbackLanguage][message];
		}
		
		return undefined;
	};
	
	/**
	 * Remove event listener.
	 * 
	 * @param {string} name - Event name.
	 * @param {function} callback - Callback function to remove from listeners.
	 */
	this.removeEventListener = function(name, callback){
		if(this.eventListeners[name]){
			var i;
			for(i=0;i<this.eventListeners[name].length;i++){
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
	this.addEventListener = function(name, callback){
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
	this.dispatchEvent = function(event){
		if(this.eventListeners[event.name]){
			var i;
			event.target = this;
			for(i=0;i<this.eventListeners[event.name].length;i++){
				this.eventListeners[event.name][i].apply(this, [event]);
			}
		}
	};
	
	/**
	 * Drop callback
	 */
	this.dropText = function(e){
		e.preventDefault();
		var dropVal = '';
		if(e.dataTransfer.files.length > 0){
			var i;
			for(i=0;i<e.dataTransfer.files.length;i++){
				if(i>0){
					dropVal += ' ';
				}
				dropVal += e.dataTransfer.files[i].name;
			}
		}else{
			dropVal = e.dataTransfer.getData('text');
		}
		this.pasteText(dropVal);
	};
	
	/**
	 * Javascript paste event callback
	 * 
	 * @param {ClipboardEvent/string} e - The clipboard event.
	 */
	this.pasteText = function(e){
		var textData='';
		if (typeof e === 'string') {
			textData = e;
		}else{
			textData = e.clipboardData.getData('text');
		}
		
		var previousTextData = this.inputElement.textContent;
		var htmlPut = '';
		var i;
		for(i=0;i<textData.length;i++){
			htmlPut += '<span>'+textData[i]+'</span>';
		}
		if(this.keyboardSelected !== null){	
			var newContent = '';
			for(i=0;i<previousTextData.length;i++){
				if(i === this.keyboardSelected){
					newContent += htmlPut;
				}
				newContent += '<span>'+previousTextData[i]+'</span>';
			}
			this.inputElement.innerHTML = newContent;
			this.keyboardSelected = this.keyboardSelected+textData.length;	  
		}else{
			this.inputElement.innerHTML += htmlPut;
		}
	};
	
	/**
	 * Add a command executable by the shellUI.
	 * 
	 * @param {string} name - The command name.
	 * @param {function} callback - The callback funcion for the command.
	 */
	this.addCommand = function(name, callback, options){
		this.commands[name] = new ShellUICommand(name, callback, this, options);
	};
	
	/**
	 * Execute a command.
	 * 
	 * @param {string} The command text.
	 * @return {mixed} The command return value or null.
	 */
	this.executeCommand = function(command){
		
		var commandDatas = command.split(/[ ]+/);
		var commandName = commandDatas[0];
		var arguments = commandDatas.slice(1);
		if(!this.commands[commandName]){
		 	this.printOutput(this.getMessage('command_not_found').printf(commandName));
		}else{
			this.prefixElement.style.display = 'none';
			this.commands[commandName].execute(arguments);
		}
	};
	
	/**
	 * Command complete callback.
	 * 
	 * @param {CustomEvent} e - Custom commandComplete event.
	 */
	this.commandComplete = function(e){
		if(e.options.returnContent){
			this.printOutput(e.options.returnContent);
		}
		this.resetInput();
		this.prefixElement.style.display = 'inline';
	};
	
	/**
	 * Reset the shell input to be empty.
	 */
	this.resetInput = function(){
		this.selectChar(null);
		while (this.inputElement.firstChild) {
        	this.inputElement.removeChild(this.inputElement.firstChild);
      	}
	};
	
	/**
	 * Helper function to create an element.
	 * 
	 * @param {string} type - The type of the element to create eg: 'span'.
	 * @param {string} text - The text to insert in a text node.
	 * @return {Element} The created dom element.
	 */
	this.createElement = function(type, text){
		var newElement = document.createElement(type);
		var textNode = document.createTextNode(text);
		newElement.appendChild(textNode);
		return newElement;
	};
	
	/**
	 * Callback for keyboardEvent when the user type something.
	 * 
	 * @param {KeyboardEvent} e - The dispatched keyboard event.
	 */
	this.keyboardCallback = function(e){
		
		switch (e.keyCode) {
    		case 8:
        		break;        	
        	case 37:
        		break;
        	case 39:
        		break;
        	case 38:
        		break;
        	case 40:
        		break;
        	case 13:
        		var command = this.inputElement.textContent;
				this.printOutput(this.prefixElement.textContent+command);
				this.resetInput();
				if(command){
					this.commandHistory.push(command);
					this.executeCommand(command);
				}
				this.outputElement.parentNode.scrollTop = this.outputElement.parentNode.scrollHeight;
				this.currentHistory=null;
        		break;
		    default:
		    	if(!e.key){
		    		var decodedChar = String.fromCharCode(e.keyCode);
					if(!e.shiftKey){
						decodedChar = decodedChar.toLowerCase();
					}
					e.key = decodedChar;
		    	}		    	
		    	if(this.preventPaste === false){
		    		if(this.controlPressed === true && (e.key === 'c' || e.keyCode === 3)){
		    			this.resetInput();
		    			var event = new ShellUIEvent('cancel', {});
						this.dispatchEvent(event);		    			
		    			return;
		    		}
		    		if(this.keyboardSelected !== null){						
						this.inputElement.insertBefore(this.createElement('span',e.key), this.inputElement.children[this.keyboardSelected]);
						this.selectChar(this.keyboardSelected+1);					  
					}else{
						this.inputElement.append(this.createElement('span',e.key));
					}
				}
		}
	};
	
	/**
	 * Print to output container.
	 * 
	 * @param {string} text - The text to print in the output container
	 */
	this.printOutput = function(text){
		this.outputElement.appendChild(this.createElement('p',text));
	};
	
	/**
	 * Remove a char form the shell input box.
	 * 
	 * @param {number} index - Index of the character to remove from the input box.
	 */
	this.removeChar = function (index){
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
	this.selectChar = function(index){
		if(this.keyboardSelected !== null && this.inputElement.children[this.keyboardSelected]){
			this.inputElement.children[this.keyboardSelected].style['background-color'] = 'transparent';
		}
		this.keyboardSelected = index;
		if(this.keyboardSelected !== null && this.inputElement.children[this.keyboardSelected]){			
			this.endlineElement.style.display = 'none';			
			this.inputElement.children[this.keyboardSelected].style['background-color'] = this.options.highlightColor;
		}else{
			this.endlineElement.style.display='inline';
		}
	};
	
	/**
	 * Display a command from the history in the shell input box.
	 * 
	 * @param {number} index - Index of the command in the history.
	 */
	this.repeatCommand = function(index){
		this.currentHistory = index;
		if(this.commandHistory[this.currentHistory]){
			this.resetInput();
			var i;
			for(i=0;i<this.commandHistory[this.currentHistory].length;i++){				
				this.inputElement.appendChild(this.createElement('span', this.commandHistory[this.currentHistory][i]));
			}
		}
	};
	
	/**
	 * Detect the next character to select in the shell input box from left and right keyboard arrows.
	 * 
	 * @param {string} direction - Direction of the selection 'left' or 'right'.
	 */
	this.selectFromKeyboard = function(direction){
		length = this.inputElement.children.length;
		if(length > 0){
			if(direction === 'left'){
				if(this.keyboardSelected === null){					
					this.selectChar(length-1);
				}else if(this.keyboardSelected > 0){
					this.selectChar(this.keyboardSelected-1);
				}
			}else if(direction === 'right'){
				if(this.keyboardSelected !== null && this.keyboardSelected < length-1){
					this.selectChar(this.keyboardSelected+1);
				}else{
					this.selectChar(null);					
				}
			}
    	}	
	};
	
	/**
	 * Detect the next command to get from history with top and bottom arrow.
	 * 
	 * @param {string} direction - Direction of the history selection 'top' or 'bottom'.
	 */
	this.selectCommandFromHistory = function(direction){
		length = this.commandHistory.length;
		if(length > 0){
			if(direction === 'top'){
				if(this.currentHistory === null){
					this.repeatCommand(length-1);
				}else if(this.currentHistory > 0){
					this.repeatCommand(this.currentHistory-1);
				}
			}else if(direction === 'bottom'){
				 if(this.currentHistory !== null && this.currentHistory < length-1){
					this.repeatCommand(this.currentHistory+1);
				}else{
					this.repeatCommand(null);					
				}
			}				
		}
	};
	
	/**
	 * KeyboardUp callback
	 * 
	 * @param {KeyboardEvent} e - KeyboardEvent.
	 */
	this.keyboardUp = function(e){
		if(e.keyIdentifier == 'Control' || e.key === 'Control'){
			this.controlPressed = false;
			return;
		}
		if((e.keyIdentifier && e.keyIdentifier === 'Meta') || (e.key && e.key === 'Meta')){
			this.preventPaste = false;
			return;
		}
	};
	
	/**
	 * Callback for special keyboard actions : 'delete', 'left', 'right', 'top', 'bottom'.
	 * 
	 * @param {KeyboardEvent} e - The dispatched keyboard event.
	 */
	this.keyboardInteraction = function(e){
		if((e.keyIdentifier && e.keyIdentifier === 'Meta') || (e.key && e.key === 'Meta')){
			this.preventPaste = true;
			return;
		}
		if(e.keyIdentifier == 'Control' || e.key === 'Control'){
			this.controlPressed = true;
			return;
		}
		switch (e.keyCode) {
    		case 8:
        		if(this.keyboardSelected !== null){
					if(this.keyboardSelected > 0){
						this.removeChar(this.keyboardSelected-1);			
						this.selectChar(this.keyboardSelected-1);
					}
				}else{
					this.removeChar(-1);
				}
        		break;        	
        	case 37:
        		this.selectFromKeyboard('left');
        		break;
        	case 39:
        		this.selectFromKeyboard('right');
        		break;
        	case 38:
        		this.selectCommandFromHistory('top');
        		break;
        	case 40:
        		this.selectCommandFromHistory('bottom');
        		break;
		    default:
		}
	};
	// Init the shell UI when Dom is ready.
	if( document.readyState === 'complete' ) {
		this.init();
	}else{
		document.addEventListener("DOMContentLoaded", this.init.bind(this));
	}
};

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
var ShellUICommand = function(name, callback,shell, options) {
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
	/** @member {string} Command signature.*/
	this.signature=null;
	/** @member {boolean} True when the command is cancelling.*/
	this.cancel = false;

	/**
	 * Execute the command
	 * 
	 * @param {array} arguments - List of arguments.
	 * 
	 * @return mixed
	 */
	this.execute = function(arguments){
		this.cancel = false;
		this.shell.removeEventListener('cancel', this.cancelBound);
		this.shell.addEventListener('cancel', this.cancelBound);
		if(this.options.async === true){
			this.callback.apply(this, arguments);
		}else{
			this.endCommand(this.callback.apply(this, arguments));
		}
	};
	
	/**
	 * Get the command signature.
	 * @return {string}
	 */
	this.getSignature = function(){
		if(this.signature===null){
			var args = this.callback.toString ().
              	replace (/[\r\n\s]+/g, ' ').
              	match (/function\s*\w*\s*\((.*?)\)/)[1].split (/\s*,\s*/);
            this.signature = this.name;
            var j;
            for(j=0;j<args.length;j++){
            	this.signature += ' ['+args[j]+']';
            }
		}
		return this.signature;
	};
	
	/**
	 * Ending the command.
	 * 
	 * @param {string} returnContent - content returned.
	 */
	this.endCommand=function(returnContent){
		if(this.cancel === false){
			var event = new ShellUIEvent('commandComplete', {returnContent:returnContent, command:this});
			this.shell.dispatchEvent(event);
		}
	};
	
	/**
	 * Get Help
	 * 
	 * @param {boolean} summary - If true return only a short summary.
	 * 
	 * @return {string} The help text.
	 */
	this.getHelp = function(summary){
		var helpText = this.getSignature();
		if(this.options.summary){
			helpText += ' '+this.options.summary;
		}
		if(summary === true){
			return helpText;
		}
		if(this.options.help){
			helpText += ' \r\n'+this.options.help;
		}
		return helpText;
	};
	
	/**
	 * Cancel cllback method.
	 * 
	 * @param {ShellUIEvent} e - ShellUI event cancel.
	 */
	this.cancelCallback = function(e){
		this.cancel = true;
		var event = new ShellUIEvent('commandComplete', {returnContent:undefined, command:this});
		this.shell.dispatchEvent(event);
	};
	this.cancelBound = this.cancelCallback.bind(this);
};

/**
 * Shell UI event object.
 * @constructor
 * @classdesc Shell UI command.
 * @param {string} name - Event name.
 * @param {object} options - Options object.
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var ShellUIEvent = function(name, options) {
	/** @member {string} name - Event name */
	this.name = name;
	/** @member {object} options - Event options */
	this.options = options;
	/** @member {mixed} target - Event target */
	this.target=null;
};
var ShellUILanguage = {};
String.prototype.printf = function () {
  var args = arguments;
  var i=0;
  return this.replace(/(%s)/g, function () {
    return args[i++];
  });
};