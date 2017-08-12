# Javascript-Shell-UI
A javascript shell UI like the Mac os X terminal

Features list:

 * Add commands as javascript function callback.
 * Browse commands history with keyboard arrows (top and bottom).
 * Text selection behaviors with keyboard arrows (left and rigth).
 * Basic simple design fully customizable with CSS.
 * No dependencies (pure javascript).
 * Async commands.
 
Example :

Take a look at [index.html](https://github.com/Nadib/Javascript-Shell-UI/blob/master/index.html) for a basic integration example.

Simple javascript example :

Type 'hello xxxxxx' or 'asyncHello xxxxxx' in the shell input to test.

```javascript
shell = new ShellUI('input-element','shell-output-container','input-endline-element', 'input-prefix-element');
// Add normal command
shell.addCommand('hello', function(name){
	return 'You said hello to '+name;
});
// Add Async command
shell.addCommand('asyncHello', function(name){
	setTimeout(function(){
		// Async command require event dispatch.
  		var event = new CustomEvent('commandComplete', {detail:{returnContent:'You said hello asynchronously to '+name}});
		document.dispatchEvent(event);	
  	}, 3000);
}, {async:true});
```