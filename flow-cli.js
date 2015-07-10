#!/usr/bin/env node

var Future = require('fibers/future'),
    program = require('commander'),
    clc = require('cli-color'),
    flatfile = require('flat-file-db'),
    _ = {
      forEach: require('lodash.forin'),
      isEmpty: require('lodash.isempty'),
      pick: require('lodash.pick')
    },
    fs = Future.wrap(require('fs')),
    ejs = require('ejs'),
    commands = {
      init: require('./commands/init.js'),
      info: require('./commands/info.js'),
      add: require('./commands/add.js'),
    };

var error = clc.red.bold,
    inform = clc.blue,
    strong = clc.bold,
    warning = clc.yellow,
    success = clc.green;

var db;

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
    commands.init(db);
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
  .option('-s, --server', 'add only to server code')
  .option('-c, --client', 'add only to client code')
  .option('-b, --both', 'add to both client and server (default)')
  .action(function(type, names, options) {
    checkMeteorDir();
    checkFlowCliInit();
    commands.add(db, type, names, _.pick(options, ['client', 'server']));
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
