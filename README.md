# Javascript-Shell-UI
A javascript shell UI like the Mac os X terminal

Features list:

 * Add commands as javascript function callback (supports async commands).
 * Browse commands history with keyboard arrows (top and bottom).
 * Text selection behaviors with keyboard arrows (left and rigth).
 * Paste from clipboard.
 * Events implementation.
 * Basic design fully customizable with CSS.
 * No dependencies (pure javascript).
 
Example :

Take a look at [example.html](https://github.com/Nadib/Javascript-Shell-UI/blob/master/example.html) for a basic integration example.

Constructor arguments :

 * inputElement {string} Id of the HTML dom element used as input, generally a <span> element.
 * outputElement {string} Id of the HTML dom element used as container for the shell command output.
 * options {object} Options object (optional).
 
Available options :

 * prefix {string} Prefix for the shell input line, default '$'.
 * highlightColor {string} Highlight color, default value '#a5a5a5'.
 
 Supported events :
 
 * 'commandComplete' Fired when a command is completed.
 * 'cancel' Fired when a command is cancelled.

Simple javascript example :

Type 'hello xxxxxx' or 'asyncHello xxxxxx' in the shell input to test.

```javascript
  	var shell = new ShellUI('input-element','shell-output-container');
  	// Add normal command
  	shell.addCommand('hello', function(name){
  		return 'You said hello to '+name;
  	});
  	// Add Async command
  	shell.addCommand('asyncHello', function(name, duration){
  		if(duration === undefined){
  			duration = 3000;
  		}
  		setTimeout(function(){
  			this.endCommand('You said hello asynchronously to '+name+' during '+duration+'ms');		
  		}.bind(this), duration);
  	}, {async:true , summary:'Async hello command.', help:'Long Help text'});
```