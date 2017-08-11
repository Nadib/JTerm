/**
 * Shell UI object constructor.
 * @constructor
 * @classdesc Shell UI class.
 * @param {string} inputElement - The dom id of the input element generally a span.
 * @param {string} outputElement - The dom id of the shell output element generally a div.
 * @param {string} endlineElement - The dom id of the input end line element generaly a span.
 * @param {string} prefixElement - The dom id of the input prefix element generaly a span.
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var ShellUI = function(inputElement, outputElement, endlineElement, prefixElement) {
	
	/** @member {Element} */
	this.inputElement = inputElement;
	/** @member {Element} */
	this.outputElement = outputElement;
	/** @member {Element} */
	this.endlineElement = endlineElement;
	/** @member {Element} */
	this.prefixElement = prefixElement;
	/** @member {Number} */
	this.keyboardSelected=null;
	/** @member {Number} */
	this.currentHistory=null;
	/** @member {array} */
	this.commandHistory=[];
	/** @member {object} */
	this.commands={};
	
	/**
	 * Initialize the shellUI after dom ready event.
	 */
	this.init = function() {
		
		this.inputElement = document.getElementById(this.inputElement);
		if(this.endlineElement){
			this.endlineElement = document.getElementById(this.endlineElement);
		}
		if(this.outputElement){
			this.outputElement = document.getElementById(this.outputElement);
		}
		if(this.prefixElement){
			this.prefixElement = document.getElementById(this.prefixElement);
		}
		document.addEventListener('keypress', this.keyboardCallback.bind(this));
		document.addEventListener('keydown', this.keyboardInteraction.bind(this));
	};
	
	/**
	 * Add a command executable by the shellUI.
	 * 
	 * @param {string} name - The command name.
	 * @param {function} callback - The callback funcion for the command.
	 */
	this.addCommand = function(name, callback){
		this.commands[name] = callback;
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
			var returnValue = this.commands[commandName].apply(commandName, arguments);
			if(returnValue){
				this.printOutput(returnValue);
				return returnValue;
			}
			
		}
		return null;
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
		console.log(e);
		// Safari not support KeyboarEvent.key property at this time
		if(e.key){
			if(e.key != 'Enter'){
				if(this.keyboardSelected !== null){						
					this.inputElement.insertBefore(this.createElement('span',e.key), this.inputElement.children[this.keyboardSelected]);
					this.selectChar(this.keyboardSelected+1);					  
				}else{
					this.inputElement.append(this.createElement('span',e.key));
				}			
			}else{
				var command = this.inputElement.textContent;
				if(this.outputElement){
					var displayText = ''; 
					if(this.prefixElement){
						displayText += this.prefixElement.textContent;
					}
					displayText += command;
					this.printOutput(displayText);
				}
				if(command){
					this.commandHistory.push(command);
					this.executeCommand(command);
				}
				this.resetInput();				
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
			this.inputElement.children[this.keyboardSelected].classList.remove('shellui-highlight');
		}
		this.keyboardSelected = index;
		if(this.keyboardSelected !== null && this.inputElement.children[this.keyboardSelected]){
			this.endlineElement.style='display:none;';
			this.inputElement.children[this.keyboardSelected].classList.add('shellui-highlight');
		}else{
			this.endlineElement.style='display:auto;';
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