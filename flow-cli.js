#!/usr/bin/env node

var Future = require('fibers/future'),
    program = require('commander'),
    clc = require('cli-color'),
    flatfile = require('flat-file-db'),
    _ = {
      forEach: require('lodash.forin'),
      isEmpty: require('lodash.isempty')
    },
    fs = Future.wrap(require('fs')),
    handlebars = require('node-handlebars'),
    ejs = require('ejs'),
    jsondir = Future.wrap(require('jsondir'));

var error = clc.red.bold,
    info = clc.blue,
    strong = clc.bold,
    warning = clc.yellow,
    success = clc.green;

var db = flatfile.sync('./.flow-cli/flow-cli.json'),
    dbSeedData = {
      'init': true,
      'routes': {}
    },
    dirStructure = getDirStructure();
    
process.on('exit', function() {
  db.close();
});
    
db.init = function() {
  if (!db.has('init') || !db.get('init')) {
    _.forEach(dbSeedData, function(val, key) {
      db.put(key, val);
    });
    jsondir.json2dirFuture(dirStructure);
  }
};
db.set = function(item, key, val) {
  var current = db.get(item);
  if (current) {
    current[key] = val;
    db.put(item, current);
  } else {
    db.put(item, {key: val});
  }
};

var hbs = Future.wrap(handlebars.create({}));

program
  .version('0.0.1');

program
  .action(function(env, options) {    
    program.help();
  });

program
  .command('init')
  .description('initialise project for flow-router scaffolding')
  .action(function() {    
    checkMeteorDir();
    console.log(info('Initialising Flow-CLI project...'));
    db.init();
    console.log(success('DONE'));
  });

program
  .command('info')
  .description('list entities currently associated with project')
  .action(function() {    
    checkMeteorDir();
    checkFlowCliInit();
    console.log(info('Current Routes are: ' + Object.getOwnPropertyNames(db.get('routes'))));
  });
  
program
  .command('add <type> [names...]')
  .description('adds one or more entities of type to project')
  .action(function(type, names) {
    checkMeteorDir();
    checkFlowCliInit();
    
    switch (type) {
      case 'route':
        var routes = db.get('routes');
        names.forEach(function(name) {
          if (!routes[name]) {
            console.log(info('Adding route ' + strong(name) + '...'));
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
    
  });
  
program.on('--help', function(){
  console.log('  Example:');
  console.log('');
  console.log('    $ flow-cli init');
  console.log('    $ flow-cli add route myRoute1 myRoute2 ...');
  console.log('    $ flow-cli info');  
  console.log('');
});
  
Future.task(function() {
  program.parse(process.argv);
  
  if (!process.argv.slice(2).length) {
    program.outputHelp();
    return;
  }
}).detach();

function checkMeteorDir() {
  try {
    fs.statFuture(process.cwd() + '/.meteor/release').wait();
  } catch(e) {
    console.log(error('Not in a Meteor project root directory.'));
    process.exit(1);
  }    
}

function checkFlowCliInit() {
  if (!db.has('init')) {
    console.log(warning('Initialise a Flow-CLI project with ' + strong('flow-cli init')));
    process.exit(1);
  }
}

function getDirStructure() {
  var dirStructureRaw = fs.readFileSync(__dirname + '/templates/file-structure.json', 'utf8'),
      dirStructure = JSON.parse(dirStructureRaw),
      renderTemplates = function(obj) {
        _.forEach(obj, function(val, key) {
          if (typeof val === 'object') renderTemplates(val);
          else if (key === '-template') {
            var templateName = obj['-template'];
            delete obj['-template'];
            obj['-content'] = ejs.render(fs.readFileSync(__dirname + '/templates/' + templateName, 'utf8'));
          }
        });
      };
  renderTemplates(dirStructure);
  return dirStructure;
}