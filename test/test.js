var assert = require('assert'),
  php = require( 'php' );

assert.equal( php.md5crypt('rasmuslerdorf', '$1$rasmusle$'), '$1$rasmusle$rISCgZzpwk3UhDidwXvin0' );

