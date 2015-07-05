var clc = require('cli-color'),
    _ = {
      forEach: require('lodash.forin'),
      isEmpty: require('lodash.isempty')
    },
    Future = require('fibers/future'),
    ejs = require('ejs'),
    fs = Future.wrap(require('fs'));

var error = clc.red.bold,
    inform = clc.blue,
    strong = clc.bold,
    warning = clc.yellow,
    success = clc.green;

var add = function(db, type, names) {
  
  switch (type) {
    case 'route':
      var routes = db.get('routes');
      names.forEach(function(name) {
        if (!routes[name]) {
          console.log(inform('Adding route ' + strong(name) + '...'));
          var routeScaffolding = ejs.render(fs.readFileSync(__dirname + '/templates/route.ejs', 'utf8'), {name: name});
          db.set('routes', name, {});
          fs.appendFileSync(process.cwd() + '/lib/routes.js', routeScaffolding);
          console.log(success('DONE'));
        } else {
          console.log(warning('Route already exists (' + strong(name) + '), taking no action'));
        }
      });
      break;
    default:
      console.log(error('Unrecognised option: ' + type));
      process.exit(1);
      break;
  }  
  
};

module.exports = add;