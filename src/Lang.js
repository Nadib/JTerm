var JTermLang = function(code, file) {
	JTermEventDispatcher.call(this);
	this.code = code;
	this.files = [file];
	this.definitions = {};
	
};
JTermLang.prototype = Object.create(JTermEventDispatcher.prototype);


JTermLang.prototype.addFile = function(file) {
	this.files.push(file);
};

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

JTermLang.prototype.fileLoaded = function(e){
	this.loading--;
	if(this.loading === 0){
		this.dispatchEvent(new JTermEvent('langLoaded'));
	}
};

JTermLang.prototype.define = function(definitions) {
	this.definitions = Object.assign(definitions, this.definitions);
};

JTermLang.prototype.get = function(definition, args) {
	var i=0;
	if(this.definitions[definition]){
		return this.definitions[definition].replace(/(%s)/g, function () {
    		return args[i++];
  		});
  	}
};