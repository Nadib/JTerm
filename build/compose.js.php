<?php
$include = '"use strict";'."\r\n";

$include .= file_get_contents(__DIR__.'/../src/JTerm.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/EventDispatcher.js')."\r\n";

$include .= file_get_contents(__DIR__.'/../src/Lang.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/Options.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/Parser.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/Event.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/Model.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/View.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/Command.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/Controller.js');
echo $include;