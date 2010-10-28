
module.exports = function() {
  var
    crypto = require( 'crypto' )
    magic = '$1$',
    base64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
 
  function random_alnum( length ) {
    var result = ''; 
    for ( var i = 0; i < length; i++ ) {
      result += base64[ Math.floor( Math.random() * 62 ) + 2 ]; // 2..63
    }
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
      i >>= 1;
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
    /*
     * takes 1 or 2 arguments to generate a hash
     * password: password to hash
     * salt (optional): existing hash containing salt. If not specified salt will be generated
     */
    md5crypt: function() { // arguments str, optional salt
      if ( arguments.length == 1 ) {
        var 
          password = arguments[0],
          salt = random_alnum(8);
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
    },
    /*
     * given a JS object, return a PHP session string 
     * php session string is of the format:
     * key|s:length:"value";
     */
    encode_session: function( s ) {
      var result = '', 
        key, 
        value;
      for ( key in s ) {
        value = String( s[key] );
        result += key + '|s:' + value.length + ':"' + value + '";';
      } 
      return result;
    },
    /*
     * given a php session string, return a JS object
     * k|s:length:"value";
     */
    decode_session: function( s ) {
      var pos = 0, 
        state='key',
        key,
        next,
        length,
        value,
        result = {},
        processing = true;
      while ( state !== 'done' ) {
        switch ( state ) {
          case 'key':
            next = s.indexOf( '|', pos );
            if ( next == -1 ) {
              state = 'done';
            }
            else {
              key = s.substring( pos, next );
              state = 'length';
              pos = next + 3;
            }
            break;
          case 'length':
            next = s.indexOf( ':', pos ); 
            if ( next == -1 ) {
              state = 'done';
            }
            else {
              length = parseInt( s.substring( pos, next ) );
              if ( typeof length != 'number' ) {
                throw "invalid format at " + pos;
              }
              state = 'value';
              pos = next + 2;
            }
            break;
          case 'value':
            value = s.substr( pos, length );
            result[key] = value;
            state = 'key';
            pos = pos + length + 2;
            break;
        }
      }
      return result;
    },
    generate_session: function() {
      return random_alnum( 26 );
    }
  }
}();
