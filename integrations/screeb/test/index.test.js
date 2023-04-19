'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var tester = require('@segment/analytics.js-integration-tester');
var Screeb = require('../lib/');
var sandbox = require('@segment/clear-env');

describe('Screeb', function() {
  var analytics;
  var options;
  var screeb;

  beforeEach(function() {
    options = {
      websiteId: 'website-id'
    };

    analytics = new Analytics();
    screeb = new Screeb(options);
    analytics.use(Screeb);
    analytics.use(tester);
    analytics.add(screeb);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    screeb.reset();
    sandbox();
  });

  it('should have the correct settings', function() {
    analytics.compare(
      Screeb,
      integration('Screeb')
        .global('$screeb')
        .option('websiteId', null)
        .tag('<script src="https://t.screeb.app/tag.js">')
        .readyOnLoad()
    );
  });

  describe('#initialize', function() {
    it('should create window.$screeb', function() {
      analytics.assert(!window.$screeb);
      screeb.initialize();
      analytics.assert(window.$screeb);
    });
    it('push init to $screeb', function() {
      screeb.initialize();
      analytics.equal(
        JSON.stringify(window.$screeb.q),
        JSON.stringify([{ 0: 'init', 1: 'website-id' }])
      );
    });
  });

  describe('#loaded', function() {
    it('should return `false` when Screeb is not loaded', function() {
      analytics.assert(screeb.loaded() === false);
    });

    it('should return `true` when Screeb is loaded', function() {
      window.$screeb = function() {};
      analytics.assert(screeb.loaded() === true);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window, '$screeb');
      });

      it('should set user identity', function() {
        var attrs = {
          name: 'Frida Kalo',
          email: 'frida.kalo@test.com',
          avatar: 'https://fake.it/avatar.jpg',
          hello: 'world'
        };
        analytics.identify('user-id', attrs);
        analytics.called(window.$screeb, 'identity', 'user-id', {
          name: 'Frida Kalo',
          firstname: 'Frida',
          lastname: 'Kalo',
          avatar: 'https://fake.it/avatar.jpg',
          email: 'frida.kalo@test.com',
          hello: 'world'
        });
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window, '$screeb');
      });

      it('should send an event', function() {
        analytics.track('event');
        analytics.called(window.$screeb, 'event.track', 'event');
      });

      it('should send an event with its payload', function() {
        analytics.track('event', {
          artist: 'Origin',
          album: 'Entity',
          song: 'Saligia'
        });
        analytics.called(window.$screeb, 'event.track', 'event', {
          artist: 'Origin',
          album: 'Entity',
          song: 'Saligia'
        });
      });
    });

    describe('#group', function() {
      beforeEach(function() {
        analytics.stub(window, '$screeb');
      });

      it('should send an id', function() {
        analytics.group('Songs');
        analytics.called(
          window.$screeb,
          'identity.group.assign',
          null,
          'Songs',
          {}
        );
      });

      it('should send an id and properties', function() {
        analytics.group('Songs', {
          artist: 'Origin',
          album: 'Entity',
          song: 'Saligia'
        });
        analytics.called(
          window.$screeb,
          'identity.group.assign',
          null,
          'Songs',
          {
            artist: 'Origin',
            album: 'Entity',
            song: 'Saligia'
          }
        );
      });

      it('should send set `group_type` as group type', function() {
        analytics.group('Songs', {
          artist: 'Origin',
          album: 'Entity',
          song: 'Saligia',
          group_type: 'favs'
        });
        analytics.called(
          window.$screeb,
          'identity.group.assign',
          'favs',
          'Songs',
          {
            artist: 'Origin',
            album: 'Entity',
            song: 'Saligia'
          }
        );
      });
    });
  });
});
