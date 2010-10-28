var assert = require('assert'),
  php = require( 'php' );

assert.equal( php.md5crypt('rasmuslerdorf', '$1$rasmusle$'), '$1$rasmusle$rISCgZzpwk3UhDidwXvin0' );

// key|s:length:"data";
assert.equal( php.encode_session( { 'n': '123', 's': 'abc' } ), 'n|s:3:"123";s|s:3:"abc";' );
assert.equal( JSON.stringify( php.decode_session( 'n|s:3:"123";s2|s:3:"abc";' ) ), JSON.stringify( {"n":"123","s2":"abc"} ) );
assert.equal( php.generate_session().length, 26 );
