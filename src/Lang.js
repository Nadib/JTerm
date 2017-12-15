/**
 * JTerm lang constructor.
 * @constructor
 * @classdesc JTerm lang.
 * @param {string} code - Lang code.
 * @param {string} file - Lang file
 * 
 * @extends .JTermEventDispatcher
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermLang = function(code, file) {
	JTermEventDispatcher.call(this);
	this.code = code;
	this.files = [file];
	this.definitions = {};
	
};
JTermLang.prototype = Object.create(JTermEventDispatcher.prototype);

/**
 * Add a language file.
 * 
 * @param {string} file - Language file.
 */
JTermLang.prototype.addFile = function(file) {
	this.files.push(file);
};

/**
 * Load definition from language files.
 */
JTermLang.prototype.load = function() {
	var script;
	
	var l = this.files.length;
	var i;
	this.loading = l;
	for(i=0;i<l;i++) {
		script = document.createElement("script");
		script.src = this.files[i];
		script.onload = script.onreadystatechange = this.fileLoaded.bind(this);		
		document.body.appendChild(script);	
	}
};

/**
 * File loaded callback.
 * 
 * @param {event} e
 * @access private
 */
JTermLang.prototype.fileLoaded = function(e){
	this.loading--;
	if(this.loading === 0){
		this.dispatchEvent(new JTermEvent('langLoaded'));
	}
};

/**
 * Define translations.
 * 
 * @param {object} definitions - Definitions to add.
 */
JTermLang.prototype.define = function(definitions) {
	this.definitions = Object.assign(definitions, this.definitions);
};

/**
 * Get definition.
 * @param {string} definition
 * @param {array} [args] - Arguments option to replace %s var in lnaguage.
 * @returns {string} The definition.
 */
JTermLang.prototype.get = function(definition, args) {
	var i=0;
	if(this.definitions[definition]){
		return this.definitions[definition].replace(/(%s)/g, function () {
    		return args[i++];
  		});
  	}
};