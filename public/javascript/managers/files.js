define(["section", "event", "sections/fileList", "sections/draw"], function(Section, Event, FileList, Draw) {

  var Files = Section.extend({
    id: "files",

    _paneWrapper: null,

    _screenWidth: 0,

    _defaultSettings: {},

    panes: null,

    currentPaneName: null,

    init: function() {
      this._super();

      this._defaultSettings = {
        title: {
          text: "Photos"
        }
      };

      this._screenWidth = window.innerWidth;

      this._paneWrapper = document.getElementById("files-pane-wrapper");

      this._finishedSliding = this._finishedSliding.bind(this);
      this._paneWrapper.addEventListener("webkitTransitionEnd", this._finishedSliding);

      this.panes = {};

      this.panes.list = {
        offsetX: 0,
        pane: new FileList(this)
      };

      this.panes.draw = {
        offsetX: this._screenWidth,
        pane: new Draw(this)
      };
      
      this.panes.draw.pane.element.style.webkitTransform = 'translate(' + this._screenWidth + "px, 0)";

      var state = {pane: "list", details: null};
      if (localStorage.filesPane) {
        state = JSON.parse(localStorage.filesPane);
      }

      this.setPane(state.pane, state.details);


      window.files = this;
    },

    setPane: function(pane, details) {
      if (this.currentPaneName == pane) 
        return;

      var paneobj = null;

      if (this.currentPaneName) {

        var paneobj = this.panes[this.currentPaneName].pane;

        if (paneobj.hide) {
          paneobj.hide();
        }

        paneobj.afterHide();
      }


      paneobj = this.panes[pane].pane;
      
      if (paneobj.show) {
        paneobj.show(details);
      }

      paneobj.afterShow();

      this.currentPaneName = pane;


      // Finish up
      
      var totalPane = this.panes[pane];
      this._paneWrapper.classList.add("ani4");
      this._paneWrapper.style.webkitTransform = "translate3d(-"+totalPane.offsetX+"px, 0px, 0px)";        

      if (pane == "list") {
        delete localStorage["filesPane"];
      }
      else
      {
        localStorage.filesPane = JSON.stringify({pane: pane, details: details});
      }
      /*
      this.navbarSettings = Helpers.mergeNavbarSettings(this._defaultSettings, totalPane.pane.navbarSettings);
      Event.trigger("paneChanged", {
        pane: this
      });
      */
    },

    _finishedSliding: function() {
      this._paneWrapper.classList.remove("ani4");
    }
  });

  return Files;

});