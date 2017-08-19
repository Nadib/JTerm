<?php
$include = '"use strict";'."\r\n";
$include .= file_get_contents(__DIR__.'/../src/Message.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/Event.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/Command.js')."\r\n";
$include .= file_get_contents(__DIR__.'/../src/ShellUI.js');
echo $include;