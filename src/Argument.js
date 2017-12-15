/**
 * Argument constructor
 * @classdesc Argument object.
 * 
 * @constructor
 * @param {string} name - Argument name.
 * @param {object} [options] - Argument options.
 * @param {array} [options.validators] - Argument validators objects.
 * @param {string} [options.alias] - Alias for the argument.
 * @param {*} [options.defaultValue] - Argument default value.
 * 
 * @extends JTermOptions
 * @license Apache-2.0
 * @author Nadib Bandi
 */
var JTermArgument = function(name, options) {
	
	JTermOptions.call(this, options);
	
	this.name = name;
	this.validators = [];
	this.types = [];
	
	if(options && options.validators) {
		var l = options.validators.length;
		var i;
		for(i = 0;i < l;i++){
			this.addValidator(options.validators[i]);
		}
	}
};
JTermArgument.prototype = Object.create(JTermOptions.prototype);

/**
 * Add a validator
 * @param {Object} validator - Validator instance.
 */
JTermArgument.prototype.addValidator = function(validator) {
	if(validator.isType === true) {
		this.types.push(validator);
	} else {
		this.validators.push(validator);
	}
};

/**
 * Validate a value for this argument.
 * 
 * @param {mixed} value - Value to validate.
 * 
 * @returns {Boolean|Array} If the validation succeed the function will return true, otherwise it will return an array of errors.
 */
JTermArgument.prototype.validate = function(value) {
	var l = this.validators.length;
	var i;
	var errors = [];
	for(i=0;i<l;i++){
		var validate = this.validators[i].validate(value);
		if(validate !== true){
			errors.push(validate);
		}
	}
	l = this.types.length;
	if(l > 0) {	
	var validTypes = false;
	var expectedType = "Expected types:";
	for(i=0;i<l;i++) {
		validate = this.types[i].validate(value);
		if(validate === true){
			validTypes = true;
			break;	
		}
		expectedType += " "+validate;
	}
	if(validTypes === false) {
		errors.push("Type error "+expectedType);
	}
	if(errors.length > 0){
		return errors;
	}
	}
	return true;
};
