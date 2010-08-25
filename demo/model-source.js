/**
 * The model portion for duplicating Cards backend functionality in Javascript on the client.
 */

var offlineMirrorSynchroCallBack = function(data){
  this.importData(data);
};
var offlineMirrorCheckForUpdatesCallBack = function(data){
  this.checkForUpdates(data);
}
/**
 * Class: offlineMirror 
 *
 * Extends: localSQLStorage
 *
 * @events
 *  synchronized              - () All the tables have been succesfully synchronized with the server
 *  synchronizationFailed     - (Array) One or more tables were not succesfully updated. The array argument is a list of tables that were not updated
 *  synchronzing              - (String table) The table is about to be synchronized
 *  updated                   - (String table, Int was_version, Int new_version)  The table has been succesfully updated from was_version to new_version. If the versions are the same then the list of versions on the server is out of sync with the actual data on the server.
 *  updateFailed              - (String table, Int was_version, Int new_version) The table not updated and is remains at was_version
 *  created                   - (String table)  The table has been succesfully created
 *  createFailed              - (String table) The table was not created
 */
var offlineMirror = new Class({
  Extends: localSQLStorage,
  options: { 
    name: "cardsMirror",
    maxSize: 4096,
    baseURL: 'http://m.cards.simulacre.org/impel/demo/synchro/'
  },
  /**
   * Check the server to see if the tables have been updated recently and call synchronize for any that have been updated. 
   * If this method is called with no arguments it aynchronously retrieves a list of the tables and their current versions. 
   * When the lsit comes back this method is called again with that list as an argument. It then goes through the list 
   * checking for tables that have a version number greater than their local counterparts. Synchronize is then called for
   * any tables that need to be updated.
   *
   * @params Array data - A list of tables and their version numbers, e.g., [{ "table": "cards", "version": 3 }]
   */
  checkForUpdates: function(data){
      if(data == null){
          dbug.log("checking for updates");
          new JsonP(this.options.baseURL+'versions.json.php',{ onComplete: offlineMirrorCheckForUpdatesCallBack.bind(this) }).request();      
      } else {
          var atVersion = null;
          var toUpdate  = Array();
          data.each(function(vInfo){
              if(vInfo['table'] != null && vInfo['version'] != null){
                atVersion = this.getItem(vInfo['table']+"-version");
                if(atVersion == null || atVersion < vInfo['version'])
                    toUpdate.push(vInfo['table']);
                atVersion = 0;
              }        
          }.bind(this));
          this.synchronize(toUpdate);
      }
  },
  
  /**
   * Synchronize the local tables with those published by the server.
   * If this method is called with no arguments it calls checkForUpdates, which will in turn call this method with a list
   * of tables that need to be synchronized. Synchronize then asynchrounsly retrieves the update data from the server,
   * which will be inserted into the local database via importData
   *
   * Once all tables have been updated the synchronized or synchronizationFailed events will be fired.
   *
   * @params Array list - A list of tables that need to be updated.
   */
  synchronize: function(list){
    if(list == null){
      this.checkForUpdates();
    } else {
        if(list.length == 0){
          this.fireEvent('synchronized');
          return;
        }
        
        var waitingFor  = list;
        var failed      = Array();
        this.addEvent('updateFailed', function(table){
            waitingFor.erase(table);
            failed.push(table);
            if(waitingFor.length() == 0)
              this.fireEvent('synchronizationFailed',failed);
        });
        this.addEvent('updated', function(table){
            waitingFor.erase(table);
            if(waitingFor.length == 0){
              if(failed.length > 0)
                  { this.fireEvent('synchronizationFailed',failed); }
              else 
                  { this.fireEvent('synchronized'); }
            }
        });
        
        list.each(function(table){
            this.fireEvent('synchronizing',table);
            new JsonP(this.options.baseURL+table+'.json.php',{ 
              onComplete: offlineMirrorSynchroCallBack.bind(this)
            }).request();          
        }.bind(this));
    }
  },
  
  /**
   * Create tables and insert data into the local database.
   *
   * @param Hash data - A hash containing the following keys: 'table', 'version', 'create', and 'data'
   *  table is the name of the table
   *  version is the version of table and its data
   *  create is an SQL statment used to create the table
   *  data is an Array of INSERT, UPDATE, or DELETE statements used to construct the data
   */
  importData: function(data){
      if(data['table'] == null || data['version'] == null)
        return
      
      var atVersion = this.getItem(data['table']+"-version");
      if(atVersion != null && atVersion >= data['version']){
        this.fireEvent('updated',[data['table'],atVersion, data['version']]);
        return;
      }
      
      if(data['create'] != null){
          this.db.transaction(
               function(transaction){
                   transaction.executeSql(data['create'], [], function(){ }, $lambda(false));
               }.bind(this), function(){ this.fireEvent('createFailed', data['table'])}.bind(this), function(){ this.fireEvent('created',data['table']); }.bind(this)
           );
      }
      
      if(data['extra'] != null){
          this.db.transaction(
               function(transaction){
                 data['extra'].each(function(stmt){
                   transaction.executeSql(stmt, [], function(){ }, $lambda(false));
                 });
               }.bind(this), $empty, $empty
           );
      }
      
      this.fireEvent('update',data['table']);
      if(data['data'] != null && data['data'].$family.name == 'array'){
          this.db.transaction(
               function(transaction){
                   var stmt = '';
                   for(var i=0; i <= data['data'].length; i++){
                     stmt = data['data'][i];
                     if(typeof(stmt) == 'string'){
                       dbug.log(stmt);
                       transaction.executeSql(stmt, [], function(){ }, $lambda(false));
                     }
                   }
               }.bind(this), function(){ this.fireEvent('updateFailed',[data['table'],atVersion, data[version]]); }.bind(this), function(){ this.setItem(data['table']+"-version",data['version']); this.fireEvent('updated',[data['table'],atVersion, data['version']]); }.bind(this)
           );
      }
      
  }
  
});



