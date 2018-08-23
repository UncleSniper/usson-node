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
const ST_STRING_UNICODE = 26;
const ST_BEFORE_INT = 27;
const ST_WITHIN_INT = 28;
const ST_AFTER_INT = 29;
const ST_BEFORE_FRACTION = 30;
const ST_WITHIN_FRACTION = 31;
const ST_BEFORE_EXPONENT_SIGN = 32;
const ST_BEFORE_EXPONENT = 33;
const ST_WITHIN_EXPONENT = 34;
const ST_AFTER_DOCUMENT = 35;

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
		var c, tstart = offset, lstart = offset, sretval;
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
							this._die('Expected value %, not code ' + chars.charCodeAt(offset));
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
					//TODO
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
					//TODO
				case ST_INSIDE_STRING:
					//TODO
				case ST_STRING_ESCAPE:
					//TODO
				case ST_STRING_UNICODE:
					//TODO
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
			case ST_STRING_ESCAPE:
			case ST_STRING_UNICODE:
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
