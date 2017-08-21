/**
 * Command parser
 * 
 * @param {string} command Command as string
 */
var JTermCommandParser = function(command) {
	var cd = command.match(/'[^']*'|"[^"]*"|\S+/g) || [];
	this.command = cd[0];
	this.arguments=[];
	var i=1;
	var l = cd.length;
	for(i=1;i<l;i++) {
		if((cd[i][0] === '"' && cd[i][(cd[i].length-1)] === '"') || (cd[i][0] === "'" && cd[i][(cd[i].length-1)] === "'")) {
			cd[i] = cd[i].substr(1);
			cd[i] = cd[i].substr( 0, cd[i].length-1);
		}
		this.arguments.push(cd[i]);
	}
};


/**
 * Get parsed arcguments.
 * @return {Array}
 */
JTermCommandParser.prototype.getArguments = function() {
	return this.arguments;
};