/**
 *
 * Application Specific Classes
 *
 * Peer classes need to be accessible pseudo-statically so they are just instantiations of the ImpelPeer class.
 * Non-peer classes need to be instantiated in order to be used.
 *
 * @requires impel.js
 */
 var Card = new Class({
   Extends: ImpelClass,
   peer_class: "CardPeer",
   toString: function(){
     return this.getKanji();
   }
 });

 var CardPeer = new ImpelPeer({
      'columns' : {'id' : 'card.id', 'kanji' : 'card.kanji', 'hatsuon' : 'card.hatsuon','meaning' : 'card.meaning', 'level' : 'card.level', 'created_at' : 'card.created_at','updated_at' : 'card.updated_at'},
      'table'   : 'card',
      'base_object'  :  'Card'
 });



 var Compound = new Class({
   Extends: ImpelClass,
   peer_class: "CompoundPeer",
   toString: function(){
     return this.getKanji();
   }
 });

 /** Why is a Peer and object and not a class? So that it can behave as though it were static... */
 var CompoundPeer = new ImpelPeer({
      'columns' : {'id' : 'compound.id', 'kanji' : 'compound.kanji','hatsuon' : 'compound.hatsuon','meaning' : 'compound.meaning','level' : 'compound.level', 'created_at' : 'compound.created_at', 'updated_at' : 'compound.updated_at'},
      'table'   : 'compound',
      'base_object' : 'Compound'
 });

 
 
 
 var CardCompound = new Class({
   Extends: ImpelClass,
   peer_class: "CardCompoundPeer",
 });

 var CardCompoundPeer = new ImpelPeer({
      'columns' : {'id' : 'card_compound.id', 'card_id' : 'card_compound.card_id', 'compound_id' : 'card_compound.compound_id', 'created_at' : 'card_compound.created_at'},
      'table'   : 'card_compound',
      'base_object' : 'CardCompound'
 });
 
//CardPeer.hasMany("CardCompoundPeer::card_id");
//CompoundPeer.hasMany("CardCompoundPeer::compound_id");
CardPeer.hasManyThrough("CompoundPeer::id","CardCompoundPeer::card_id","CardCompoundPeer::compound_id");
CompoundPeer.hasManyThrough("CardPeer::id","CardCompoundPeer::compound_id","CardCompoundPeer::card_id");
 
 
 
 
var Stack = new Class({
  Extends: ImpelClass,
  peer_class: "StackPeer",
  toString: function(){
    return this.getName();
  },
});
 
