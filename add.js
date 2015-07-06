var clc = require('cli-color'),
    _ = {
      forEach: require('lodash.forin'),
      isEmpty: require('lodash.isempty')
    },
    Future = require('fibers/future'),
    ejs = require('ejs'),
    Case = require('case'),
    fs = Future.wrap(require('fs'));

var error = clc.red.bold,
    inform = clc.blue,
    strong = clc.bold,
    warning = clc.yellow,
    success = clc.green;

var add = function(db, type, names, options) {
  
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
      
    case 'method':
      break;
    
    case 'collection':
      var routes = db.get('collections');
      var target = parseTarget(options);
      names.forEach(function(name) {
        name = Case.camel(name);
        if (!collections[name]) {
          console.log(inform('Adding collection ' + strong(name) + ' to ' + target.name + '...'));
          var collectionScaffolding = ejs.render(fs.readFileSync(__dirname + '/templates/collection.ejs', 'utf8'), {name: Case.pascal(name)});
          db.set('collection', name, {where: target.name});
          fs.writeFileSync(process.cwd() + target.path + '/collections/' + name + '.js', collectionScaffolding);
          console.log(success('DONE'));
        } else {
          console.log(warning('Collection already exists (' + strong(name) + '), taking no action'));
        }
      });    
      break;
      
    default:
      console.log(error('Unrecognised option: ' + type));
      process.exit(1);
      break;
  }  
  

};
function parseTarget(options) {
  return options.client ? {name: 'client', path: '/client'} : (
         options.server ? {name: 'server', path: '/server'} : 
                          {name: 'both', path: '/lib'}
    );
}

module.exports = add;