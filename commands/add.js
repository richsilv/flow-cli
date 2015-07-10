var clc = require('cli-color'),
    _ = {
      forEach: require('lodash.forin'),
      isEmpty: require('lodash.isempty')
    },
    Future = require('fibers/future'),
    ejs = require('ejs'),
    Case = require('case'),
    path = require('path'),
    replace = Future.wrap(require('replace-in-file')),
    fs = Future.wrap(require('fs'));

var error = clc.red.bold,
    inform = clc.blue,
    strong = clc.bold,
    warning = clc.yellow,
    success = clc.green;

var add = function(db, type, names, options) {

  switch (type) {

    case 'routes':
      var routes = db.get('routes');
      names.forEach(function(name) {
        if (!routes[name]) {
          console.log(inform('Adding route ' + strong(name) + '...'));
          var routeScaffolding = ejs.render(fs.readFileSync(path.resolve(__dirname , '../templates/route.ejs'), 'utf8'), {name: name});
          db.set('routes', name, {});
          fs.appendFileSync(process.cwd() + '/lib/routes.js', routeScaffolding);
          console.log(success('DONE'));
        } else {
          console.log(warning('Route already exists (' + strong(name) + '), taking no action'));
        }
      });
      break;

    case 'methods':
      var methods = db.get('methods');
      names.forEach(function(name) {
        name = Case.camel(name);
        if (!methods[name]) {
          console.log(inform('Adding method ' + strong(name)));
          var methodScaffolding = ejs.render(fs.readFileSync(path.resolve(__dirname, '../templates/method.ejs'), 'utf8'), {name: name});
          db.set('methods', name, {});
          replace({
            files: [
              process.cwd() + '/client/method-stubs/method-stubs.js',
              process.cwd() + '/server/methods/methods.js'              
            ],
            replace: /\/\/ methods here/g,
            with: methodScaffolding
          }).wait();
          console.log(success('DONE'));
        } else {
          console.log(warning('Method already exists (' + strong(name) + '), taking no action'));
        }
      });
      break;

    case 'collections':
      var collections = db.get('collections');
      var target = parseTarget(options);
      names.forEach(function(name) {
        name = Case.camel(name);
        if (!collections[name]) {
          console.log(inform('Adding collection ' + strong(name) + ' to ' + target.name + '...'));
          var collectionScaffolding = ejs.render(fs.readFileSync(path.resolve(__dirname, '../templates/collection.ejs'), 'utf8'), {name: Case.pascal(name)});
          db.set('collections', name, {where: target.name});
          fs.writeFileSync(process.cwd() + target.path + '/' + target.collections + '/' + name + '.js', collectionScaffolding);
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
  return options.client ? {name: 'client', path: '/client', collections: 'collections-client'} : (
         options.server ? {name: 'server', path: '/server', collections: 'collections-server'} :
                          {name: 'both', path: '/lib', collections: 'collections-global'}
    );
}

module.exports = add;