var StackPeer = new ImpelPeer({
    'columns'      : {'id' : 'stack.id', 'name' : 'stack.name', 'created_at' : 'stack.created_at','updated_at' : 'stack.updated_at'},
    'table'        : 'stack',
    'base_object'  :  'Stack'
});
 
 
 
 var CompoundStack = new Class({
   Extends: ImpelClass,
   peer_class: "CompoundStackPeer",
 });
 var CompoundStackPeer = new ImpelPeer({
      'columns' : {'id' : 'compound_stack.id', 'stack_id' : 'compound_stack.card_id', 'compound_id' : 'compound_stack.compound_id'},
      'table'   : 'compound_stack',
      'base_object' : 'CompoundStack'
 });
 
 
 

 var CardStack = new Class({
   Extends: ImpelClass,
   peer_class: "CardStackPeer",
   toString: function(){
     return this.getId() + ":" + this.getCardId() + "-" + this.getStackId();
   }
 });
 
 var CardStackPeer = new ImpelPeer({
      'columns' : {'id' : 'card_stack.id', 'stack_id' : 'card_stack.stack_id', 'card_id' : 'card_stack.card_id'},
      'table'   : 'card_stack',
      'base_object' : 'CardStack'
 });



//CardPeer.hasMany("CardStackPeer::card_id");
//StackPeer.hasMany("CardStackPeer::stack_id");
CardPeer.hasManyThrough("StackPeer::id","CardStackPeer::card_id","CardStackPeer::stack_id");
StackPeer.hasManyThrough("CardPeer::id","CardStackPeer::stack_id","CardStackPeer::card_id");


var CardScore = new Class({
  Extends: ImpelClass,
  peer_class: "CardScorePeer",
  toString: function(){
    return this.getCorrect() + " correct, " + this.getIncorrect() + " incorrect";
  }
});

var CardScorePeer = new ImpelPeer({
    'columns' : {'id' : 'card_score.id', 'card_id' : 'card_score.card_id', 'correct' : 'card_score.correct', 'incorrect' : 'card_score.incorrect', 'srs_bucket' : 'card_score.srs_bucket', 'srs_bucket_changed_on' : 'card_score.srs_bucket_changed_on', 'srs_bucket_was' : 'card_score.srs_bucket_was', 'module' : 'card_score.module', 'action' : 'card_score.action', 'created_at' : 'card_score.created_at', 'updated_at' : 'card_score.updated_at'},
    'table'   : 'card_score',
    'base_object' : 'CardScore'
});

CardPeer.hasMany("CardScorePeer::card_id");
//CompoundPeer.hasMany("CardCompoundPeer::compound_id");





 var CompoundScore = new Class({
   Extends: ImpelClass,
   peer_class: "CompoundScorePeer",
 });
 
 var CompoundScorePeer = new ImpelPeer({
      'columns' : {'id' : 'compound_score.id', 'compound_id' : 'compound_score.compound_id', 'correct' : 'compound_score.correct', 'incorrect' : 'compound_score.incorrect', 'srs_bucket' : 'compound_score.srs_bucket', 'srs_bucket_changed_on' : 'compound_score.srs_bucket_changed_on', 'srs_bucket_was' : 'compound_score.srs_bucket_was', 'module' : 'compound_score.module', 'action' : 'compound_score.action', 'created_at' : 'compound_score.created_at', 'updated_at' : 'compound_score.updated_at'},
      'table'   : 'compound_score',
      'base_object' : 'CompoundScore'
 });
 
 
 var NothingSpecial = new Class({
   Extends    : ImpelClass,
   peer_class : "NothingSpecialPeer"
 });

 var NothingSpecialPeer = new ImpelPeer({
    columns     : { id : 'nothing_special.id', name : 'nothing_special.name' },
    table       : 'nothing_special',
    base_object : 'NothingSpecial'
 });