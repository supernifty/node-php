
module.exports = function() {
  var
    crypto = require( 'crypto' )
    lower_a = 'a'.charCodeAt(0),
    upper_a = 'A'.charCodeAt(0),
    zero = '0'.charCodeAt(0),
    period = '.'.charCodeAt(0),
    slash = '/'.charCodeAt(0),
    magic = '$1$',
    base64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
 
  function generate_salt( length ) {
    var 
      result = [], 
      ch;
    for ( var i = 0; i < length; i++ ) {
      result[result.length] = base64[ Math.floor( Math.random() * 62 ) + 2 ]; // 2..63
    }
    console.log( "salt" );
    console.log( result );
    return result;
  }

  function three_to_four( b0, b1, b2 ) {
    var
      a0 = b0.charCodeAt( 0 ),
      a1, a2

    if ( arguments.length == 3 ) {
      a1 = b1.charCodeAt( 0 );
      a2 = b2.charCodeAt( 0 );
      return base64[ a2 % 64 ] +
        base64[ ( ( a1 % 16 ) << 2 ) + ( ( a2 >> 6 ) % 4 ) ] + 
        base64[ ( ( a0 % 4 ) << 4 ) + ( ( a1 >> 4 ) % 16 ) ] + 
        base64[ ( a0 >> 2 ) % 64 ];
    }
    else { // 1 argument
      return base64[ a0 % 64 ] +
        base64[ ( a0 >> 6 ) % 4 ];
    }
  }

  // crypt has a ridiculous hash function
  function crypt_digest( salt, password ) {
    console.log( 'digesting: ' + salt + ' ' + password );
    var hash = crypto.createHash( 'md5' ),
        mixin_hash = crypto.createHash( 'md5' ),
        m2,
        mixin_digest,
        hash_result,
        result,
        i;

    hash.update( password + magic + salt );

    // weirdness phase 1
    mixin_hash.update( password + salt + password );
    mixin_digest = mixin_hash.digest();
    for ( i = 0; i < password.length; i++ ) {
      //m.update( parseInt( digest.substr( ( i % 16 ) * 2, 2 ), 16 ) );
      hash.update( mixin_digest[ i % 16 ] );
    } 

    // weirdness phase 2
    i = password.length;
    while ( i > 0 ) {
      if ( i & 1 ) { // odd
        hash.update( '\x00' );
      }
      else {
        hash.update( password[0] );
      }
      i >>= 1; // div 2
    }
    hash_result = hash.digest();

    // weirdness phase 3
    for ( i = 0; i < 1000; i++ ) {
      m2 = crypto.createHash( 'md5' );
      if ( i & 1 ) {
        m2.update(password)
      }
      else {
        m2.update(hash_result)
      }
      if ( i % 3 ) {
        m2.update(salt);
      }
      if ( i % 7 ) {
        m2.update(password)
      }
      if ( i & 1 ) {
        m2.update(hash_result)
      }
      else {
        m2.update(password)
      }
      hash_result = m2.digest()
    }

    result = three_to_four( hash_result[ 0 ], hash_result[ 6 ], hash_result[ 12 ] ) +
      three_to_four( hash_result[ 1 ], hash_result[ 7 ], hash_result[ 13 ] ) +
      three_to_four( hash_result[ 2 ], hash_result[ 8 ], hash_result[ 14 ] ) +
      three_to_four( hash_result[ 3 ], hash_result[ 9 ], hash_result[ 15 ] ) +
      three_to_four( hash_result[ 4 ], hash_result[ 10 ], hash_result[ 5 ] ) +
      three_to_four( hash_result[ 11 ] );
    
    return result;
  }

  return {
    md5crypt: function() { // arguments str, optional salt
      if ( arguments.length == 1 ) {
        var 
          password = arguments[0],
          salt = generate_salt(8);
        return magic + salt + '$' + crypt_digest( salt, password );
      }
      else if ( arguments.length == 2 ) {
        // extract salt
        var 
          password = arguments[0],
          salt = arguments[1],
          salt_split = salt.lastIndexOf( '$' );
        if ( salt_split != -1 ) {
          salt = salt.substring( 3, salt_split );
        }
        return magic + salt + '$' + crypt_digest( salt, password );
      }
      else {
        throw "crypt: wrong argument count: " + arguments.length;
      }
    }
  }
}();
