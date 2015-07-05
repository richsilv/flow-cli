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
    ejs = require('ejs'),
    jsondir = Future.wrap(require('jsondir')),
    commands = {
      info: require('./info.js'),
      add: require('./add.js')
    };

var error = clc.red.bold,
    inform = clc.blue,
    strong = clc.bold,
    warning = clc.yellow,
    success = clc.green;

var db,
    dbSeedData = {
      'init': true,
      'routes': {}
    },
    dirStructure = getDirStructure();

// *********************************************
    
program
  .version('0.0.3');

program
  .action(function(env, options) {    
    program.help();
  });

program
  .command('init')
  .description('initialise project for flow-router scaffolding')
  .action(function() {    
    checkMeteorDir();
    console.log(inform('Initialising Flow-CLI project...'));
    setupDB();
    db.init();
    console.log(success('DONE'));
  });

program
  .command('info')
  .description('list entities currently associated with project')
  .action(function() {    
    checkMeteorDir();
    checkFlowCliInit();
    commands.info(db);
  });
  
program
  .command('add <type> [names...]')
  .description('adds one or more entities of type to project')
  .action(function(type, names) {
    checkMeteorDir();
    checkFlowCliInit();
    commands.add(db, type, names);    
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
  
  if (!process.argv.slice(2).length) program.help();
}).detach();

// *****************************************

function checkMeteorDir() {
  try {
    fs.statFuture(process.cwd() + '/.meteor/release').wait();
  } catch(e) {
    console.log(error('Not in a Meteor project root directory.'));
    process.exit(1);
  }    
}

function checkFlowCliInit() {
  setupDB();
  if (!db.has('init')) {
    console.log(warning('Initialise a Flow-CLI project with ' + strong('flow-cli init')));
    process.exit(1);
  }
}

function setupDB() {
  db = flatfile.sync('./.flow-cli/flow-cli.json');
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