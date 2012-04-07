/*
 * eventlog.js: Transport for outputting to the Windows Event Log
 *
 * (C) 2012 Jose Fernando Romaniello
 * MIT LICENCE
 *
 */

var events = require('events'),
    util = require('util'),
    Transport = require('winston').Transport,
    exec = require("child_process").exec,
    levelsMap = {"info": "information", "warn": "warning", "warning": "warning", "error": "error"},
    isWindows = require("os").platform() === "win32";

//
// ### function EventLog (options)
// #### @options {Object} Options for this instance.
// Constructor function for the EventLog transport object responsible
// for persisting log messages and metadata to the windows event log.
//
var EventLog = exports.EventLog = function (options) {
  Transport.call(this, options);
  options = options || {};
  
  this.name      = 'eventlog';
  this.eventlog  = options.eventlog || "application"; //system is also valid.
  this.appName  = options.appName || "node"; //system is also valid
  this.json      = options.json     || false;
  this.timestamp = typeof options.timestamp !== 'undefined' ? options.timestamp : false;
  
  if (this.json) {
    this.stringify = options.stringify || function (obj) {
      return JSON.stringify(obj, null, 2);
    };
  }
};

//
// Inherit from `winston.Transport`.
//
util.inherits(EventLog, Transport);

//
// Expose the name of this Transport on the prototype
//
EventLog.prototype.name = 'eventlog';

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
EventLog.prototype.log = function (level, msg, meta, callback) {
  if (this.silent || !isWindows) {
    return callback(null, true);
  }

  var self = this,
      output,
      message = msg + (meta ? ("" + "metadata: " + JSON.stringify(meta)) : ""),
      mapedlevel = levelsMap[level] || "information";

  exec("eventcreate /t " + mapedlevel + " /id 100 /l " + this.eventlog + " /d \"" + message + "\" /so " + this.appName, function(err, stdout, stderr){
    self.emit('logged');
  });


  callback(null, true);
};

exports.config = require("./windowslogs-config");