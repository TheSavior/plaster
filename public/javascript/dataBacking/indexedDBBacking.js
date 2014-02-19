define(["dataBacking/localBacking", "db"], function(LocalBacking, db) {
  var IndexedDBBacking = LocalBacking.extend({
    _server: null,
    _files: null,

    // If we call other functions before the database is opened, 
    //these are the things we need to run
    _initCallbacks: null,

    init: function() {
      this._files = [];

      this._initCallbacks = [];

      db.open({
        server: 'draw',
        version: 1,
        schema: {
          files: {
            key: {
              keyPath: 'id',
            },
            indexes: {
              id: {
                unique: true
              },
              modifiedTime: {
                //keyPath: 'modifiedTime'
              }
            }
          }
        }
      })
        .done((function(server) {
          this._server = server;

          // Go through all our delayed callbacks
          for (var i = 0; i < this._initCallbacks.length; i++) {
            var callback = this._initCallbacks[i];
            callback.func.apply(this, callback.args);
          }

        }).bind(this))
        .fail(function(e) {
          console.error("Failed setting up database", e);
        });
    },

    getFiles: function(callback) {
      if (!this._server) {
        this._doLater(this.getFiles, [callback]);
        return;
      }

      if (!callback) {
        throw "You must specify a callback";
      }

      this._server.files.query('modifiedTime')
        .all()
        .desc()
        .execute()
        .done((function(results) {
          callback(results);
        }).bind(this));
    },

    getFile: function(fileId, callback) {
      if (!this._server) {
        this._doLater(this.getFile, [fileId, callback]);
        return;
      }

      this._server.files.query('id')
        .only(fileId)
        .execute()
        .done((function(results) {
          callback(results[0]);
        }).bind(this));
    },

    _getFileServer: function(fileId, callback) {
      if (this._files[fileId]) {
        callback(this._files[fileId]);
      } else {
        db.open({
          server: fileId,
          version: 1,
          schema: {
            localActions: {
              key: {
                keyPath: 'id',
                autoIncrement: true
              }
            },
            remoteActions: {
              key: {
                keyPath: 'id',
                autoIncrement: true
              }
            }
          }
        }).done((function(s) {
          this._files[fileId] = s;

          callback(s);
        }).bind(this))
          .fail(function(e) {
            console.error("Failed to create file database", e);
          });
      }
    },

    getFileActions: function(fileId, callback) {
      if (!this._server) {
        this._doLater(this.getFileActions, [fileId, callback]);
        return;
      }

      this._getFileServer(fileId, (function(server) {
        server.localActions.query()
          .all()
          .execute()
          .done((function(results) {
            callback(results);
          }).bind(this));
      }).bind(this));
    },

    createFile: function(fileId, callback) {
      if (!this._server) {
        this._doLater(this.createFile, [fileId, callback]);
        return;
      }

      if (!callback) {
        throw "You must specify a callback";
      }

      var fileId = fileId || this._getGuid();

      var file = {
        id: fileId,
        name: "Untitled File",
        modifiedTime: Date.now()
      }

      this._server.files.add(file)
        .done((function(items) {
          var item = items[0];

          this._getFileServer(item.id, (function(s) {
            callback(item);
          }).bind(this));

        }).bind(this))
        .fail(function(e) {
          console.error("fail to add file to file list", e);
        });
    },

    renameFile: function(fileId, newFileName) {
      if (!this._server) {
        this._doLater(this.renameFile, [fileId]);
        return;
      }

      this._server.files.query('id')
        .only(fileId)
        .modify({
          name: newFileName
        })
        .execute()
        .done((function(results) {
          this._updateFileModified(fileId);
        }).bind(this))
        .fail(function(e) {
          console.error("Couldn't find file", e);
        })
    },

    deleteFile: function(fileId) {
      if (!this._server) {
        this._doLater(this.deleteFile, [fileId]);
        return;
      }

      this._server.files.remove(fileId)
        .done(function(key) {
          // item removed
          var f = indexedDB.deleteDatabase(fileId);
          f.onerror = function(e) {
            console.error("Error deleting database", e);
          }

          // Delete settings from local storage
          delete localStorage[fileId];

        })
        .fail(function(e) {
          console.error("Failed to delete file from file table", fileId);
        });
    },

    replaceFileId: function(oldId, newId) {
      this.getFile(oldId, (function(oldFile) {

        var newFile = {
          id: newId,
          name: oldFile.name,
          modifiedTime: oldFile.modifiedTime
        };

        this._server.files.add(newFile)
          .done((function(items) {
            var item = items[0];

            this._getFileServer(item.id, (function(newServer) {

              this._getFileServer(oldId, (function(oldServer) {
                oldServer.localActions.query()
                  .all()
                  .execute()
                  .done((function(oldActions) {

                    var actionsCopied = 0;
                    console.log("final", oldActions);
                    if (oldActions.length == 0) {
                      this.deleteFile(oldId);
                    }
                    else
                    {
                      for (var i = 0; i < oldActions.length; i++) {
                        newServer.localActions
                          .add(oldActions[i])
                          .done((function(item) {
                            console.log("oldActions", oldActions, actionsCopied);
                            if (actionsCopied == oldActions.length - 1) {
                              debugger;
                              // this is the last one
                              this.deleteFile(oldId);
                            }
                            actionsCopied++;
                          }).bind(this))
                          .fail(function(e) {
                            console.error("fail to write", e);
                          });
                      }
                    }

                  }).bind(this));
              }).bind(this));
            }).bind(this));
          }).bind(this))
      }).bind(this));

      /*
      debugger;
      this._server.files.query('id')
        .only(oldId)
        .modify({
          id: newId
        })
        .execute()
        .done(function(results) {
          console.log("successfully changed id", results);
        })
        .fail(function(e) {
          console.error("Couldn't find file", e);
        });
*/
      // 
    },

    addAction: function(fileId, action) {
      this._getFileServer(fileId, (function(server) {
        server.localActions
          .add(action)
          .done((function(item) {
            // item stored
            this._updateFileModified(fileId);
          }).bind(this))
          .fail(function(e) {
            console.error("fail to write", e);
          });
      }).bind(this));
    },

    removeAction: function(fileId, actionIndex) {

      this._getFileServer(fileId, (function(server) {
        server.localActions
          .remove(actionIndex)
          .done((function(key) {
            // item removed
            this._updateFileModified(fileId);
          }).bind(this));
      }).bind(this));
    },

    _updateFileModified: function(fileId) {
      if (!this._server) {
        this._doLater(this.updateFileModified, [fileId, Date.now()]);
        return;
      }

      this._server.files.query('id')
        .only(fileId)
        .modify({
          modifiedTime: Date.now()
        })
        .execute()
        .done(function(results) {})
        .fail(function(e) {
          console.error("Couldn't find file", e);
        });
    },

    clearAll: function() {
      this.getFiles((function(files) {
        for (var i = 0; i < files.length; i++) {
          this.deleteFile(files[i].id);
        }
      }).bind(this));
    },

    _doLater: function(func, args) {
      this._initCallbacks.push({
        func: func,
        args: args
      })
    },
  });

  return IndexedDBBacking;
});