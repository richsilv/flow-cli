var Table = require('cli-table'),
    _ = {
      forEach: require('lodash.forin'),
      isEmpty: require('lodash.isempty')
    };
 
var info = function(db) {
    
  ['routes', 'collections', 'methods'].forEach(function(entType) {
    var entries;
    if (db.has(entType)) {
      entries = db.get(entType);
      if (!_.isEmpty(entries)) {
        var table = new Table({
          head: [entType],
          colWidths: [30]
        });
        _.forEach(entries, function(val, key) {
          table.push([key]);
        });
        console.log(table.toString());
        console.log('');
      }
    }
  });    
  
};

module.exports = info;