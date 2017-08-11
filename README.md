# Javascript-Shell-UI
A javascript shell UI like the Mac os X terminal

Features list:

 * Add custom commands.
 * Command history management.

Example :

Take a look at [index.html](https://github.com/Nadib/Javascript-Shell-UI/blob/master/index.html) for an implemetation example.

Usage :
 
```javascript
shell = new ShellUI('input-element','shell-output-container','input-endline-element', 'input-prefix-element');
shell.addCommand('hello', function(name){
	return 'You Say hello to '+name;
});
```