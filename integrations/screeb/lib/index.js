'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');

/**
 * Expose `Screeb` integration.
 *
 * https://screeb.app/
 */

var Screeb = (module.exports = integration('Screeb')
  .global('$screeb')
  .option('websiteId', null)
  .tag('<script async="true" src="https://t.screeb.app/tag.js">')
  .readyOnLoad());

/**
 * Initialize.
 *
 * https://github.com/ScreebApp/developers/wiki/Javascript-SDK-install
 *
 * @api public
 */

Screeb.prototype.initialize = function() {
  window.$screeb = function() {
    window.$screeb.q.push(arguments);
  };
  window.$screeb.q = [];
  window.$screeb('init', this.options.websiteId);

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Screeb.prototype.loaded = function() {
  return typeof window.$screeb === 'function';
};

/**
 * Identify.
 *
 * https://github.com/ScreebApp/developers/wiki/Javascript-SDK-Identity
 *
 * @api public
 * @param {Identify} identify
 */

Screeb.prototype.identify = function(identify) {
  var userId = identify.userId() || identify.email();
  var properties = identify.traits();

  delete properties.id;

  if (identify.email()) {
    properties.email = identify.email();
  }

  if (identify.name()) {
    properties.name = identify.name();
  }

  if (identify.firstName()) {
    properties.firstname = identify.firstName();
  }

  if (identify.lastName()) {
    properties.lastname = identify.lastName();
  }

  if (identify.avatar()) {
    properties.avatar = identify.avatar();
  }

  window.$screeb('identity', userId, properties);
};

/**
 * Track.
 *
 * https://github.com/ScreebApp/developers/wiki/Javascript-SDK-Event-tracking
 *
 * @api public
 * @param {Track} track
 */

Screeb.prototype.track = function(track) {
  window.$screeb('event.track', track.event(), track.properties());
};

/**
 * Group.
 *
 * https://github.com/ScreebApp/developers/wiki/Javascript-SDK-Group-assignation
 *
 * @api public
 * @param {Group} group
 */

Screeb.prototype.group = function(group) {
  var props = group.traits();
  var groupId = props.id;
  var groupType = props.group_type ? props.group_type : null;

  delete props.id;
  delete props.group_type;

  window.$screeb('identity.group.assign', groupType, groupId, props);
};
