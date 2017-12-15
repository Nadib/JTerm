/**
 * Command parser constructor.
 * @constructor
 * @classdesc Command parser.
 * @param {string} command - Command as string
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermCommandParser = function(command) {
	var cd = command.match(/'[^']*'|"[^"]*"|\S+/g) || [];
	this.command = cd[0];
	
	/**
	 * @property {array} arguments - Parsed arguments.
	 */
	this.arguments=[];
	
	/**
	 * @property {object} opts - Parsed options.
	 */
	this.opts = {};
	
	var i=1;
	var l = cd.length;
	var lastIsOption = false;
	for(i=1;i<l;i++) {
		if((cd[i][0] === '"' && cd[i][(cd[i].length-1)] === '"') || (cd[i][0] === "'" && cd[i][(cd[i].length-1)] === "'")) {
			cd[i] = cd[i].substr(1);
			cd[i] = cd[i].substr( 0, cd[i].length-1);
		}
		// double tiret
		if(cd[i][0] === "-" && cd[i][1] === "-") {			
			lastIsOption = cd[i].substr(2, cd[i].length-1);
			//
			
		}else if(cd[i][0] === "-"){
			lastIsOption = cd[i].substr(1, cd[i].length-1);			
		
		
		}else if(lastIsOption === false) {
			this.arguments.push(cd[i]);
		}else{
			this.opts[lastIsOption] = cd[i];
			lastIsOption = false;
		}		
		// simple tiret
		/*
		// --argName -a | --argName= -a=
		if(lastIsOption === false) {
			this.arguments.push(cd[i]);
		}else{
			this.opts[lastIsOption] = cd[i];
			lastIsOption = false;
		}*/
	}
};


/**
 * Get parsed arguments.
 * @returns {Array}
 */
JTermCommandParser.prototype.getArguments = function() {
	return this.arguments;
};