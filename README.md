# flow-router-cli
Command-line scaffolding tool designed for use with Meteor's Flow Router.  Heavily inspired by [meteor-em](https://www.npmjs.com/package/meteor-em) which is now [iron-cli](https://github.com/iron-meteor/iron-cli).

### THIS IS WIP - PLEASE REPORT BUGS AND FILE FEATURE REQUESTS ON THE ISSUES PAGE

## USAGE

```
$ npm install flow-router-cli -g
$ flow-cli --help
```

### Usage

```
flow-cli [options] [command]
```

### Commands

* **init** - initialise project for Flow-CLI
* **info** - list entities associated with project
* **remove <type> [names...]** - remove entities from Flow-CLI register
* **add [options] <type> [names...]** - add entities to the project

### Options

* **-h, --help** - output usage information
* **-V, --version** - output the version number

### Available entity types

**routes**, **methods**, **collections**

### Example

```
$ flow-cli init
$ flow-cli add routes myRoute1 myRoute2 ...
$ flow-cli info
```
