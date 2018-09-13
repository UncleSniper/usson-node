'use strict';

const MalformedJSONException = require('./MalformedJSONException.js');

const ST_BEFORE_DOCUMENT = 0;
const ST_NONE = 1;
const ST_NAME_F = 2;
const ST_NAME_FA = 3;
const ST_NAME_FAL = 4;
const ST_NAME_FALS = 5;
const ST_NAME_FALSE = 6;
const ST_NAME_T = 7;
const ST_NAME_TR = 8;
const ST_NAME_TRU = 9;
const ST_NAME_TRUE = 10;
const ST_NAME_N = 11;
const ST_NAME_NU = 12;
const ST_NAME_NUL = 13;
const ST_NAME_NULL = 14;
const ST_BEFORE_INITIAL_KEY = 15;
const ST_BEFORE_KEY = 16;
const ST_BEFORE_NAME_SEPARATOR = 17;
const ST_BEFORE_VALUE = 18;
const ST_BEFORE_MEMBER_SEPARATOR = 19;
const ST_BEFORE_INITIAL_ELEMENT = 20;
const ST_BEFORE_ELEMENT = 21;
const ST_BEFORE_ELEMENT_SEPARATOR = 22;
const ST_STRING = 23;
const ST_INSIDE_STRING = 24;
const ST_STRING_ESCAPE = 25;
const ST_INSIDE_STRING_ESCAPE = 26;
const ST_STRING_UNICODE = 27;
const ST_INSIDE_STRING_UNICODE = 28;
const ST_BEFORE_INT = 29;
const ST_WITHIN_INT = 30;
const ST_AFTER_INT = 31;
const ST_BEFORE_FRACTION = 32;
const ST_WITHIN_FRACTION = 33;
const ST_BEFORE_EXPONENT_SIGN = 34;
const ST_BEFORE_EXPONENT = 35;
const ST_WITHIN_EXPONENT = 36;
const ST_AFTER_DOCUMENT = 37;

const STRING_ESCAPE_MAP = Object.assign(Object.create(null), {
	'"': '"',
	'\\': '\\',
	'/': '/',
	'b': '\b',
	'f': '\f',
	'n': '\n',
	'r': '\r',
	't': '\t'
});

const CODE_0 = '0'.charCodeAt(0);
const CODE_a = 'a'.charCodeAt(0);
const CODE_A = 'A'.charCodeAt(0);

class JSONParser {

	constructor(sink) {
		this.sink = sink;
		this._state = ST_BEFORE_DOCUMENT;
		this._stack = [];
		this._string = null;
		this.line = this.column = 1;
		this.file = null;
		this._code = 0;
		this._digits = 0;
		this._slate = null;
	}

	reset() {
		this._state = ST_BEFORE_DOCUMENT
		this._stack = [];
		this._string = null;
		this.line = this.column = 1;
		this._slate = null;
		return this;
	}

	pushString(chars, offset, count) {
		if(!this._slate) {
			try {
				return this._pushStringImpl(chars, offset, count);
			}
			catch(error) {
				return Promise.reject(error);
			}
		}
		return this._defer(chars, offset, count, this._slate);
	}

