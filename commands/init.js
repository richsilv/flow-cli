var Future = require('fibers/future'),
    fs = require('fs'),
    path = require('path'),
    ejs = require('ejs'),
    jsondir = Future.wrap(require('jsondir')),
    _ = {
      forEach: require('lodash.forin')
    };

var dbSeedData = {
      'init': true,
      'routes': {},
      'collections': {},
      'methods': {}
    },
    dirStructure = getDirStructure();

var init = function(db) {
  if (!db.has('init') || !db.get('init')) {
    _.forEach(dbSeedData, function(val, key) {
      db.put(key, val);
    });
    jsondir.json2dirFuture(dirStructure);
  }
};

function getDirStructure() {
  var dirStructureRaw = fs.readFileSync(path.resolve(__dirname, '../templates/file-structure.json'), 'utf8'),
      dirStructure = JSON.parse(dirStructureRaw),
      renderTemplates = function(obj) {
        _.forEach(obj, function(val, key) {
          if (typeof val === 'object') renderTemplates(val);
          else if (key === '-template') {
            var templateName = obj['-template'];
            delete obj['-template'];
            obj['-content'] = ejs.render(fs.readFileSync(path.resolve(__dirname, '../templates/' + templateName), 'utf8'));
          }
        });
      };
  renderTemplates(dirStructure);
  return dirStructure;
}

module.exports = init;
