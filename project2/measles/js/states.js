statesAbbr = [
	  ["US National", "US", "US", ''],
	  ["Alabama","AL","Ala.",1],
	  ["Alaska","AK","Alaska",2],
	  ["Arizona","AZ","Ariz.",4],
	  ["Arkansas","AR","Ark.",5],
	  ["California","CA","Calif.",6],
	  ["Colorado","CO","Colo.",8],
	  ["Connecticut","CT","Conn.",9],
	  ["Delaware","DE","Del.",10],
	  ["Dist. of Columbia","DC","D.C.",11],
	  ["Florida","FL","Fla.",12],
	  ["Georgia","GA","Ga.",13],
	  ["Hawaii","HI","Hawaii",15],
	  ["Idaho","ID","Idaho",16],
	  ["Illinois","IL","Ill.",17],
	  ["Indiana","IN","Ind.",18],
	  ["Iowa","IA","Iowa",19],
	  ["Kansas","KS","Kan.",20],
	  ["Kentucky","KY","Ky.",21],
	  ["Louisiana","LA","La.",22],
	  ["Maine","ME","Maine",23],
	  ["Maryland","MD","Md.",24],
	  ["Massachusetts","MA","Mass.",25],
	  ["Michigan","MI","Mich.",26],
	  ["Minnesota","MN","Minn.",27],
	  ["Mississippi","MS","Miss.",28],
	  ["Missouri","MO","Mo.",29],
	  ["Montana","MT","Mont.",30],
	  ["Nebraska","NE","Neb.",31],
	  ["Nevada","NV","Nev.",32],
	  ["New Hampshire","NH","N.H.",33],
	  ["New Jersey","NJ","N.J.",34],
	  ["New Mexico","NM","N.M.",35],
	  ["New York","NY","N.Y.",36],
	  ["North Carolina","NC","N.C.",37],
	  ["North Dakota","ND","N.D.",38],
	  ["Ohio","OH","Ohio",39],
	  ["Oklahoma","OK","Okla.",40],
	  ["Oregon","OR","Ore.",41],
	  ["Pennsylvania","PA","Pa.",42],
	  ["Rhode Island","RI","R.I.",44],
	  ["South Carolina","SC","S.C.",45],
	  ["South Dakota","SD","S.D.",46],
	  ["Tennessee","TN","Tenn.",47],
	  ["Texas","TX","Texas",48],
	  ["Utah","UT","Utah",49],
	  ["Vermont","VT","Vt.",50],
	  ["Virginia","VA","Va.",51],
	  ["Washington","WA","Wash.",53],
	  ["West Virginia","WV","W.Va.",54],
	  ["Wisconsin","WI","Wis.",55],
	  ["Wyoming","WY","Wyo.",56]
	]


var nameToFips = function(name) {
	var fips = 0;
	statesAbbr.forEach(function(state) {
		if (state[0] == name) {
			fips = state[3];
		}
	})
	return fips;
}

var nameToAbbr = function(name) {
	var abbr = '';
	statesAbbr.forEach(function(state) {
		if (state[0] == name) {
			abbr = state[1];
		}
	})
	return abbr;
}

var fipsToName = function(fips) {
	//fips of 72 or 78 are asking about Peurto Rico and the Virgin Islands; ignore them
	if (fips == 72 || fips == 78) { return ''; }

	var name = '';
	statesAbbr.forEach(function(state) {
		if (state[3] == fips) {
			name = state[0];
		}
	})
	if (name == '') { console.log('no name for fips ' + fips)};
	return name;
}

var fipsToAbbr = function(fips) {
	//fips of 72 or 78 are asking about Peurto Rico and the Virgin Islands; ignore them
	if (fips == 72 || fips == 78) { return ''; }

	var abbr = '';
	statesAbbr.forEach(function(state) {
		if (state[3] == fips) {
			abbr = state[1];
		}
	})
	return abbr;
}

var abbrToName = function(abbr) {
	var name = '';
	statesAbbr.forEach(function(state) {
		if (state[1] == abbr) {
			name = state[0];
		}
	})
	return name;	
}