	_pushStringImpl(chars, offset, count) {
		offset = offset || 0;
		if(offset < 0)
			offset = 0;
		count = count === undefined ? chars.length - offset : count || 0;
		const end = offset + count;
		if(end > chars.length)
			end = chars.length;
		var c, tstart = offset, lstart = offset, sretval, instr, strtmp;
		for(; offset < end; ++offset) {
			c = chars.charAt(offset);
			switch(this._state) {
				case ST_BEFORE_DOCUMENT:
					switch(c) {
						case '\n':
							++this.line;
							this.column = 1;
							lstart = offset + 1;
						case '\t':
						case '\r':
						case ' ':
							break;
						case '{':
							this._state = ST_BEFORE_INITIAL_KEY;
							sretval = this.sink && this.sink.beginObject();
							if(sretval && sretval.then) {
								this.column += offset - lstart;
								return this._defer(chars, offset + 1, end - offset - 1, sretval);
							}
							break;
						case '[':
							this._state = ST_BEFORE_INITIAL_ELEMENT;
							sretval = this.sink && this.sink.beginArray();
							if(sretval && sretval.then) {
								this.column += offset - lstart;
								return this._defer(chars, offset + 1, end - offset - 1, sretval);
							}
							break;
						default:
							this.column += offset - lstart;
							this._die("Unexpected character %; document must start with '[' or '{': code "
									+ chars.charCodeAt(offset));
					}
					break;
				case ST_NONE:
					switch(c) {
						case '\n':
							++this.line;
							this.column = 1;
							lstart = offset + 1;
						case '\t':
						case '\r':
						case ' ':
							break;
						case 'f':
							this._state = ST_NAME_F;
							break;
						case 'n':
							this._state = ST_NAME_N;
							break;
						case 't':
							this._state = ST_NAME_T;
							break;
						case '{':
							this._state = ST_BEFORE_INITIAL_KEY;
							sretval = this.sink && this.sink.beginObject();
							if(sretval && sretval.then) {
								this.column += offset - lstart;
								return this._defer(chars, offset + 1, end - offset - 1, sretval);
							}
							break;
						case '[':
							this._state = ST_BEFORE_INITIAL_ELEMENT;
							sretval = this.sink && this.sink.beginArray();
							if(sretval && sretval.then) {
								this.column += offset - lstart;
								return this._defer(chars, offset + 1, end - offset - 1, sretval);
							}
							break;
						case '"':
							tstart = offset + 1;
							this._state = ST_STRING;
							break;
						case '-':
							tstart = offset;
							this._state = ST_BEFORE_INT;
							break;
						case '0':
							tstart = offset;
							this._state = ST_AFTER_INT;
							break;
						default:
							if(c >= '1' && c <= '9') {
								tstart = offset;
								this._state = ST_WITHIN_INT;
							}
							this.column += offset - lstart;
							this._die('Expected value %, not code ' + chars.charCodeAt(offset));
							break;
					}
					break;
				case ST_NAME_F:
					//TODO
				case ST_NAME_FA:
					//TODO
				case ST_NAME_FAL:
					//TODO
				case ST_NAME_FALS:
					//TODO
				case ST_NAME_FALSE:
					//TODO
				case ST_NAME_T:
					//TODO
				case ST_NAME_TR:
					//TODO
				case ST_NAME_TRU:
					//TODO
				case ST_NAME_TRUE:
					//TODO
				case ST_NAME_N:
					//TODO
				case ST_NAME_NU:
					//TODO
				case ST_NAME_NUL:
					//TODO
				case ST_NAME_NULL:
					//TODO
				case ST_BEFORE_INITIAL_KEY:
					switch(c) {
						case '\n':
							++this.line;
							this.column = 1;
							lstart = offset + 1;
						case '\t':
						case '\r':
						case ' ':
							break;
						case '}':
							this._state = this._stack.length ? this._stack.pop() : ST_AFTER_DOCUMENT;
							sretval = this.sink && this.sink.endObject();
							if(sretval && sretval.then) {
								this.column += offset - lstart;
								return this._defer(chars, offset + 1, end - offset - 1, sretval);
							}
							break;
						case '"':
							tstart = offset + 1;
							this._state = ST_STRING;
							this._stack.push(ST_BEFORE_NAME_SEPARATOR);
							break;
						default:
							this.column += offset - lstart;
							this._die("Expected '\"' to start object member or '}' to end object %, not code "
									+ chars.charCodeAt(offset));
							break;
					}
					break;
				case ST_BEFORE_KEY:
					//TODO
				case ST_BEFORE_NAME_SEPARATOR:
					//TODO
				case ST_BEFORE_VALUE:
					//TODO
				case ST_BEFORE_MEMBER_SEPARATOR:
					//TODO
				case ST_BEFORE_INITIAL_ELEMENT:
					//TODO
				case ST_BEFORE_ELEMENT:
					//TODO
				case ST_BEFORE_ELEMENT_SEPARATOR:
					//TODO
				case ST_STRING:
				case ST_INSIDE_STRING:
					switch(c) {
						case '"':
							instr = this._state == ST_INSIDE_STRING;
							this._state = this._stack.pop();
							if(!this._string)
								strtmp = offset == tstart ? '' : chars.substring(tstart, offset);
							else {
								if(offset == tstart)
									strtmp = this._string;
								else
									strtmp = this._string + chars.substring(tstart, offset);
								this._string = null;
							}
							sretval = this.sink && (instr
									? this.sink.endString(strtmp) : this.sink.foundString(strtmp));
							if(sretval && sretval.then) {
								this.column += offset - lstart;
								return this._defer(chars, offset + 1, end - offset - 1, sretval);
							}
							break;
						case '\\':
							if(!this._string) {
								if(offset > tstart)
									this._string = chars.substring(tstart, offset);
							}
							else if(offset > tstart)
								this._string += chars.substring(tstart, offset);
							this._state = this._state == ST_INSIDE_STRING
									? ST_INSIDE_STRING_ESCAPE : ST_STRING_ESCAPE;
							break;
						default:
							if(c < ' ') {
								this.column += offset - lstart;
								this._die("Unescaped control character in string %: code "
										+ chars.charCodeAt(offset));
							}
							break;
					}
					break;
				case ST_STRING_ESCAPE:
				case ST_INSIDE_STRING_ESCAPE:
					strtmp = STRING_ESCAPE_MAP[c];
					if(strtmp) {
						if(!this._string)
							this._string = strtmp;
						else
							this._string += strtmp;
						tstart = offset + 1;
						this._state = this._state == ST_STRING_ESCAPE ? ST_STRING : ST_INSIDE_STRING;
					}
					else if(c == 'u') {
						this._digits = this._code = 0;
						this._state = this._state == ST_STRING_ESCAPE
								? ST_STRING_UNICODE : ST_INSIDE_STRING_UNICODE;
					}
					else {
						this.column += offset - lstart;
						this._die("Escape symbol must be followed by one of '\"', '\\', '/', 'b', 'f', "
								+ "'n', 'r', 't', or 'u' %, not code " + chars.charCodeAt(offset));
					}
					break;
				case ST_STRING_UNICODE:
				case ST_INSIDE_STRING_UNICODE:
					if(c >= '0' && c <= '9')
						this._code = this._code * 16 + chars.charCodeAt(offset) - CODE_0;
					else if(c >= 'a' && c <= 'f')
						this._code = this._code * 16 + chars.charCodeAt(offset) - CODE_a + 10;
					else if(c >= 'A' && c <= 'F')
						this._code = this._code * 16 + chars.charCodeAt(offset) - CODE_A + 10;
					else {
						this.column += offset - lstart;
						this._die("Unicode escape (\\uXXXX) must be specified by hexadecimal digits %, not code "
								+ chars.charCodeAt(offset));
					}
					if(++this._digits == 4) {
						if(!this._string)
							this._string = String.fromCharCode(this._code);
						else
							this._string += String.fromCharCode(this._code);
						tstart = offset + 1;
						this._state = this._state == ST_STRING_UNICODE ? ST_STRING : ST_INSIDE_STRING;
					}
					break;
				case ST_BEFORE_INT:
					//TODO
				case ST_WITHIN_INT:
					//TODO
				case ST_AFTER_INT:
					//TODO
				case ST_BEFORE_FRACTION:
					//TODO
				case ST_WITHIN_FRACTION:
					//TODO
				case ST_BEFORE_EXPONENT_SIGN:
					//TODO
				case ST_BEFORE_EXPONENT:
					//TODO
				case ST_WITHIN_EXPONENT:
					//TODO
				case ST_AFTER_DOCUMENT:
					//TODO
				default:
					throw new Error('Unrecognized JSONParser state: ' + this._state + ". We're DOOOOOOMED!");
			}
		}
		switch(this._state) {
			case ST_BEFORE_DOCUMENT:
			case ST_NONE:
			case ST_NAME_F:
			case ST_NAME_FA:
			case ST_NAME_FAL:
			case ST_NAME_FALS:
			case ST_NAME_FALSE:
			case ST_NAME_T:
			case ST_NAME_TR:
			case ST_NAME_TRU:
			case ST_NAME_TRUE:
			case ST_NAME_N:
			case ST_NAME_NU:
			case ST_NAME_NUL:
			case ST_NAME_NULL:
			case ST_BEFORE_INITIAL_KEY:
			case ST_BEFORE_KEY:
			case ST_BEFORE_NAME_SEPARATOR:
			case ST_BEFORE_VALUE:
			case ST_BEFORE_MEMBER_SEPARATOR:
			case ST_BEFORE_INITIAL_ELEMENT:
			case ST_BEFORE_ELEMENT:
			case ST_BEFORE_ELEMENT_SEPARATOR:
			case ST_STRING:
			case ST_INSIDE_STRING:
			case ST_STRING_ESCAPE:
			case ST_INSIDE_STRING_ESCAPE:
			case ST_STRING_UNICODE:
			case ST_INSIDE_STRING_UNICODE:
			case ST_BEFORE_INT:
			case ST_WITHIN_INT:
			case ST_AFTER_INT:
			case ST_BEFORE_FRACTION:
			case ST_WITHIN_FRACTION:
			case ST_BEFORE_EXPONENT_SIGN:
			case ST_BEFORE_EXPONENT:
			case ST_WITHIN_EXPONENT:
			case ST_AFTER_DOCUMENT:
			default:
				throw new Error('Unrecognized JSONParser state: ' + this._state + ". We're DOOOOOOMED!");
		}
		this.column += offset - lstart;
		return Promise.resolve(this);
	}

	_getLocation() {
		return 'at ' + (this.file ? this.file + ':' : '') + this.line + ':' + this.column;
	}

	_die(message) {
		const pos = message.indexOf('%');
		if(pos >= 0)
			message = message.substr(0, pos) + this._getLocation() + message.substr(pos + 1);
		throw new MalformedJSONException(this.file, this.line, this.column, message);
	}

	_defer(chars, offset, count, sinkPromise) {
		this._slate = sinkPromise.then(() => {
			this._slate = null;
			try {
				return count > 0 && this._pushStringImpl(chars, offset, count);
			}
			catch(error) {
				return Promise.reject(error);
			}
		});
		return this._slate.then(() => this);
	}

}

module.exports = JSONParser;
