/* 
  Copyright (c) 2009 Caleb Crane <license [at] simulacre.org>, Simulacre Publishing LLC

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.
  
  Except as contained in this notice, the name(s) of the above 
  copyright holders shall not be used in advertising or otherwise 
  to promote the sale, use or other dealings in this Software 
  without prior written authorization.
  
  The end-user documentation included with the redistribution, if 
  any, must include the following acknowledgment: "This product 
  includes software developed by Simulacre Publishing LLC 
  (http://www.simulacre.org/) and its contributors", in the same 
  place and form as other third-party acknowledgments. Alternately, 
  this acknowledgment may appear in the software itself, in the same
  form and location as other such third-party acknowledgments.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
*/
if(!!Impel == false)
  var Impel = new Class({});



Impel.inTouch = new Class({
  /** @lends Impel.inTouch.prototype */
  Implements  : [Options,Events],
  options     : { 
                  name              : "Impel_inTouch",
                  displayName       : "Impel inTouch",
                  maxSize           : 4096,
                  baseURL           : null,
                  versionsFile      : 'versions.json.php',
                  tableFileSuffix   : '.json.php'
                },
  versions  : $H({}),
  loaded    : false,
  /**
   * Keep a local  HTML5 SQL database in sync with one published by your server.
   * <p>Impel.inTouch is used by the forthcoming HTML5 Javascript ORM, Impel, but you can use it separately without any trouble</p>
   *   
   *
   *
   * <h2>Using Impel.inTouch</h2>
   * <p>Impel.inTouch makes it simple to keep your client's HTML5 databases up-to-date. The first time it is used on a client's computer it will connect to your server, download the latest schema and data then import it into the local HTML5 database. Every other time the client connects to your site, or loads a cached version of it, Impel.inTouch will quickly verify that it has the latest schema and data then pass off to the rest of your web application. All you need to do to update the HTML5 databases on your client's machines is update the schema published by your server. All your client's will download the new data the very next time they fire up your web application.</p>
   * <p>It's all completely transparent to your clients and painless for you.</p>
   * <p>You do need to do a little bit of preparation though.</p>
   * <ul>
   *  <li>Setup a versions file on the server</li>
   *  <li>Setup a table definition file for each table that should be imported/updated by the client</li>
   *  <li>Include Impel.inTouch in an html file and instantiate it</li>
   * </ul>
   *
   * <p>Tables can be updated in one of two ways:</p>
   *  <ol>
   *    <li>Single Update: no matter what the current version of the table is it will be updated to the absolute latest version.</li>
   *    <li>Incremental Update: the table will be updated to the next most recent version then the next most recent, and so on until it is at the latest version.</li>
   *  </ol>   
   *
   * <h3>Setup a versions file</h3>
   *  <p>The versions file contains a JSON encoded array of objects that define the tables and their versions. The array has to be enclosed in a function call to a callback that will be specified as part of the query string. By default the versions file is named versions.json.php, but you can change that when you instantiate an Impel.inTouch object.</p>
   *  <p>If you want the table to be updated in a single request then its entry in the versions file must consist of a table key and a <em>version</em> key. The version key's value should simply be the most recent version number.</p>
   *  <p>If you want the table to be updated incrementally then its entry in the versions file must consist of a table key and a <em>versions</em> key. The versions key's value should be an array of ALL the versions of the table.</p>
   * <pre>versions.json.php</pre>
   * <pre class="code brush: js;">
   * <&#x3f;php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>
   *
   * <&#x3f;php echo $callback?>([{ "table" : "card",         "version" : 1}, 
   *                          { "table" : "stack",        "version" : 1}, 
   *                          { "table" : "similar_card", "version" : 1}, 
   *                          { "table" : "card_score",   "version" : 1},
   *                          { "table" : "player",     "versions" : [1,2,3,4,5,6,7]},
   *                          ]);
   * </pre>
   *
   *
   * <h3>Setup table definition file(s)</h3>
   * <p>Every table that you want to have created/updated on your client's browser must have an associated definition file. The file must have the same name as the table in the versions file. By default the suffix for the table file should be .json.php, but you can specify a different suffix when you instantiate an Impel.inTouch object.</p>
   * <p><strong>Important note </strong> If a table is to be updated incrementally rather than in a single update the name of the table and the suffix must be seperated by "_[table_version]" for each version of the table. So in the example above, where the player table has seven versions, we would need seven files: palyer_1.json.php, palyer_2.json.php, player_3.json.php, etc.,. </p>
   *
   * <p>Each table definition file must contain a JSON encoded object as an argument to a callback that will be specified as part of the request's query string. The object may include six key/value pairs; four of which (create, data, pre-create, and extra) are optional. The rest, (version, and table) are required, but for your update to have any effect you will need to define either <em>create</em>, or <em>data</em></p>
   * <ul>
   * 	<li><span class="type">{String}</span> <span class="param">table</span> The name of the table</li>
   * 	<li><span class="type">{Int}</span> <span class="param">version</span> The version of table and its data</li>
   * 	<li><span class="type">{String[]}</span> [<span class="param">pre-create</span>] An array of SQL statements to execute before going on to the create string</li>
   * 	<li><span class="type">{String}</span> [<span class="param">create</span>] An SQL statement used to create the table</li>
   * 	<li><span class="type">{String[]}</span> [<span class="param">extra</span>] An array of SQL statements used to modify the table after it has been created, but before data has been loaded</li>
   * 	<li><span class="type">{String[]}</span> [<span class="param">data</span>] Array of INSERT, UPDATE, or DELETE statements used to fill the table</li>
   * </ul>
   * <pre>card.json.php:</pre>
   * <pre class="code brush: js;">
   * <&#x3f;php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>
   *
   * <&#x3f;php echo $callback?>({
   *   "version" : 1,
   *   "table": "card",
   *   "pre-create" : ["DROP TABLE IF EXISTS `card`"],
   *   "create": "CREATE TABLE IF NOT EXISTS `card` (`id` INTEGER PRIMARY KEY, `kanji` varchar(255) default NULL, `hatsuon` varchar(255) default NULL, `meaning` varchar(255) default NULL, `level` int(11) default NULL, `created_at` datetime default NULL, `updated_at` datetime default NULL);",
   *   
   *   "extra" : ["CREATE INDEX IF NOT EXISTS card_I_1 ON card(kanji);", 
   *              "CREATE INDEX IF NOT EXISTS card_I_2 ON card(hatsuon);"],
   *   
   *   "data" : ["INSERT INTO `card` VALUES(119, '席', 'せき', 'seat; ones place; meeting place; hall; meeting', 2, '2009-02-28 06:44:13', '2009-03-02 01:28:51');",
   *            　"INSERT INTO `card` VALUES(120, '印', 'いん,じるし', 'mark; imprint; sign; seal; stamp', 2, '2009-02-28 06:44:14', '2009-02-28 06:44:14');"]
   *   }); 
   * </pre>
   *
   *
   * <pre>player_6.json.php:</pre>
   * <pre class="code brush: js;">
   * <&#x3f;php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>
   *
   * <&#x3f;php echo $callback?>({
   *   "version" : 6,
   *   "table": "player",
   *   "data" : ["INSERT INTO `player` VALUES(760, 'Bugssy Two-Tone', '2009-01-21 16:47:13');",
   *             "INSERT INTO `player` VALUES(761, 'Bill Brass-Knuckles Malone', '2009-01-22 13:22:56');"]
   *   }); 
   * </pre>
   *
   * <pre>player_7.json.php:</pre>
   * <pre class="code brush: js;">
   * <&#x3f;php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>
   *
   * <&#x3f;php echo $callback?>({
   *   "version" : 7,
   *   "table": "player",
   *   "data" : ["INSERT INTO `player` VALUES(762, 'Johnny Good', '2009-02-28 06:44:13');",
   *             "INSERT INTO `player` VALUES(763, 'Tommy Big', '2009-02-28 11:24:06');"]
   *   }); 
   * </pre>   
   *
   *
   *
   *
   * <h3>Include and Instantiate Impel.inTouch</h3>
   *  <p>Impel requires Mootools 1.2+, and the JsonP class from Clientcide. Other than that all you need to do is include the Impel.inTouch library in a script tag, and instantiate an Impel.inTouch object with the baseURL option.</p>
   *  <p>Instantiation is a two step process. First the object must determine which versions of the tables are currently setup on the client. Once that is done it will fire a 'ready' event. At that point all you have to do is call sync(). Once synchronization is finished it will fire a 'synced' event. Various events will be fired during the synchronization process to give you a better idea of what is going on and what errors (if any) occurred. Consult the API documentation for a full list.</p>
   * <pre class="code brush: js;">
   *&lt;script type="text/javascript" src="/js/impel.inTouch.js"></script>
   *    
   *&lt;script type="text/javascript">
   *  ...
   *   var storage = new Impel.inTouch({
   *       baseURL  : 'http://my.server.co.jp/inTouch/', 
   *       onReady  : function(){ 
   *                   notify("synchronizing storage..."); 
   *                   notify("This may take to 2 minutes; please be patient."); 
   *                   storage.sync(); 
   *                  },
   *       onUpdated  : function(table,oldV,newV){ notify("table "+ table + " (v"+oldV+") updated to v"+newV); },
   *       onUpdating : function(table){ notify("syncing "+table+" with the server"); },
   *       onSynced   : function(){ notify("sync is complete") }, 
   *       onSyncFailed : function(failures){ notify("sync failed for: " + failures); },
   *       onCreateFailed : function(t,e){ notify("Table creation failed for " + t + ": " + e); }
   *      });
   *  ...
   *</script>
   * </pre>
   *
   *
   * @constructs
   * @param {Object} options
   * <ul>
   *  <li><span class="type">{String}</span> <span class="param">baseURL</span>=<span class="dfvalue">null</span> <span class="required">Required</span> The url where Impel.inTouch can find the versions and table definition files. It does not have to be on the same server that provides the rest of your JavaScript.</li>
   *  <li><span class="type">{String}</span> [<span class="param">versionsFile</span>=<span class="dfvalue">versions.json.php</span>] The name of the file on the server that details the currently published tables and their versions</li>
   *  <li><span class="type">{String}</span> [<span class="param">tableFileSuffix</span>=<span class="dfvalue">.json.php</span>] The suffix of the files on the server that include the import/update data</li>
   *  <li><span class="type">{String}</span> [<span class="param">name</span>=<span class="dfvalue">Impel_inTouch</span>] The name of the local database to use</li>
   *  <li><span class="type">{String}</span> [<span class="param">displayName</span>=<span class="dfvalue">Impel inTouch</span>] A human-friendly name for the database</li>
   *  <li><span class="type">{Number}</span> [<span class="param">maxSize</span>=<span class="dfvalue">4096</span>] The maximum size that this database can grow to</li>
   * </ul>
   * @param {Object} events
   *  <ul>
   *    <li><a href="#event:onReady">ready</a></li>
   *    <li><a href="#event:onCreated">created</a></li>
   *    <li><a href="#event:onCreateFailed">createFailed</a></li>
   *    <li><a href="#event:onSynced">synced</a></li>   
   *    <li><a href="#event:onSyncing">syncing</a></li>
   *    <li><a href="#event:onSyncFailed">syncFailed</a></li>
   *    <li><a href="#event:onUpdated">updated</a></li>   
   *    <li><a href="#event:onUpdating">updating</a></li>
   *    <li><a href="#event:onUpdateFailed">updateFailed</a></li>
   *  </ul>   
   *
   * 
   * @property {String} options.baseURL The url where Impel.inTouch can find the versions and table definition files. It does not have to be on the same server that provides the rest of your JavaScript
   * @property {String} [options.versionsFile=versions.json.php] The name of the file on the server that details the currently published tables and their versions
   * @property {String} [options.tableFileSuffix=.json.php] The suffix of the files on the server that include the import/update data
   * @property {String} [options.name=Impel_inTouch] The name of the local database to use 
   * @property {String} [options.displayName=Impel inTouch] A human-friendly name for the database
   * @property {Number} [options.maxSize=4096] The maximum size that this database can grow to 
   *
   * @version: 0.6
   * @requires: Mootools and JsonP
   * @see <a href="http://www.clientcide.com/docs/Request/JsonP">http://www.clientcide.com/docs/Request/JsonP</a>
   * @see <a href="http://mootools.net/">http://mootools.net/</a>
   */
  initialize: function(options,events){
    this.setOptions(options);
    this.addEvents(events);
    this.loadVersions(function(){ this.loaded = true; this.ready(); }.bind(this));
  },
  /**
   * The Impel.inTouch object has been initialized, you can now call sync or any other method.
   * @name Impel.inTouch#onReady
   * @event
   */
   /** @private */
  ready                   : function(){ this.fireEvent('ready'); },
  /**
   * The local database has been fully synchronized with the server
   * @name Impel.inTouch#onSynced
   * @event
   */
   /** @private */
  synced            : function() { this.fireEvent('synced'); },
  /**
   * One or more of the local tables was not synchronized with the server
   * @name Impel.inTouch#onSyncFailed
   * @event
   * @param {String[]} failed The tables that were not synchronized successfully
   */
   /** @private */
  syncFailed   : function(failed){ this.fireEvent('syncFailed', failed); },
  /**
   * Synchronization has begun
   * @name Impel.inTouch#onSyncing
   * @event
   */
   /** @private */
  syncing            : function(){ this.fireEvent('syncing'); },
  /**
   * A particular table is now being updated
   * @param {String} table
   * @name Impel.inTouch#onUpdating
   * @event
   */
   /** @private */
  updating                : function(table) { this.fireEvent('updating', table); },
  /**
   * A particular table has been updated
   * @param {String} table
   * @param {Number} old The table was at old version
   * @param {Number} now The table is now at now version
   * @name Impel.inTouch#onUpdated
   * @event
   */
   /** @private */
  updated                 : function(table,old,now){ this.fireEvent('updated', [table, old, now] ); },
  /** 
   * A particular table was not updated
   * @param {String} table
   * @param {Number} now The table remains at now version
   * @param {Number} future The table was not updated to future version
   * @name Impel.inTouch#onUpdateFailed
   * @event
   */
   /** @private */
  updateFailed            : function(table, now, future){ this.fireEvent('updateFailed',[table,now,future]); },
  /**
   * The portion of the update meant to create the local table succeeded
   * @param {String} table
   * @name Impel.inTouch#onCreated
   * @event
   */
   /** @private */
  created                 : function(table){ this.fireEvent("created",table); },

  /**
   * The portion of the update meant to create the local table failed
   * @param {String} table
   * @param {String} error The error message
   * @name Impel.inTouch#onCreateFailed
   * @event
   */
   /** @private */
  createFailed            : function(table,error){ this.fireEvent("createFailed", [table,error]); },
  /**
   * Check the local database to determine the current versions of all local tables. The version information will be stored in memory to serve future requests to <a href="#getVersion">getVersion</a>
   * @param {function} s_callback A function to call when the load is complete
   * @see Impel.inTouch#getVersion
   * @see Impel.inTouch#setVersion
   */
  loadVersions: function(s_callback){
        try {
            if (!window.openDatabase) 
              throw('HTML 5 SQL database not supported');
            else
              this.db = openDatabase(this.options.name, '1.0', this.options.displayName, this.options.maxSize);
        } catch(e) {
            if (e == 2) 
              throw('Encountered an error while opening the database: invalid database version');
            else
              throw("Encountered an error while opening the database: unknown error "+e+".");
        }
        var that, cacheVersionsFromRS, retrieveVersions, row, i;
        that = this;
        /** @private */
        cacheVersionsFromRS = function(transaction,results){
            for (i=0; i < results.rows.length; i++) {
                  row = results.rows.item(i);
                  that.versions.set(row['t'],row['v']);
              }
              s_callback();
        }
        /** @private */
        retrieveVersions = function(transaction,results){
          transaction.executeSql("SELECT * FROM table_versions;",[], cacheVersionsFromRS, function(e){ throw("Unable to retrieve list of current table versions: "+e.message) });
        };
    
        this.db.transaction(
               function(transaction){
                   transaction.executeSql("CREATE TABLE IF NOT EXISTS table_versions('t' TEXT NOT NULL PRIMARY KEY, 'v' INT NOT NULL);", [], 
                                          retrieveVersions, 
                                          function(t,e){ throw("Unable to create table to cache version data: " + e.message); });
               }.bind(this), 
                function(t,e){ throw("Unable to create table to cache version data: " + e.message); }
           );
  },
  /**
   * Determine which version a particular local table is currently at. The server will NOT be queried.
   * <p><strong>Important Note</strong>: This method should not be called before the 'ready' event has been fired. </p>
   * @param {String} table The name of the table to check
   * @return {Number} The current version number for the specified table
   */
  getVersion: function(table){ return this.versions.get(table);  },
  /**
   * Record that a particular table is at a particular version, and persist the record into the database.
   * <p><strong>Important Note</strong>: This method should not be called before the 'ready' event has been fired. </p>
   * @param {String} table The name of the table
   * @param {Int} version The, now, current version for the table
   */
  setVersion: function(table,version){
    this.versions.set(table,version);
    this.db.transaction(
        function(transaction){
            transaction.executeSql("INSERT INTO table_versions ('t', 'v') VALUES (?,?);", [table,version], 
                                  null, 
                                  function(transaction,error){
                                      transaction.executeSql("UPDATE table_versions SET v=? WHERE t=?", [version, table], null , function(e){throw("Unable to save record: " + table + " = " + version + "\n" + e.message) });
                                  });
        }
    );
  },
  /**
   * Check the server to see if the tables have been updated recently and call synchronize for any that have been updated. 
   * <p>If this method is called with no arguments it asynchronously retrieves a list of the tables and their current versions. 
   * When the list comes back this method is called again with that list as an argument. It then goes through the list 
   * checking for tables that have a version number greater than their local counterparts. Synchronize is then called for
   * any tables that need to be updated.</p>
   *
   * @param {Object[]} [table_versions] - A list of objects describing the current version, or all versions, of each published table
   * @example
   *  [
   *    { "table" : "card", "version": 3 }, 
   *    { "table" : "player", "versions" : [1,2,3,4,5,6] }
   *  ]
   */
  checkForUpdates: function(table_versions){
      if(this.options.baseURL == null)
        throw "baseURL attribute must be set when instantiating an Impel.inTouch object";
      
      if(table_versions == null){
          try{ 
            new JsonP(this.options.baseURL+this.options.versionsFile,{ onComplete: function(data){ this.checkForUpdates(data); }.bind(this) } ).request(); 
          }catch(e){ 
            throw "Impel.inTouch requires the JsonP Class. Download it from: http://www.clientcide.com/docs/Request/JsonP"; 
          }
      } else {
          var atVersion, toUpdate, newVersions, i;
            atVersion   = null;
            toUpdate    = [];
            newVersions = null;
          table_versions.each(function(vInfo){
              if(vInfo['table'] != null){
                  atVersion = this.getVersion(vInfo['table']);
                  if(vInfo['version'] != null){
                      if(atVersion == null || atVersion < vInfo['version'])
                          toUpdate.push(vInfo['table']);                  
                  } else if(vInfo['versions'] != null) {
                      if(atVersion == null || atVersion < vInfo['versions'][vInfo['versions'].length - 1]){
                          newVersions = [];
                          for(i = vInfo['versions'].indexOf(atVersion) +1; i < vInfo['versions'].length; i++){
                            newVersions.push(vInfo['versions'][i]);
                          }
                          toUpdate.push({ table : vInfo['table'], versions : newVersions }  );
                          newVersions = null;
                      }
                  }
                  atVersion = null; // reset atVersion for next iteration of table_versions.each
              }        
          }.bind(this));
          this.sync(toUpdate);
      }
  },
  /**
   * Synchronize the local tables with those published by the server.
   * <p>If this method is called with no arguments it calls <a href="#checkForUpdates">checkForUpdates</a>, which will in turn call this method with a list
   * of tables that need to be synchronized. Synchronize then asynchronously retrieves the update data from the server,
   * which will be inserted into the local database via importData</p>
   *
   * <p>Tables can be updated in one of two ways:</p>
   *  <ol>
   *    <li>Single Update: no matter what the current version of the table is it will be updated to the absolute latest version.</li>
   *    <li>Incremental Update: the table will be updated to the next most recent version then the next most recent, and so on until it is at the latest version.</li>
   *  </ol>
   *
   * <p>If you want a table to be updated in a single request then setup your versions file with a "version" : latest_version_number attribute for the table. Then define the latest table version in a single file named [table_name].json.php (the suffix is configurable).</p>
   * <p>If you want the table to be updated incrementally remove the "version" key from the tables entry in the versions file and replace it with a "versions" : array_of_all_versions attribute for the table. Then define a table definition file for each version. The files must be named: [table_name]_[version_number].json.php (the suffix is configurable).</p>
   *
   * <p>Once all tables have been updated the synced or syncFailed event will be fired.</p>
   *
   * <p><strong>Important Note</strong>: This method should not be called before the 'ready' event has been fired. </p>
   *
   * @param {String|Object[]} [list] - A list of tables that need to be updated. If null then it will check the server's published versions file. A table can be either a String, or an object that contains the following key/value  pairs:
   *    <ul>
   *      <li> <span class="type">{String}</span> <span class="param">table</span> The name of the table to update in a single request</li>
   *      <li> <span class="type">{Array}</span> <span class="param">versions</span> An ordered list of all the versions between the table's current version + 1 and the most recent version. </li>
   *    </ul>
   */
  sync: function(list){
      if(!this.loaded)
          throw "Implen.inTouch.sync() cannot be called before Impel.inTouch is finished initializing. Wait for the 'ready' event.";
      if(list == null){
        this.checkForUpdates();
      } else {
          if(list.length == 0){
            this.synced();
            return;
          }

        var waitingFor  = list;
        var failed      = [];
        
        this.addEvent('updateFailed', function(table){
            waitingFor.erase(table);
            failed.push(table);
            if(waitingFor.length == 0)
              this.syncFailed(failed);
        });
        this.addEvent('updated', function(table){
            waitingFor.erase(table);
            if(waitingFor.length == 0){
              if(failed.length > 0)
                  { this.syncFailed(failed); }
              else 
                  { this.synced(); }
            }
            syncNext(table);
        });
        
        var syncQ, that, syncNext, syncQ_nowUpdating;
        
        that  = this;
        syncQ = [];
        
        this.addEvent('updating', function(table){ syncQ_nowUpdating = table; })
        /**
         * Synchronize the next version of a table
         * @param {string} [last_table] - The last table to be updated
         * @private 
         */
        syncNext = function(last_table){
            if(last_table && last_table != syncQ_nowUpdating)
              return;
            var nxt   = syncQ.shift();
            if(!!nxt == false)
              return;
            that.updating(nxt.table);
            new JsonP(that.options.baseURL+nxt.table+"_"+nxt.version+that.options.tableFileSuffix,{ 
              onComplete: function(data){ that.importData(data, syncNext); }
            }).request();
        }
        
        list.each(function(table){
              if(typeof table == 'string'){
                // if table is a string then there is only one version to update, so we don't care about race conditions
                this.updating(table);
                new JsonP(this.options.baseURL+table+this.options.tableFileSuffix,{ 
                  onComplete: function(data){ this.importData(data); }.bind(this)
                }).request();
              } else if(typeof table == 'object' && $type(table['versions']) == 'array'){
                  //if table is an object then there is potentially more than one version of the table that we need to go through,
                  //so we want to do them one at a time
                  for(i = 0; i < table['versions'].length; i++){
                    syncQ.push({ table : table['table'], version : table['versions'][i] });
                  }
                  syncNext();
              }

        }.bind(this));
    }
  },
  /**
   * Import a new version of a table into the local database.
   * <p>If any portion of the import fails the entire transaction is rolled back.</p>
   *
   * @param {Object} data - An Object containing the following keys:
   * <li><span class="type">{String}</span> <span class="param">table</span> The name of the table</li>
   * <li><span class="type">{Int}</span> <span class="param">version</span> The version of table and its data</li>
   * <li><span class="type">{String[]}</span> [<span class="param">pre-create</span>] An array of SQL statements to execute before going on to the create string</li>
   * <li><span class="type">{String}</span> [<span class="param">create</span>] An SQL statement used to create the table</li>
   * <li><span class="type">{String[]}</span> [<span class="param">extra</span>] An array of SQL statements used to modify the table after it has been created, but before data has been loaded</li>
   * <li><span class="type">{String[]}</span> [<span class="param">data</span>] Array of INSERT, UPDATE, or DELETE statements used to fill the table</li>
   */
  importData: function(data){
      if(data['table'] == null || data['version'] == null)
        return
      
      var atVersion = this.getVersion(data['table']);
          atVersion = atVersion || 0;
      if(atVersion != null && atVersion >= data['version']){
        this.updated(data['table'],atVersion, data['version']);
        return;
      }
      
      
      var formatSQLError = function(e){ return "SQL Error: " + e.message + "("+e.code+")"; }
      var stmt = '';
      
      if(data['create'] != null || data['data'] != null){
          this.db.transaction(
               function(transaction){
                     if(data['pre-create'] != null && data['pre-create'].$family.name == 'array'){
                        data['pre-create'].each(function(stmt){
                          transaction.executeSql(stmt, [], function(){ }, function(t,e){ throw("Statement failed: "+ stmt + "\n" + formatSQLError(e)); return true;});
                        });
                     }
                     if(data['create'] != null ){
                       transaction.executeSql(data['create'], [], 
                                                function(){ this.created(data['table']); }.bind(this),
                                                function(t,e){ 
                                                    this.createFailed(data['table'],formatSQLError(e)); 
                                                    throw("Statement failed: " + data['create'] + "\n" + formatSQLError(e));
                                                    // return true to cancel and rollback the entire transaction
                                                    return true;
                                                }.bind(this)
                                            );
                     }
                     if(data['extra'] != null && data['extra'].$family.name == 'array'){
                        data['extra'].each(function(stmt){
                          transaction.executeSql(stmt, [], null, function(t,e){ throw("Statement failed: "+ stmt + "\n" + formatSQLError(e)); return true;});
                        });
                     }
                   
                     if(data['data'] != null && data['data'].$family.name == 'array'){
                           for(var i=0; i < data['data'].length; i++){
                               stmt = data['data'][i];
                               if(typeof(stmt) == 'string'){
                                 transaction.executeSql(stmt, [], 
                                       null, 
                                       function(t,e){ throw("Failed to load data: " + stmt + "\n" + formatSQLError(e)); return true; }
                                  );
                               }                     
                           }
                     }
               }.bind(this), 
               function(){ this.updateFailed(data['table'], atVersion, data['version']); }.bind(this), 
               function(){ 
                  this.setVersion(data['table'],data['version']); 
                  this.updated(data['table'], atVersion, data['version']);
                }.bind(this)
           );
      }
  }
});

