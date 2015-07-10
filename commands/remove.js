var Table = require('cli-table'),
    clc = require('cli-color'),
    _ = {
      forEach: require('lodash.forin'),
      isEmpty: require('lodash.isempty')
    };
 
var error = clc.red.bold,
    inform = clc.blue,
    strong = clc.bold,
    warning = clc.yellow,
    success = clc.green; 
 
var remove = function(db, type, names) {
  
  var dir = db.get(type),
      removed = false;
  if (!dir) {
    console.log(error('Bad entity type: ' + type));
    process.exit(1);
  }
  _.forEach(names, function(name) {
    if (name in dir) {
      removed = true;
      console.log(inform('Removing ' + name + ' from ' + type));
      delete dir[name];      
    } else console.log(warning('Cannot find ' + name + ' in ' + type + ' to remove'));
  });
  db.put(type, dir);
  if (removed) console.log(warning('Note that this has only removed these items from the Flow-CLI registry, not from your code.'));
  
};

module.exports = remove;