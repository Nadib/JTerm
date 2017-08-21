var JTermView = function(input, output, options){
	
	JTermOptions.call(this, options, {
		highlightColor : "#a5a5a5",
		prefix : "$"
	});
	
	this.elements = {shellInput:input, shellOutput:output};
	
};

JTermView.prototype = Object.create(JTermOptions.prototype);


/** @member {Number} Index of the current selected character.*/
JTermView.prototype.selectedChar = null;

/**
 * Select a character from the shell input box.
 * 
 * @param {number} index - Index of the character to select in the shell input box.
 */
JTermView.prototype.selectChar = function(index) {
	if(this.selectedChar !== null && this.getElement("shellInput").children[this.selectedChar]) {
		this.getElement("shellInput").children[this.selectedChar].style["background-color"] = "transparent";
	}
	this.selectedChar = index;
	if(this.selectedChar !== null && this.getElement("shellInput").children[this.selectedChar]) {			
		this.getElement("inputEnd").style.display = "none";			
		this.getElement("shellInput").children[this.selectedChar].style["background-color"] = this.options.highlightColor;
	} else {
		this.getElement("inputEnd").style.display = "inline";
	}
};

JTermView.prototype.insertChar = function(character) {
	
	if(character.length > 1) {
		var i;
		var txl = character.length;
		for(i=0;i<txl;i++) {
			this.insertChar(character[i]);
		}
		return;
	}
	if(this.selectedChar !== null) {						
		this.getElement("shellInput").insertBefore(this.createElement("span", character), this.getElement("shellInput").children[this.selectedChar]);
		this.selectChar(this.selectedChar+1);					  
	} else {
		this.getElement("shellInput").append(this.createElement("span", character));
	}
};

/**
 * Remove a char form the shell input box.
 * 
 * @param {number} index - Index of the character to remove from the input box.
 */
JTermView.prototype.removeChar = function () {
	if(this.selectedChar !== null) {
		if(this.selectedChar > 0) {
			this.removeCharElement(this.selectedChar - 1);			
			this.selectChar(this.selectedChar - 1);
		}
	} else {
		this.removeCharElement(this.getElement('shellInput').children.length - 1);
	}
};

JTermView.prototype.removeCharElement = function(index) {
	if(this.getElement("shellInput").children[index]) {  			
		this.getElement("shellInput").removeChild(this.getElement("shellInput").children[index]);
	}
};


JTermView.prototype.getElement = function(name) {
	if(this.elements[name]){
		if (typeof this.elements[name] === "string") {
			this.elements[name] = document.getElementById(this.elements[name]);
		}
		return this.elements[name];
	}
	return null;
};

JTermView.prototype.setElement = function(name, element) {
	this.elements[name] = element;
};

JTermView.prototype.init = function() {
	
	// Input Element
	if (typeof this.inputElement === "string") {
		this.inputElement = document.getElementById(this.inputElement);
	}
	this.getElement("shellInput").style["white-space"] = "pre";
	this.getElement("shellOutput").style["white-space"] = "pre";
	
	// endline Element
	this.setElement("inputEnd", this.createElement("span", " ", {
		"background-color" : this.options.highlightColor,
		"white-space" : "pre",
		"padding-left" : "3px"}));
	
	this.getElement('shellInput').parentElement.insertBefore(this.getElement('inputEnd'), this.getElement('shellInput').nextSibling);
	
	// Prefix Element
	this.setElement("inputStart", this.createElement("span", this.options.prefix+" "));
	this.getElement('shellInput').parentElement.insertBefore(this.getElement('inputStart'), this.getElement('shellInput'));
};

/**
 * Print to output container.
 * 
 * @param {string} text - The text to print in the output container
 */
JTermView.prototype.printToOutput = function(text) {
	this.getElement("shellOutput").appendChild(this.createElement("p", text));
};

/**
 * Empty the shell input.
 */
JTermView.prototype.resetInput = function() {
	this.selectChar(null);
	while (this.getElement('shellInput').firstChild) {
       	this.getElement('shellInput').removeChild(this.getElement('shellInput').firstChild);
   	}
};

JTermView.prototype.shellScrollToBottom = function() {
	this.getElement("shellOutput").parentNode.scrollTop = this.getElement("shellOutput").parentNode.scrollHeight;
};

/**
 * Helper function to create an element.
 * 
 * @param {string} type - The type of the element to create eg: 'span'.
 * @param {string} text - The text to insert in a text node.
 * @return {Element} The created dom element.
 */
JTermView.prototype.createElement = function(type, text, styles){
	var ne = document.createElement(type);
	if(styles){
		var k;
		for ( k in styles) { 
			ne.style[k] = styles[k];
		}
	}
	ne.appendChild(document.createTextNode(text));
	return ne;
};