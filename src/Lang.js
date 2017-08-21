var JTermLang = function(code, file) {
	this.code = code;
	this.files = [file];
	this.definitions = {};
};

JTermLang.prototype.addFile = function(file) {
	this.files.push(file);
};

JTermLang.prototype.load = function() {
	var script;
	var l = this.files.length;
	var i;
	for(i=0;i<l;i++) {
		script = document.createElement("script");
		script.src = this.files[i];
		document.body.appendChild(script);	
	}
};

JTermLang.prototype.define = function(definitions) {
	this.definitions = Object.assign(definitions, this.definitions);
};

JTermLang.prototype.get = function(definition, args) {
	var i=0;
	return this.definitions[definition].replace(/(%s)/g, function () {
    	return args[i++];
  	});
};