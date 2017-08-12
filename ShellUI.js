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
 *  - highlightColor {string} Highlight color, default value '#a5a5a5',
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
	
	this.options = options;
	
	/** @member {Element} */
	this.inputElement = inputElement;
	/** @member {Element} */
	this.outputElement = outputElement;
	/** @member {Element} */
	this.endlineElement = null;
	/** @member {Element} */
	this.prefixElement = null;
	/** @member {Number} */
	this.keyboardSelected=null;
	/** @member {Number} */
	this.currentHistory=null;
	/** @member {array} */
	this.commandHistory=[];
	/** @member {object} */
	this.commands={};
	/** @member {boolean} */
	this.preventPaste=false;
	/** @member {boolean} */
	this.controlPressed=false;
	
	/**
	 * Initialize the shellUI after dom ready event.
	 */
	this.init = function() {
		this.inputElement = document.getElementById(this.inputElement);
		this.inputElement.style['white-space'] = 'pre';
		document.addEventListener("paste", this.pasteText.bind(this));	
		
		this.outputElement = document.getElementById(this.outputElement);
		this.outputElement.style['white-space'] = 'pre';
		
		
		this.endlineElement = this.createElement('span', ' ');
		this.endlineElement.style['background-color'] = this.options.highlightColor;
		this.endlineElement.style['white-space'] = 'pre';

		this.inputElement.parentElement.insertBefore(this.endlineElement, this.inputElement.nextSibling);
		
		
		this.prefixElement = this.createElement('span', this.options.prefix+' ');
		this.inputElement.parentElement.insertBefore(this.prefixElement, this.inputElement);
		
		
		document.addEventListener('keypress', this.keyboardCallback.bind(this));
		document.addEventListener('keydown', this.keyboardInteraction.bind(this));
		document.addEventListener('commandComplete', this.commandComplete.bind(this));
	};
	
	this.pasteText = function(e){
		
		var textData = e.clipboardData.getData('text');
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
		this.commands[name] = new ShellUICommand(name, callback, options);
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
		 	this.printOutput('-ShellUI: '+commandName+': command not found');
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
		if(e.detail && e.detail.returnContent){
			this.printOutput(e.detail.returnContent);
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
		    		if(this.controlPressed === true && e.keyCode === 3){
		    			// 3
		    			this.resetInput();
		    			this.controlPressed === false;
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
		this.preventPaste = false;
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
			this.inputElement.children[this.keyboardSelected].classList.remove('shellui-highlight');
		}
		this.keyboardSelected = index;
		if(this.keyboardSelected !== null && this.inputElement.children[this.keyboardSelected]){			
			this.endlineElement.style.display = 'none';
			this.inputElement.children[this.keyboardSelected].classList.add('shellui-highlight');
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
	 * Callback for special keyboard actions : 'delete', 'left', 'right', 'top', 'bottom'.
	 * 
	 * @param {KeyboardEvent} e - The dispatched keyboard event.
	 */
	this.keyboardInteraction = function(e){
		if(e.keyIdentifier && e.keyIdentifier === 'Meta'){
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
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var ShellUICommand = function(name, callback, options) {
	/** @member {string} */
	this.name = name;
	/** @member {function} */
	this.callback = callback;
	/** @member {object} */
	this.options = options;
	if(this.options === undefined){
		this.options = {};
	}
	
	/**
	 * Execute the command
	 * 
	 * @param {array} arguments - List of arguments.
	 * 
	 * @return mixed
	 */
	this.execute = function(arguments){		
		// Wait for the async
		if(this.options.async === true){
			this.callback.apply(this, arguments);
		}else{
			var event = new CustomEvent('commandComplete', {detail:{returnContent:this.callback.apply(this, arguments)}});
			document.dispatchEvent(event);
		}
	};
};