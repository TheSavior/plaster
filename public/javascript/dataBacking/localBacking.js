define(["dataBacking/baseBacking"], function(BaseBacking) {
  var LocalBacking = BaseBacking.extend({
    init: function() {
      throw "Do not use this class without extending it";
    },

    getFiles: function(callback) {
      console.error("Implement this function");
    },

    getFileActions: function(fileId, callback) {
      console.error("Implement this function");
    },

    createFile: function(fileId, callback) {
      console.error("Implement this function");
    },

    renameFile: function(fileId, newFileName) {
      console.error("Implement this function");
    },

    deleteFile: function(fileId) {
      console.error("Implement this function");
    },

    replaceFileId: function(oldId, newId) {
      console.error("Implement this function");
    },

    // add the action to local store
    addLocalAction: function(fileId, action) {
      console.error("Implement this function");
    },



    removeLocalAction: function(fileId, actionId) {
      console.error("Implement this function");
    },

    // a remote action came in, save it to index
    // making sure everything else is in order
    addRemoteAction: function(fileId, index, action) {
      console.error("Implement this function");
    },

    // remove the last action
    removeLocalAction: function(fileId, actionId) {
      console.error("Implement this function");
    },

    removeRemoteAction: function(fileId, actionId) {
      console.error("Implement this function");
    },

    // local only
    clearAll: function() {
      console.error("Implement this function");
    }
  });

  return LocalBacking;
});