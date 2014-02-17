define(["class"], function(Class) {
  var BaseBacking = Class.extend({
    init: function() {
      throw "Do not use this class without extending it";
    },

    getFiles: function(callback) {
      console.error("Implement this function");
    },

    getFile: function(fileId, callback) {
      console.error("Implement this function");
    },

    getFileActions: function(fileId, callback) {
      console.error("Implement this function");
    },

    createFile: function(callback) {
      console.error("Implement this function");
    },

    renameFile: function(fileId, newFileName) {
      console.error("Implement this function");
    },

    deleteFile: function(fileId) {
      console.error("Implement this function");
    },

    addAction: function(fileId, action) {
      console.error("Implement this function");
    },

    removeAction: function(fileId, actionIndex) {
      console.error("Implement this function");
    },

    clearAll: function() {
      console.error("Implement this function");
    },
  });

  return BaseBacking;
});