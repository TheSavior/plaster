require(["event", "globals", "managers/login"], function(Event, g, LoginManager) {

  function init() {
    window.log = console.log.bind(console);

    document.addEventListener("touchmove", function(e) {
      e.preventDefault();
    });

    window.addEventListener("mousewheel", function(e) {
      //e.preventDefault();
    });

    g.setHTMLDevices();

    var loginManager = new LoginManager();
    window.login = loginManager;

    window.addEventListener("resize", function() {
      // make sure we are scrolled to 0. Without this there are problems 
      // when changing device orientation
      window.scroll(0,0);
    })
  }

  if (document.readyState === "interactive" || document.readyState === "complete") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init, false);
  }
});