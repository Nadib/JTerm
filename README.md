# Javascript-Shell-UI
A javascript shell UI like the Mac os X terminal

Features list:

 * Add commands as javascript function callback.
 * Browse commands history with keyboard arrows (top and bottom).
 * Text selection behaviors with keyboard arrows (left and rigth).
 * Basic simple design fully customizable with CSS.
 * No dependencies needed.
 
Example :

Take a look at [index.html](https://github.com/Nadib/Javascript-Shell-UI/blob/master/index.html) for a basic integration example.

Simple javascript example :
 
```javascript
shell = new ShellUI('input-element','shell-output-container','input-endline-element', 'input-prefix-element');
shell.addCommand('hello', function(name){
	return 'You said hello to '+name;
});
```