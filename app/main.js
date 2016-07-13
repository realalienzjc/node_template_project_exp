"use strict";

var text = "Injected from Javascript!!!";

document.getElementById('response').innerHTML = text;

// example code from https://www.sitepoint.com/getting-started-browserify/ 
// require module
var _ = require('underscore'),
	names = require('./js/names.js'),
    findSuperman = require('./js/findsuperman.js');

if (findSuperman(_)) {
  document.write('We found Superman!');
} else {
  document.write('No Superman...!');
}





// TODO: require a folder of js, HINT: Browserify-shim