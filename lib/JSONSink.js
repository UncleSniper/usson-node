'use strict';

class JSONSink {

	constructor() {}

	foundBoolean(value) {}

	foundNull() {}

	foundString(value) {}

	beginString(piece) {}

	continueString(piece) {}

	endString(piece) {}

	foundInteger() {}

	foundFraction() {}

	beginObject() {}

	endObject() {}

	beginArray() {}

	endArray() {}

}

module.exports = JSONSink;
