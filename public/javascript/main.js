function init() {
  window.log = console.log.bind(console);

  window.addEventListener("wheel", function(e) {
    e.preventDefault();
  });

  require(["promise", "event", "globals", "helpers", "migrate", "managers/files", "gauth"], function(Promise, Event, g, Helpers, Migrate, FilesManager, GAuth) {
    Migrate.run()
    .then((function() {
      g.setHTMLDevices();

      var manager = new FilesManager();
      manager.show();
      manager.afterShow();

    }).bind(this))
    .catch(function(error) {
      console.error(error.stack, error);
    });

    window.addEventListener("resize", function() {
      // make sure we are scrolled to 0. Without this there are problems
      // when changing device orientation
      window.scroll(0, 0);
      setHeight();
    });

    function setHeight() {
      document.body.style.height = window.innerHeight + "px";
    }

    setHeight();
  });
}

if (document.readyState === "interactive" || document.readyState === "complete") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init, false);
}


if (!window.Promise) {
  require(["promise"], function(Promise) {
    window.Promise = Promise;
  });
}

window.gapiLoaded = function() {
  require(["online"], function(Online) {
    Online.gapiLoaded();
  });
}

window.gapiLoadError = function() {
  require(["online"], function(Online) {
    Online.gapiLoadError();
  });
}

window.applicationCache.addEventListener("updateready", function() {
  require(["cacheHandler"], function(CacheHandler) {
    CacheHandler.updateReady();
  });
});