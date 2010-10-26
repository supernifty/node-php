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
