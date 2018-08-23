'use strict';

class MalformedJSONException extends Error {

	constructor(file, line, column, message) {
		super(message);
		this.jsonFile = file;
		this.jsonLine = line;
		this.jsonColumn = column;
	}

}

module.exports = MalformedJSONException;
