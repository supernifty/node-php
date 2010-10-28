# node-php

## Purpose

A node.js module implementing legacy PHP compatibility methods, currently just the md5 version of crypt.

## Installation

npm install php

## Usage

php = require( 'php' );

### php.md5crypt( 'password', '$1$salt$hash' );
Check a user password against an existing md5 hashed password

### php.md5crypt( 'password' );
Generate a salted, hashed password

### php.encode_session( { 'key1': 'value1' } );
Return a PHP encoded session string

### php.decode_session( 'key1|s:6:"value1";' );
Return a JavaScript object
