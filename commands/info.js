var Table = require('cli-table'),
    clc = require('cli-color'),
    _ = {
      forEach: require('lodash.forin'),
      isEmpty: require('lodash.isempty')
    };
 
var info = function(db) {
  
  console.log(clc.blue('Flow Router CLI entities:'));
  var added = false;
  
  ['routes', 'collections', 'methods'].forEach(function(entType) {
    var entries;
    if (db.has(entType)) {
      entries = db.get(entType);
      if (!_.isEmpty(entries)) {
        added = true;
        var numCols = Object.keys(entries[Object.keys(entries)[0]]).length + 1;
        var head = [entType].concat(Array.apply(null, new Array(numCols - 1)).map(function(){return '';}));
        var table = new Table({
          head: [entType],
          colWidths: Array.apply(null, new Array(numCols)).map(function(){return 30;})
        });
        _.forEach(entries, function(val, key) {
          var row = [key];
          _.forEach(val, function(subVal) { row.push(subVal); });
          table.push(row);
        });
        console.log(table.toString());
        console.log('');
      }
    }
  });
  
  if (!added) console.log(clc.yellow.bold('None'));
  
};

module.exports = info;