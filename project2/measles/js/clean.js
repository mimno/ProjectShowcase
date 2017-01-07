/** Removes non-ASCII characters from a string **/
var trimNonAscii = function(str) {
	return str.trim().replace(/[^A-Za-z 0-9\.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')
}

/** Trim off non-ASCII characters from keys.**/
var trimKeys = function(rows) {
	return rows.map(function(row) {
		for (var prop in row) {
			var trimmed = trimNonAscii(prop);
			if (trimmed != prop) {
				row[trimmed] = row[prop];
				delete row[prop];
			}
		}
		return row;
	})
}

/** Delete blank rows and non-state rows **/
var trimExcessRows = function(rows) {
	return rows.filter(function(row) {
		var name = trimNonAscii(row['Region']);
		return name != '' && (nameToAbbr(name));
	})
}

/** Given an array representing data from a .csv file, parse all data into float, if possible. 
(i.e. leave all non-number strings like state name or phrase 'NA').
Also trim non-ASCII characters from data (useful for removing asterisks from region names) **/
var toFloatData = function(rows) {
	return rows.map(function(row) {
			//iterate over each property in a region that is its own property (i.e. not porperty of a prototype)
			for (var prop in row) {
				if (row.hasOwnProperty(prop)) {
					var floated = parseFloat(row[prop]);
					//if this doesn't parse to a NaN, then change it to the float
					if (isNaN(floated)) {row[prop] = trimNonAscii(row[prop]); }
					else { row[prop] = floated; }
				};
			};
			return row; 
			}) ;
}

var cleanData = function(data) {
	return trimKeys(toFloatData(trimExcessRows(data)));
}