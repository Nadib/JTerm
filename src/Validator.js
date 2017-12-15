/**
 * JTerm validator constructor.
 * @constructor
 * @classdesc JTerm validator superclass.
 * @param {boolean} isType - True if it's a type validator.
 * 
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermValidator = function(isType) {
	if(isType !== true) {
		isType = false;
	}
	this.isType = isType;
};

/**
 * JTerm type validator constructor.
 * @constructor
 * @classdesc JTerm type validator class.
 * @param {string} type - The type of validator.
 * 
 * @extends JTermValidator
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermValidatorType = function(type) {
	
	JTermValidator.call(this, true);
	this.type = type;
};
JTermValidatorType.prototype = Object.create(JTermValidator.prototype);

/**
 * Validate a type
 * 
 * @param {*} value - Value to validate.
 * @returns {boolean|string} True if the value is valid otherwise the error as a string.
 */
JTermValidatorType.prototype.validate = function(value) {
	
	if(value === null){
		return true;
	}
	var val = false;
	if(this.type === "string") {
		val = isNaN(value);
	}else if(this.type === "number") {
		if( isNaN(value) === true) {
			val = false;
		}else{
			val = true;
		}
	}
	if(val === true){
		return val;
	}
	return this.type;
};

/**
 * Required validator constructor.
 * @constructor
 * @classdesc Required validator class.
 * 
 * @extends JTermValidator
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermValidatorRequired = function() {
	JTermValidator.call(this);
};
JTermValidatorRequired.prototype = Object.create(JTermValidator.prototype);

/**
 * Validate required
 * 
 * @param {*} value - Value to validate.
 * @returns {Boolean|String} True if the value is valid otherwise the error as a string.
 */
JTermValidatorRequired.prototype.validate = function(value) {
	if(value === null || value === undefined || value === ""){
		return "A value is required";
	}
	return true;
};