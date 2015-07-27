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




/**
 * An extension to the String Native
 * @memberOf String
 * @class String
 */
String.implement({

/**
 * Parse a Peer::column string into its constituent parts
 * @returns {Object} containing the name of the Peer class, associated table column, associated column, associated get method, associated set method, and the original string as well as a reference to the associated ImpelPeer object.
 *
 * @example
 *  "CardPeer::name".parsePeerColumn();
 *
 *  will return:
 *    { peer          : a CardPeer object reference, 
 *      peer_name     : "CardPeer", 
 *      column        : "name", 
 *      table_column  : "card.name", 
 *      getter        : "getName", 
 *      setter        : "setName", 
 *      orig          : "CardPeer::name" }
 *
 * @memberOf String
 */
 parsePeerColumn: function(){
   if( !this.contains('::'))
     throw 'Peer Column ('+this+') is not properly formatted, e.g., Peer::Column';
   var peer_name     = this.split('::')[0];
   var column        = this.split('::')[1];

   try
     {  var peer = window[peer_name]; }
   catch(e)
     { throw "Peer Class ("+peer_name+") is undefined: "+e; }

   var table_column  = peer.getColumns()[column];
   if(table_column == null)
     throw ("Peer Class "+this+" not found");

   var camelized =   column.replace(/_/g,'-').camelCase().ucfirst();
   var getter = 'get'+camelized;
   var setter = 'set'+camelized;
   return {"peer" : peer, "peer_name" : peer_name, "column" : column, "table_column" : table_column, 'getter' : getter, 'setter' : setter, 'orig' : this };
 },
 /** 
  * Make the first character of this String lower case 
  * @method lcfirst
  * @memberOf String
  */
 lcfirst: function(){
   return this.charAt(0).toLowerCase() + this.substr(1);
 },
 /** 
  * Capitalize the first character of this String 
  * @method ucfirst
  * @memberOf String
  */
 ucfirst: function(){
   return this.charAt(0).toUpperCase() + this.substr(1);
 }
});


/**
 * <p>Impel is a Javascript to HTML 5 Object Relational Mapping Library</p>
 *  
 *  <h2>Issues</h2>
 *  <ul>
 *   <li>It is very likely that more than two connected left joins e.g., a LEFT JOIN b LEFT JOIN c LEFT JOIN d, will result in incorrect SQL</li>
 *   <li>There is no clear definition as to when a transaction should be rolled back</li>
 *   <li>Peers and Classes must be within the top level of the window, e.g., window[AbcPeer]</li>
 *   <li>It is assumed that each object and each table contains an attribute/column named id that is the PRIMARY KEY  and it is AUTO INCREMENT</li>
 *   <li>Auto generated created_at column value can be overridden, but updated_at cannot</li>
 *   </ul>
 * 
 *  <h2>Missing Features</h2>
 *  <ul>
 *   <li>It is not possible to call save once on an array of objects and have them all saved at once.</li>
 *   <li>An API that exactly mirrors PHP's Propel</li>
 *   <li>Auto create of database and SQL tables</li>
 *  </ul>
 *
 *
 *
 * <h2>Using Impel</h2>
 * <p>Impel is a ....</p>
 * <p>Impel makes it easy to ... </p>
 * <h3>Define the model</h3>
 * <pre class="code brush: js;">
 *   var Card = new Class({
 *         Extends    : ImpelClass,
 *         peer_class : "CardPeer",
 *         toString   : function(){
 *                        return this.getName() + " of " + this.getSuit();
 *                      }
 *     });
 *
 *   var CardPeer = new ImpelPeer({
 *          'columns'      : { 'id'    : 'card.id',    'suit' : 'card.suit', 
                            'value' : 'card.value', 'name' : 'card.name'},
 *          'table'        : 'card',
 *          'base_object'  : 'Card'
 *     });
 *
 *  var Stack = new Class({
 *       Extends      : ImpelClass,
 *       peer_class   : "StackPeer",
 *       toString     : function(){
 *                        return this.getName();
 *                      }
 *     });
 *
 *   var StackPeer = new ImpelPeer({
 *         'columns'      : { 'id'          : 'stack.id',         'name'       : 'stack.name', 
 *                            'created_at'  : 'stack.created_at', 'updated_at' : 'stack.updated_at'},
 *         'table'        : 'stack',
 *         'base_object'  :  'Stack'
 *     });
 *
 *   var CardStack = new Class({
 *        Extends: ImpelClass,
 *        peer_class: "CardStackPeer",
 *        toString: function(){
 *          return this.getId() + ":" + this.getCardId() + "-" + this.getStackId();
 *        }
 *      });
 *
 *   var CardStackPeer = new ImpelPeer({
 *           'columns'      : {'id' : 'card_stack.id', 'stack_id'  : 'card_stack.stack_id', 
 *                                                     'card_id'   : 'card_stack.card_id'},
 *           'table'        : 'card_stack',
 *           'base_object'  : 'CardStack'
 *      });
 * </pre>
 * <h3>Define the relationships between the classes</h3>
 * <pre class="code brush: js;">
 *     CardPeer.hasManyThrough("StackPeer::id","CardStackPeer::card_id","CardStackPeer::stack_id");
 *     StackPeer.hasManyThrough("CardPeer::id","CardStackPeer::stack_id","CardStackPeer::card_id");
 * </pre>
 *
 * <h3>Use the objects in your code</h3>
 * Instantiate the objects as you normally would and use the automatically
 * created get and set methods to access the attributes of the objects.
 *
 * <pre class="code brush: js;">
 *  var cards  = [];
 *
 *  cards[0]   = new Card();
 *    cards[0].setSuit("hearts");
 *    cards[0].setName("9");
 *    cards[0].setValue(9);
 *
 *  cards[1]   = new Card();
 *    cards[1].setSuit("hearts");
 *    cards[1].setName("10");
 *    cards[1].setValue(10);
 *
 *  cards[2]   = new Card();
 *    cards[2].setSuit("hearts");
 *    cards[2].setName("Jack");
 *    cards[2].setValue(11);
 *
 *  cards[3]   = new Card();
 *    cards[3].setSuit("hearts");
 *    cards[3].setName("Queen");
 *    cards[3].setValue(12);
 *
 *  cards[4]   = new Card();
 *    cards[4].setSuit("hearts");
 *    cards[4].setName("King");
 *    cards[4].setValue(13);
 *
 *  var sFlush   = new Stack();
 *        sFlush.setName('Straight Flush');
 * </pre>
 *
 * <h3>Associate objects with one another </h3>    
 * Objects that are related to one another through one-to-many and 
 * many-to-many relationships use automatically generated add and get 
 * methods rather than set and get methods
 *
 * <pre class="code brush: js;">
 *    sFlush.addCard(cards[0]);
 *    sFlush.addCard(cards[1]);
 *    sFlush.addCard(cards[2]);
 *    sFlush.addCard(cards[3]);
 *    sFlush.addCard(cards[4]);
 * </pre>
 *
 * <h3>Persist objects via the HTML 5 database</h3>
 * If objects are associated with one another you only need to call save 
 * on one of them. Impel will automatially save any related objects. Impel 
 * is also smart enough to figure out when an UPDATE is required instead 
 * of an INSERT.
 *
 * The HTML 5 specification requires that the HTML database be asynchronous, 
 * so Impel is as well. When you call save on an object nothing will be 
 * returned, but a callbacks will be used to signal if the save was 
 * successful or not. You can safely call save without a callback if you like.
 *
 * <pre class="code brush: js;">
 *  sFlush.save(
 *    function(){ 
 *      notify.show("Saved "+sFlush.getName() + " with " + sFlush.getCards().length + " cards.");
 *    },
 *    function(error){ 
 *      notify.error("Failed to save "+sFlush.getName() + " with " + 
                      sFlush.getCards().length + " cards." + error);
 *    }
 *  );
 * </pre>
 * <h3>Retrieve objects from the HTML 5 database</h3>
 * To retrieve specific objects from the database first instantiate a Criteria
 * object and use it to define exactly which object you want to retrieve. Then
 * use that objects associated ImpelPeer to retrieve it.
 *
 * <pre class="code brush: js;">
 *  var c = new Criteria();
 *     c.add("StackPeer::name","Straight Flush");
 *  CardPeer.doSelectJoinAll(c, function(cards){ 
 *                                  cards.each(function(card){
 *                                      display(card);
 *                                  });
 *                              });
 * </pre>
 *
 * @see ImpelClass#save
 * @see ImpelPeer#doSelectJoinAll
 * @see ImpelPeer#doSelectOneJoinAll
 * @see ImpelPeer#doSelect
 * @see ImpelPeer#doSelectJoinAllExcept
 * @see ImpelPeer#hasMany
 * @see ImpelPeer#hasManyThrough
 *
 * @class Impel
 * @property {database} db The HTML 5 SQL database to execute queries against
 *
 * @requires MooTools
 * @author Caleb Crane - Simulacre Publishing LLC
 * @version 2009 Alpha 0
 */
if(!!Impel == false)
  var Impel = new Class({});

Impel.Implements  = [Options,Events];
Impel.db          = null;
Impel.peers       = [];
Impel.options     = {dbName : 'impel'};

/** @private */
Impel.initialize      = function(options,events){ };
/** @private */
Impel.createDB        = function(name){ throw("Impel.createDB is not yet supported."); };
/** @private */
Impel.addPeer         = function(peer_name){ throw("Impel.addPeer is not yet supported."); };
/** @private */
Impel.createTables    = function(){ throw("Impel.createTables is not yet supported."); };
/** @private */
Impel.importData      = function(){ throw("Impel.importData is not yet supported. See Impel.inTouch ") };









/**
 * A simplified verion of the SQLResultSet class that can be easily turned into an array
 * @class ResultSet
 */
var ResultSet = new Class({
 results: Array(),
 /**
  * The blah blah
  * @param {SQLResultSet} rs A result set as returned from an HTML 5 database SELECT statement
  */
 initialize: function(rs){
   for (var i=0; i<rs.rows.length; i++){
       this.results.push(rs.rows.item(i));
   }
 },
 /**
  * Convert the result set into an array
  * @method toArray
  * @return array
  */
 toArray: function(){
   return this.results;
 }
});





/**
 * Constants used by the Criteria and Criterion classes to construct SQL statements.
 * @class CritConstants
 *
 * @property {String} [JOIN="JOIN"] Table join type
 * @property {String} [LEFT_JOIN="LEFT JOIN"]  Table join type
 * @property {String} [LEFTJOIN="LEFT JOIN"]  Table join type
 * @property {String} [IS_NULL=" IS NULL"] null comparison type
 * @property {String} [ISNULL=" IS NULL"] null comparison type
 * @property {String} [IS_NOT_NULL=" IS NOT NULL"] null comparison type
 * @property {String} [ISNOTNULL=" IS NOT NULL"] null comparison type
 * @property {String} [EQUAL="="] Comparison type
 * @property {String} [NOT_EQUAL="<>"] Comparison type
 * @property {String} [NOTEQUAL="<>"] Comparison type
 * @property {String} [IN=" IN"] Comparison type
 * @property {String} [NOT_IN=" NOT IN"] Comparison type
 * @property {String} [NOTIN=" NOT IN"] Comparision type
 * @property {String} [NOT_LIKE=" NOT LIKE"] Comparison type
 * @property {String} [NOTLIKE=" NOT LIKE"] Comparison type
 * @property {String} [LIKE=" LIKE"] Comparison type
 * @property {String} [OR=" OR "] conjunction
 * @property {String} [AND=" AND "] conjunction
 * @property {String} [ON=" ON "] Qualifier for LEFT JOIN
 * @property {String} [LIMIT=" LIMIT "] Limit number of results specifier
 * @property {String} [DESC=" DESC"] Order by qualifier - descending
 * @property {String} [ASC=" ASC"]  "Order by qualifier" - ascending
 * @property {String} [GREATER_THAN=">"]  Comparison type
 * @property {String} [GREATER_EQUAL=">="]  Comparison type
 * @property {String} [LESS_THAN="<"]  Comparison type
 * @property {String} [LESS_EQUAL="<="]  Comparison type 
 * @property {String} [GREATERTHAN=">"]  Comparison type
 * @property {String} [GREATEREQUAL=">="]  Comparison type
 * @property {String} [LESSTHAN="<"]  Comparison type
 * @property {String} [LESSEQUAL="<="]  Comparison type 
 *
 * @see Criterion
 * @see Criteria
 */ 
var CritConstants = {
   JOIN: " JOIN ",
   LEFT_JOIN: " LEFT JOIN ",
   LEFTJOIN: " LEFT JOIN ",
   IS_NULL: " IS NULL",
   ISNULL: " IS NULL",
   IS_NOT_NULL: " IS NOT NULL",
   ISNOTNULL: " IS NOT NULL",
   EQUAL: "=",
   NOT_EQUAL: '<>',
   NOTEQUAL: '<>',
   IN: " IN",
   NOT_IN:  " NOT IN",
   NOTIN:  " NOT IN",
   NOT_LIKE: " NOT LIKE",
   NOTLIKE: " NOT LIKE",
   LIKE: " LIKE",
   OR: " OR ",
   AND: " AND ",
   ON: " ON ",
   LIMIT: " LIMIT ",
   ASC: " ASC",
   DESC: " DESC",
   GREATER_THAN: ">",
   GREATERTHAN: ">",
   GREATER_EQUAL: ">=",
   GREATEREQUAL: ">=",
   LESS_THAN: "<",
   LESSTHAN: "<",
   LESS_EQUAL: "<=",
   LESSEQUAL: "<="
 };




/**
 * An inner class that describes the different portions of the WHERE clause of an SQL query.
 * The Criterion class should not be directly instantiated. Rather it should be instantiated through Criteria.getNewCriterion
 *
 * @class Criterion
 *
 * @property {String|Number[]} values
 * @property {String} clauses
 * @property {Criteria} p The parent Criteria to which this Criterion is attached
 * @property {Number} length The number of clauses that make up this Criterion
 * @property {String[]} columns The columns that a will be retrieved, or modified as part of any SQL statement that is constructed with this Criterion
 * @property {String[]} peer_tables The tables that any SQL statement constructed with this Criterion will query
 *
 * @see Criteria#getNewCriterion
 * @example
 * var c     = new Criteria();
 * var crit  = new Criterion(c,"CardPeer::name","Queen of Hearts",CritConstants.NOT_EQUAL);
 */
var Criterion = new Class({
  values: [],
  clauses: '',
  columns: [],
  p: null,
  length: 1,
  peer_tables: [],
  
 /** 
  * @param {Criteria} parent The Criteria object to which this Criterion object is attached
  * @param {String} peer_column The Peer::column to which this Criterion object applies
  * @param {mixed} value The value of the peer_column
  * @param {String} [comparison=CritConfig.EQUAL] The relationship between the peer_column and the value
  */
 initialize: function(parent,peer_column,value,comparison){
   this.p = parent;
   this.values.push(value);
   comparison = comparison || CritConstants.EQUAL;
   
   peer_column = peer_column.parsePeerColumn();
   if(comparison == CritConstants.IN && $type(value) == 'array'){
     this.clauses = peer_column.table_column + comparison + "(";
        for(var i=0;i<value.length;i++)
          this.clauses += "?,";
     this.clauses += "?)";
   } else {
     this.clauses = peer_column.table_column + comparison + "?";
   }
   
   
   if(this.peer_tables.contains(peer_column.peer.getTableName()) == false)
       this.peer_tables.push(peer_column.peer.getTableName());

   if(this.columns.contains(peer_column.column) == false)
       this.columns.push(peer_column.column);
 },
 /** 
  * Add another criterion to this criterion object and join it with an AND conjunction
  * @param {Criterion} criterion A criterion object to AND with this object
  *
  */
 addAnd: function(criterion){
   if(!criterion instanceof Criterion)
    throw("Criterion.addAnd(criterion) expects a Criterion object");
   this.values.push(criterion.values);
   this.clauses += CritConstants.AND + criterion.getClause();
   this.length++;
 },
 /** 
  * Add another criterion to this criterion object and join it with an OR conjunction
  * @param {Criterion} criterion A criterion object to OR with this object
  */
 addOr: function(criterion){
   if(!criterion instanceof Criterion)
    throw("Criterion.addOr(criterion) expects a Criterion object");
   this.values.push(criterion.values);
   this.clauses += CritConstants.OR + criterion.getClause();
   this.length++;
 },
 /**
  * Retrieve the current list of clauses for this criterion
  * @returns {String} The Criterion represented as the appropriate portions of an SQL WHERE clause
  */
 getClause: function(){
   if(this.length > 1)
     return "("+this.clauses+")";
   return this.clauses;
 },
 /**
  * Retrieve a list of the values that have been applied to this Criterion object
  * @returns {String|Number[]}
  */
 getValues: function(){ return this.values; },
 /** 
  * Retrieve a list of the tables that are inclued in this Criterion object
  * @returns {String[]}
  */
 getTables: function(){ return this.peer_tables; },
 /**
  * @returns {String[]} The columns that will make up the SELECT portion of the SQL query for this Criterion
  */
 getColumns: function(){ return this.columns; },
 /**
  * Retrieve a string representation of this Criterion object
  * @returns {String}
  */
 getDbug: function(){ return this.getClause() + "["+this.getValues()+"]"; }
});


/**
 * A utility class for holding criteria information for an SQL query. 
 * @class Criteria
 */
var Criteria = new Class({
   Implements: [Options, Events],
   options: { },
   clause: '',
   values: [],
   select_columns: [],
   insert_columns: [],
   peer_tables: [],
   where_clauses: { ' AND ' : [], ' OR ' : [] },
   left_joins: $H({}),
   length: 0,
   /**
    * @param {Object} options Options to bind to this Criteria object. Currently no configurable Options are supported by this class.
    * @param {Object} events Events to bind to to this Criteria object. Currently no Events are fired by this class
    */
   initialize: function(options,events){
     this.setOptions(options);
     this.addEvents(events);
   },
   /**
    * Retrieve a new Criterion object that is not automatically added to this Criteria object. The returned Criterion can be used to chain other Criterions and create a more complex WHERE clause.
    * @param {String} peer_column The peer and column that the reutrned Criterion should be associated with, e.g., "CardPeer::name"
    * @param {String} value The value that the peer_column should be associated with, e.g., "Ace of Clubs"
    * @param {String} comparison The relationship between the value and the peer_column, e.g., "CritConstants.EQUAL"
    */
   getNewCriterion: function(peer_column,value,comparison){ return new Criterion(this,peer_column,value,comparison); },
   /**
    * Add a Criterion to this Criteria object. If this Criteria contains other Criterion the Criterion will be added with the passed in conjunction
    * @param {Criterion} crit
    * @param {String} [conjunction=CritConstants.AND]
    *
    * @see Criterion
    */
   addCriterion: function(crit, conjunction){
     if(!crit instanceof Criterion )
      throw("Criteria.addCriterion() expects a Criterion object");
     conjunction = conjunction || CritConstants.AND;
      
     crit.getTables().each(function(table){
       this.peer_tables.include(table);
     },this);

     critValues = crit.getValues();
     crit.getColumns().each(function(column,index){
       if(column.contains('.'))
         column = column.split('.')[1];
       if(this.insert_columns.contains(column) == false)
           this.insert_columns.push(column);
       else{
          console.log("Criteria: Attempt to add a duplicate column (" + column + "='"+critValues[index]+"'); ignoring");
          critValues.splice(index,1);
        }
     },this);

     this.values.push(critValues);
     this.where_clauses[conjunction].push(crit.getClause());
     this.length++;
   },
   /**
    * Add a Criterion to this Criteria object.
    * <p><strong>Potential Issue:</strong> does add allow the same column to be added more than once?</p>
    * @param {Criterion|String} peer_columnOrCrit
    * @param {String} value
    * @param {String} [comparison=CritConstants.EQUAL]
    *
    * @see Criterion
    */
   add: function(peer_columnOrCrit, value, comparison){
       if(peer_columnOrCrit instanceof Criterion)
         return this.addCriterion(peer_columnOrCrit);
       return this.addCriterion(this.getNewCriterion(peer_columnOrCrit,value,comparison));
       
   },
   /**
    * Add a Criterion to this Criteria object.
    * If this Criteria contains other Criterion the Criterion will be added with an 'OR' conjunction
    * @param {Criterion|String} peer_columnOrCrit
    * @param {String} value
    * @param {String} [comparison=CritConstants.EQUAL]
    */
   addOr: function(crit, value, comparison){
     if(crit instanceof Criterion)
        return this.addCriterion(crit);
     return this.addCriterion(this.getNewCriterion(crit,value,comparison), CritConstants.OR); 
   },
   /**
    * Add a Criterion to this Criteria object.
    * If this Criteria contains other Criterion the Criterion will be added with an 'AND' conjunction
    * @param {Criterion|String} peer_columnOrCrit
    * @param {String} value
    * @param {String} [comparison=CritConstants.EQUAL]
    *
    * @see Criteria#add
    */   
    addAnd: function(crit, value, comparison){
     if(crit instanceof Criterion)
        return this.addCriterion(crit);
     return this.addCriterion(this.getNewCriterion(crit,value,comparison)); 
   },
   /**
    * Add a column to the SELECT clause of the SQL statement that will be executed against the database.
    * <p>The ImpelPeer.doSelect, etc., methods automatically add the necessary columns to the SELECT clause,
    * so this method does not need to be called manually. If you do call it then only columns that have
    * associated attributes in the ImpelClass object will be hydrated. To get at the column you will need
    * to pass the Criteria to the ImpelPeer.executeSQL method then access the SQLResultSet that it passes
    * off to your success callback.</p>
    *
    * @param {String} peer_column The Peer::column to add.
    * @see Criteria#getSelectColumns
    * @example
    * var c = new Criteria();
    *     c.add("PlayerPeer::debt",50000,CritConstants.GREATER_EQUAL);
    *     c.addSelectColumn.("PlayerPeer::name");
    *     c.addSelectColumn.("PlayerPeer::address");
    *     PlayerPeer.executeSQL(c.getSelectSQL,c.getValues(),function(rs){
    *                         new ResultSet(rs).toArray().each(function(row){
    *                           notify.show("Lenny go collect from "+ row[0] +". He lives at "+ row[1]);
    *                         });
    *                       })
    */   
   addSelectColumn: function(peer_column){
     peer_column = peer_column.parsePeerColumn();
     this.select_columns.push(peer_column['table_column'] + " AS " + "'"+peer_column['table_column']+"'");
   },
   /**
    * Retrieve a list of columns that will be used to make up the SELECT 
    * @return {Array} The columns
    * @see Criteria#addSelectColumn
    */   
   getSelectColumns: function(){
     return this.select_columns;
   },
   /**
    * Does this Criteria contain any columns that will be used in the SELECT clause of an SQL statment?
    * @return {boolean}
    * @see Criteria#addSelectColumn
    * @see Criteria#getSelectColumns
    */
   hasSelectColumns: function(){
     if(this.select_columns.length > 0)
      return true;
    return false;
   },
   /**
    * Does this Criteria contain a LEFT JOIN clause for the given peer_column.
    * @params {String|Object} peer_column The Peer::column to check
    * @return {Boolean}
    */
   leftJoinsHas: function(peer_column){
       if($type(peer_column) == "string")
         peer_column = peer_column.parsePeerColumn();
       else if($type(peer_column) != 'object' || !!peer_column['peer'] == false)
          throw("Criteria.leftJoinsHas() expects a Peer::column String, or parsed Peer::column argument");
        
       if(this.left_joins.getKeys().contains(peer_column.peer.getTableName()))
          return true;
        
       var truth, table, keys;
          truth  = false;
          table  = peer_column.peer.getTableName();
          keys   = this.left_joins.getKeys();
       for(var i = 0; i < keys.length; i++ ){
         if(this.left_joins[keys[i]]['left'] == table){
            truth = true;
            break;
         }
       }
       return truth;
   },
   /**
    * Add a JOIN clause to this Criteria.
    * <p>Currently only JOIN and LEFT JOIN are supported join opperators.</p>
    *
    * @param {String} left The peer_column (table) that is the left side of the JOIN, e.g., "PlayerPeer::card_table_id"
    * @param {String} right The peer_column (table) that is the right side of the JOIN, e.g., "CardTablePeer::id"
    * @param {String} [operator=CritConstants.JOIN] The type of JOIN, e.g., CritConstants.LEFT_JOIN
    * 
    */
   addJoin: function(left,right,operator){
     left     = left.parsePeerColumn();
     right    = right.parsePeerColumn();
     // currently we only support LEFT_JOIN and JOIN, but we also want to make sure that the operator is not null
     operator = (operator == CritConstants.LEFT_JOIN) ? operator : CritConstants.JOIN;
     
     
     if(operator == CritConstants.JOIN){
       if(!this.leftJoinsHas(left))
           this.peer_tables.include(left.peer.getTableName());
       if(!this.leftJoinsHas(right))
           this.peer_tables.include(right.peer.getTableName());
       this.where_clauses[CritConstants.AND].push(left.table_column + CritConstants.EQUAL + right.table_column );
     } else if(operator == CritConstants.LEFT_JOIN){
       if(!!this.left_joins[right.peer.getTableName()])
          throw("Cannot use the same table as the right side of two LEFT JOIN statements: " + right.peer.getTableName() );
       this.left_joins[right.peer.getTableName()] = { 'left' : left.peer.getTableName(), 'ON' : CritConstants.ON + left.table_column + CritConstants.EQUAL + right.table_column };
       // this is relating tables that it should not
       this.peer_tables.erase(right.peer.getTableName());
       this.peer_tables.erase(left.peer.getTableName());
     }
   },
   leftJoinDbug: function(){
     this.left_joins.getKeys().each(function(key){
       console.log(key+": ");
       console.log(this.left_joins.get(key));
     },this);
   },
   /**
    * Retrieve an Object representing the LEFT JOIN clauses that have been added to this Criteria.
    * <pre>
    * The left_joins DataStructure looks like this:
    * { right_table_name : { 'ON' : " ON left_column = right_column", 'left' : left_table_name } }
    * </pre>
    *
    * <p>We go through the each top level item of the Object; pull out the left table_table_name then look for any other entires that use it as their right_table_name.
    * If we find any we add ourselves to the end of their ON clause and erase our entry. Then we go through the Object one more time constructing queries to look like
    * left_table_name LEFT JOIN right_table_name ON left_colum = right_column LEFT JOIN another_right_table_name ON ..., left_table_name LEFT JOIN right_table_name ON left_colum = right_column.</p>
    *
    * <p>The current implementation probably has a bug in that more than two nested LEFT JOINs using the same table won't come out correct. This will be fixed before we go to beta.</p>
    *
    * @returns {Object} 
    * @see Criteria#addJoin
    */
   getLeftJoinClauses: function(){
     this.left_joins.each(function(join,right){
       if(this.has(join['left'])){
         this[join['left']][CritConstants.ON] += CritConstants.LEFT_JOIN + right + join['ON'];
         this.erase(right);
       }
     }.bind(this.left_joins));
     
     var ljs = [];
     this.left_joins.each(function(join,right){
       ljs.push(join['left']+ CritConstants.LEFT_JOIN + right + join['ON']);
     });
     
     return ljs.join(", ");
     
   },
   /**
    * Retrieve a complete SQL SELECT statment constructed from this Criteria.
    * <p>The select columns, table names, joins, and where clauses will be automatically added to the statement before it is returned</p>
    *
    * @return {String} an SQL SELECT statement
    * @see ImpelPeer#doSelect
    */
   getSelectSQL: function(){     
     var stmt = "SELECT " + this.getSelectModifiers() + " " + this.select_columns.join(', ') + " FROM ";
      if(this.left_joins.getLength() > 0){
        stmt += this.getLeftJoinClauses();
        stmt += isEmpty(this.getTableNames()) ? " " : ", ";
      }
      if(!isEmpty(this.getTableNames())){
        stmt += this.getTableNames() + " ";
      }
      
        stmt += this.getWhereClause();
      
      if(!isEmpty(this.options.groupby))
        stmt += this.options.groupby + " ";
      if(!isEmpty(this.options.orderby))
        stmt += this.options.orderby + " ";
      if(this.options.limit != null)
        stmt += CritConstants.LIMIT+this.options.limit;
      
      return stmt +";";
   },
   /**
    * Retrieve only the WHERE clauses portion of an SQL statement constructed from this Criteria.
    *
    * @returns {String} The WHERE clause for this Criteria.
    * @see Criteria#getSelectSQL
    * @see Criteria#getUpdateSQL
    */
   getWhereClause: function(){
     var stmt = "";
     if(!isEmpty(this.where_clauses[CritConstants.AND]) || !isEmpty(this.where_clauses[CritConstants.OR]))
       stmt += "WHERE "
     if(!isEmpty(this.where_clauses[CritConstants.AND]))
       stmt += this.where_clauses[CritConstants.AND].join(CritConstants.AND) + " ";
     if(!isEmpty(this.where_clauses[CritConstants.OR])){
       if(!isEmpty(this.where_clauses[CritConstants.AND]))
         stmt += CritConstants.AND;
       stmt += this.where_clauses[CritConstants.OR].join(CritConstants.OR) + " ";
     }
     return stmt;
   },
   /**
    * Retrieve a complete SQL Insert statement constructed from this Criteria.
    * <p>The columns, values, and table names, will be automatically added to the statement before it is returned</p>
    *
    * @example
    *   var c = new Criteria();
    *       c.add("PlayerPeer::name","Johnny Big");
    *       c.add("PlayerPeer::debt",0);
    *       c.add("PlayerPeer::card_table_id",7);
    *
    *   PlayerPeer.executeSQL(c.getInsertSQL(),c.getValues(),$empty,
    *                         function(e){
    *                           notify.error("Failed to add Jonny to DB:",e);
    *                         });
    *
    * @returns {String} An SQL INSERT statement
    * @see ImpelClass#save
    */
   getInsertSQL: function(){
     var stmt = "INSERT INTO "+this.getTableNames() + "("+this.insert_columns.join(', ')+") VALUES(";
     for(var i = 1; i< this.insert_columns.length; i++)
       stmt += "?,";
     stmt += "?);";
     
     return stmt;
   },
   /**
    * Retrieve a complet SQL Update statement constructed from this Criteria.
    * @params {Criteria} constrainCrit The criteria to use to constrain the UPDATE statement
    * @returns {String} An SQL UPDATE statement
    * @see ImpelClass#save
    */
   getUpdateSQL: function(constrainCrit){
     if($type(this.insert_columns) != 'array' && this.insert_columns.length <= 0) 
      throw "You must call Criteria::add() for each column that is to be updated before Criteria::getUpdateSQL(constrainCrit)";
     if(!(constrainCrit instanceof Criteria))
      throw "Criteria::getUpdateSQL(constrainCrit) expects another Criteria object as an argument";

      stmt = "UPDATE "+ this.getTableNames() + " SET "+ this.insert_columns[0]+"=?";
        for(var i = 1; i < this.insert_columns.length; i++){
          stmt += ","+this.insert_columns[i]+"=?";
        }
      
      stmt += " "+constrainCrit.getWhereClause();
      
      if(this.options.limit != null)
        stmt += CritConstants.LIMIT+this.options.limit;
      else if(constrainCrit.options.limit != null)
        stmt += CritConstants.LIMIT+constrainCrit.options.limit;
      
      stmt += ";";
      
      // The WHERE clause from the constrainCrit limits the UPDATE but it contains '?'s instead of values, so we need to combine ours with theirs.
      // Note that getValues should be used to retrieve the values from this object when actually using them because it flattens the array before
      // returning
      this.values.push(constrainCrit.getValues());
      
      return stmt;
   },
   /**
    * Retrieve a complete SQL DELETE statement constructed from this Criteria.
    * @return {String} An SQL DELETE statement
    * @see ImpelClass#remove
    */
   getDeleteSQL: function(){
     return stmt = "DELETE FROM "+ this.getTableNames() + " " + this.getWhereClause() + ";";
   },
   /**
    * Retrieve all values that have been added to this Criteria in the order they were added.
    * <p>The getInsertSQL, etc., methods construct the SQL statemetn with '?' in place of values. ImpelPeer.executeSQL 
    * expects this and so requires an array of variables as the second argument. It will then prepare the values before
    * executing the full SQL statement.</p>
    *
    * @returns {Array} The values associated with this Criteria in the order they were added.
    * @see ImpelPeer#executeSQL
    */
   getValues: function(){
     return this.values.flatten();
   },
   /**
    * Add a table to the list of tables that will be used in any SQL statement constructed from this Criteria.
    * The ImpelPeer.doSelectOne, etc., methods automatically add the necessary tables, so this method really shouldn't be
    * called outside of the ImpelPeer methods.
    *
    * @param {String} table The name of the table to add
    */
   addTable: function(table){
     this.peer_tables.include(table);
   },
   /**
    * Retrive a list of all the tables that will be used in any SQL statement constructed from this Criteria.
    *
    * @returns {String} A list of the tables separated by commas
    * @see Criteria#addTable
    *
    * @example
    * var c = new Criteria();
    *     c.add("PlayerPeer::name","Johnny Small");
    *     c.add("CardTablePeer::number",7);
    *
    * var tables = c.getTableNames();
    *
    * tables now equals "player,cardtable"
    */
   getTableNames: function(){
     return this.peer_tables.join(', ');
   },
   /**
    * Retrieve any modifiers that have been added to the SELECT clause of the Criteria.
    *
    * @returns {String} "DISTINCT" || '';
    * @see Criteria#setDistinct
    */
   getSelectModifiers: function(){
     if(this.options.distinct == true){
       return " DISTINCT ";
     }
     return '';
   },
   /**
    * Set a limit on the number of results.
    * @param {Number} limit
    */
   setLimit: function(limit){
     this.options.limit = limit;
   },
   /**
    * Add the DISTINCT modifier to the SELECT clause of any SQL statement constructed from this Criteria.
    */
   setDistinct: function(){
     this.options.distinct = true;
   },
   /**
    * Sort the results of any SQL query constructed from this Criteria by the column specified in ascending order
    * @param {String} peer_column
    * @see Criteria#addDescendingOrderByColumn
    *
    * @example
    * var c = new Criteria();
    *     c.addAscendingOrderByColumn("PlayePeer::zipcode");
    */
   addAscendingOrderByColumn: function(peer_column){
     this.options.orderby = "ORDER BY " + peer_column.parsePeerColumn()['table_column'] + CritConstants.ASC;
   },
   /**
    * Sort the results of any SQL query constructed from this Criteria by the column specified in descending order
    * @param {String} peer_column
    * @see Criteria#addAscendingOrderByColumn
    *
    * @example
    * var c = new Criteria();
    *     c.addDescendingOrderByColumn("PlayerPeer::zipcode");
    */
   addDescendingOrderByColumn: function(peer_column){
     this.options.orderby = "ORDER BY " + peer_column.parsePeerColumn()['table_column'] + CritConstants.DESC;
   },
   /**
    * Group the results of any SQL query constructed from this Criteria by the column specified
    *
    * @param {String} peer_column
    */
   addGroupByColumn: function(peer_column){
     this.options.groupby = "GROUP BY " + peer_column.parsePeerColumn()['table_column'];
   },
   /**
    * @private
    */
   addAsColumn: function(name,clause){
     
   }
 });



/**
 * A utility class for managing interactions between objects and their associated records in the database.
 * <p>Any class of objects that you want to persist in the database must have an associated ImpelPeer object.</p>
 * <p>An ImpelPeer object defines the names of the attributes for the ImpelClass object, its associated table
 *    and columns in the database. It must also define the name of the ImpelClass object.</p>
 *
 * @class ImpelPeer 
 *
 */
var ImpelPeer = new Class({
   Implements: [Options,Events],
   options: {
     'columns': {},
     'table'  : '',
     'base_object' : ''
   },
   columns: {},
   deleting_ids: [],
   has_manys: $H({}),
   has_many_throughs: $H({}),
  /**
   * @param {Object} options Options to bind to this ImpelPeer object. Currently no configurable Options are supported by this class.
   * @param {Object} events Events to bind to to this ImpelPeer object. Currently no Events are fired by this class
   */
   initialize: function(options,events){
     this.setOptions(options);
     this.addEvents(events);
     this.options.columns = $H(this.options.columns);
     this.generateAttributes();
     this.generateMethods();
   },

   /**
    * Retrieve the name of the class associated with this peer object.
    * @returns {String} The name of the class associated with this peer object, e.g., CardPeer.getBaseObjName() will return "Card"
    */
   getBaseObjName: function(){
      return this.options.base_object;
   },
   /** 
    * Dynamically build the attributes of the ImpelClass object associated with this ImpelPeer object based on the columns that were specified when instantiating this object.
    * It may at some point be worth while to write this into a code generator, so that it only needs to be called during development. Of course that would increase the size
    * of the code delivered to the user, so it is a network bandwidth v.s. CPU utilization issue.
    *
    * <ul>
    *   <lh><strong>Important Notes:</strong></lh>
    *   <li>The ImpelClass must be defined within the scope of window</li>
    *   <li>This method should not be called directly because the constructor will call it. If you add columns to the peer after instantiation THEN call this method manually.</li>
    * </ul>
    * 
    * 
    *
    * @returns {undefined} The ImpelClass class definition that is associated with this ImpelPeer instnace will be modified to include new attributes
    */
   generateAttributes: function(){
       var mods = {};
           mods.attributes = {};
       this.options.columns.each(function(table,attr){
         mods.attributes[attr] = '';
       });
        
       window[this.options.base_object].implement(mods);
   },
  /** 
   * Dynamically build the set/get methods of the ImpelClass object associated with this ImpelPeer object based on the columns that were specified when instantiating this object.
   * It may at some point be worth while to write this into a code generator, so that it only needs to be called during development. Of course that would increase the size
   * of the code delivered to the user, so it is a network bandwidth v.s. CPU utilization issue.
   * <ul>
   *   <lh><strong>Important Notes:</strong></lh>
   *   <li>The ImpelClass must be defined within the scope of window</li>
   *   <li>This method should not be called directly because the constructor will call it. If you add columns to the peer after instantiation THEN call this method manually.</li>
   * </ul>
   *
   * @returns {undefined} The ImpelClass class definition that is associated with this ImpelPeer instance will be modified to include new methods
   * @see ImpelClass#generateDocs
   */
   generateMethods: function(){
        var mods = {};
       this.options.columns.each(function(table,attr){
           var getter    = ('get-'+attr.replace(/_/g,'-')).camelCase();
           mods[getter]  = function(){ 
             return this.attributes[attr]; 
          }
           var setter   = ('set-'+attr.replace(/_/g,'-')).camelCase();
           mods[setter] = function(v){ 
             this.attributes[attr] = v;
             this.modified_columns.push(attr);
          }
       });
       window[this.options.base_object].implement(mods);
   },
    /** 
     * Add the select columns, that are necessary to hydrate the associated ImpelClass object from a database row, to a Criteria object 
     * @param {Criteria} [crit] - The Criteria object that will be used to retrieve rows from the database
     *
     * @returns {Criteria} If a Criteria object is not passed in one will be created and returned. If a Criteria object is passed in that 
     * it will be modified and returned, but because JavaScript passes object by reference you do not need to assign the return back to your
     * Criteria object.
     *
     * @see Criteria#addSelectColumn
     */
   addSelectColumns: function(crit){
     crit = ($type(crit) != 'object') ? new Criteria() : crit;
     // this should really be a for(name in this.options.columns) loop
     $H(this.options.columns).getKeys().each(function(key){
       crit.addSelectColumn(this.options.base_object+"Peer::"+key);  
     }.bind(this));
     return crit;
   },
   /** 
    * Add the table, in which this ImpelClass's data is stored in the database, to a Criteria object 
    * @param {Criteria} crit - The Criteria object that will be used to retrieve rows from the database
    *
    * @returns {Criteria} If a Criteria object is not passed in one will be created and returned. If a Criteria object is passed in that 
    * it will be modified and returned, but because JavaScript passes object by reference you do not need to assign the return back to your
    * Criteria object.
    *
    * @see Criteria#addTable
    * @see ImpelPeer#getTableName
    */
   addTable: function(crit){
     crit = ($type(crit) != 'object') ? new Criteria() : crit;
     crit.addTable(this.getTableName());
     return crit;
   },
   /**
    * Retrieve an internal object that defines the names of the attributes and columns for this ImpelPeer's associated ImpelClass.
    *
    * @returns {Object} An object representing the attributes and columns for this ImpelPeer
    * <pre class="code brush: js;">
    *{
    *   'id'          : 'player.id', 
    *   'name'        : 'player.name', 
    *   'created_at'  : 'player.created_at',
    *   'updated_at'  : 'player.updated_at'
    *} 
    * </pre>
    */
   getColumns: function(columns){
     return this.options.columns;
   },
   /**
    * Retrieve the name of the table that is associate with this ImpelPeer.
    * @returns {String}
    */
   getTableName: function(){
     return this.options.table;
   },
   /**
    * Retrieve a comma separated list of the columns that will be used to create an SQL SELECT statement for this ImpelPeer.
    * <p><em>Important Note:</em> The columns will be specified using AS clauses because the HTML 5, or SQLite, RDBMS 
    * impelementation will overwrite columns with the same name from separate tables.</p>
    *
    * @returns {String}
    */
   getSelectColumns: function(){
     var cols = [];
     this.options.columns.getValues().each(function(col){
       cols.push(col + " AS '"+col+"'");
     });
     return cols.join(', ');
   },
   /**
    * Execute an arbitrary SQL statement against the database.
    * If the query is succesfull call a particular method of a particular object. Also call specified 
    * success and failure callbacks as necessary.
    *
    * @param {String} stmt                        The SQL statement to execute
    * @param {Array} [values]                     A set of values to to insert into the SQL statement after properly perparing them
    * @param {function} [s_callback(SQLResultSet)]  The function to call if the transaction succeeds
    * @param {function} [f_callback(Error)]         The function to call if the transaction fails
    * @param {Object} obj                         The object that is being affected by this transaction
    * @param {method} obj_method                  The method in the object to call after the transaction succeeds
    * @param {database} [con]                     The database to execute against. If null then Impel.db is used
    * 
    * <p>On success s_callback will be called with an SQLResultSet as an arument. An SQLResultSet contains:</p>
    *   <ul>
    *     <li>int insertId: -1 if not insert was performed</li>
    *     <li>int rowsAffected: 0 if no rows were updated or inserted</li>
    *     <li>SQLResultSetRowList rows: the rows that were returned
    *         <ul>
    *           <li>int length</li>
    *           <li>function item(index): retrieve the row at a given relative index</li>
    *         </ul>
    *     </li>
    *   </ul>
    *
    * @returns {undefined} To access the data retrieved pass in a callback function, or an Object and a method to call.
    */
   executeSQL: function(stmt,values,s_callback,f_callback,obj,obj_method,con){
     con = con || Impel.db;
     if(con == null)
       throw "No suitable database connection found. Assign one to Impel.db";
     
     if($type(stmt) != 'string')
       throw "executeSQL(sql,values,success_callback,failure_callback) requires an at least an SQL statment";
     
     values = values || []
     if($type(values) != 'array')
        throw "ImpelPeer::executeSQL - second parameter (values) must be an array.";
      
     if($type(s_callback) != 'function')
        s_callback = $empty;
    if($type(f_callback) != 'function')
        f_callback = $empty;
      
     con.transaction(function(transaction){
            dbug.time(stmt + " ["+values+"]");
            transaction.executeSql(stmt,values, 
               function(trans,rs){ 
                  dbug.timeEnd(stmt + " ["+values+"]");
                  if($type(obj) == 'object'){
                    if(obj_method != null)
                      { obj[obj_method](rs); }
                    else 
                      { obj['callback'](rs); }
                  }
                  s_callback(rs); 
               }.bind(this),
               function(t,e){ dbug.timeEnd(stmt + " ["+values+"]"); f_callback(e); }
             );
           }.bind(this), function(t,e){ dbug.timeEnd(stmt + " ["+values+"]"); f_callback(e);}
     );
   },
   /**
    * Retrieve a set of rows from the database and attempt to hydrate instances of this ImpelPeer's associated ImpelClass with the results.
    * It is important to realize that doSelect and doSelectOne will only retrieve objects that are an instance of this ImpelPeer's 
    * ImpelClass. One-to-many and many-to-many relationships will not be maintaned. Use doSelectJoinAll or a similar function if
    * this ImpelClass's objects are actually made up of multiple other ImpelClasses.
    *
    * @param {Criteria} criteria - The criteria used to limit the results retrieved. The appropriate table and columns will be added
    *                            to the Criteria object automatically, so you only need to specify the pieces of the WHERE clause.
    *                            It can also be an empty criteria, so doSelect(new Criteria(), ...) is fine if you want to retireve
    *                            all of the associated objects from the database.
    *
    * @param {function} callback(ImpelClass) - The function to call when the query completes.
    * @param {connection} [con]                  - The database connection to use. Impel.db will be used if it is undefined. 
    *
    * @returns {undefined} To access the ImpelClass objects that are retreived, pass in a callback function
    *
    * @see ImpelPeer#doSelectOne
    * @see ImpelPeer#doSelectJoinAll
    */
   doSelect: function(criteria, callback, con){
       con = con || Impel.db;
       if(con == null)
         throw "No suitable database connection found. Assign one to Impel.db";
       if(criteria == null)
         throw "doSelect(criteria) requires a Criteria object";
       
       con.transaction(function(transaction){
              if(!criteria.hasSelectColumns())
                criteria = this.addSelectColumns(criteria);
              //if(isEmpty(criteria.getTableNames()))
                //criteria.addTable(this.options.table);
              this.addTable(criteria);
                
              var stmt = criteria.getSelectSQL();
              dbug.time(stmt + " ["+criteria.getValues().join(',')+"]");
              transaction.executeSql(stmt,criteria.getValues(), 
                 function(trans,rs){ 
                    dbug.timeEnd(stmt + " ["+criteria.getValues().join(',')+"]");
                     var objs = Array();
                     new ResultSet(rs).toArray().each(function(row){
                       var obj = new window[this.options.base_object]();
                        obj.hydrate(row);
                       objs.push(obj);
                     }.bind(this));
                     callback(objs); 
                 }.bind(this),
                 function(){ /*statment error handler*/}
               );
             }.bind(this) /*transaction error handler*/
       );
   },
   /**
    * Retrieve a sing row from the database and attempt to hydrate an instance of this ImpelPeer's associated ImpelClass with the result.
    * It is important to realize that doSelect and doSelectOne will only retrieve objects that are an instance of this ImpelPeer's 
    * ImpelClass. One-to-many and many-to-many relationships will not be maintaned. Use doSelectJoinAll or a similar function if
    * this ImpelClass's objects are actually made up of multiple other ImpelClasses.
    *
    * @param {Criteria} criteria - The criteria used to limit the results retrieved. The appropriate table and columns will be added
    *                            to the Criteria object automatically, so you only need to specify the pieces of the WHERE clause.
    *                            It can also be an empty criteria, so doSelect(new Criteria(), ...) is fine if you want to retireve
    *                            all of the associated objects from the database.
    *
    * @param {function} callback(object) - The function to call when the query completes.
    * @param {connection} [con]                  - The database connection to use. Impel.db will be used if it is undefined. 
    *
    * @returns {undefined} To access the ImpelClass objects that are retreived, pass in a callback function
    *
    * @see ImpelPeer#doSelect
    * @see ImpelPeer#doSelectJoinAll
    */
   doSelectOne: function(criteria, callback, con){
       con = con || Impel.db;
       if(con == null)
         throw "No suitable database connection found. Assign one to Impel.db";
       if(criteria == null)
         throw "doSelect(criteria) requires a Criteria object";
       
       con.transaction(function(transaction){
             if(!criteria.hasSelectColumns())
               criteria = this.addSelectColumns(criteria);
             //if(isEmpty(criteria.getTableNames()))
               //criteria.addTable(this.options.table);
               this.addTable(criteria);
             
             criteria.setLimit(1);
             var stmt = criteria.getSelectSQL();
             dbug.time(stmt + " ["+criteria.getValues().join(',')+"]")
             transaction.executeSql(stmt,criteria.getValues(), 
                 function(trans,rs){ 
                    dbug.timeEnd(stmt + " ["+criteria.getValues().join(',')+"]"); 
                    var obj = new window[this.options.base_object]();
                      obj.hydrate(new ResultSet(rs).toArray()[0]);
                    callback(obj); 
                  }.bind(this), 
                 function(){ /*statment error handler*/}
               );
             }.bind(this) /*transaction error handler*/
       );
   },
   /**
    * Retrieve a single object from the database, but include all of its associated objects.
    * <p><strong>Important Note</strong> This method can be incredibly memory intensive if you have a lot of rows in the database. Make sure to pass in a good Criteria</p>
    * @param {Criteria} criteria - The criteria used to limit the results retrieved. The appropriate table and columns will be added
    *                            to the Criteria object automatically, so you only need to specify the pieces of the WHERE clause.
    *                            It can also be an empty criteria, so doSelect(new Criteria(), ...) is fine if you want to retireve
    *                            all of the associated objects from the database.
    *
    * @param {function} callback(object)  - The function to call when the query completes.
    * @param {connection} [con]           - The database connection to use. Impel.db will be used if it is undefined. 
    * @param {Array} except               - Do not JOIN with the peers in this array
    *
    * @returns {undefined} To access the ImpelClass object that is retreived, pass in a callback function.
    * @see ImpelPeer#retrieveByPkIdJoinAll
    */
    doSelectOneJoinAll: function(criteria, callback, con, except){
            this.doSelectJoinAll(criteria,function(cards){
                                      callback(cards.getValues()[0]);
                                      cards = null;
                                    }, con, except);
    },
    /**
     * Retrieve a single object from the database based on its primary key (id).
     * @param {Number} id      - The value of the id for the object that you want to retrieve
     *
     * @param {function} callback(object)  - The function to call when the query completes.
     * @param {connection} [con]           - The database connection to use. Impel.db will be used if it is undefined. 
     *
     * @returns {undefined} To access the ImpelClass object that is retreived, pass in a callback function.
     * @see ImpelPeer#doSelectOne
     */
   retrieveByPkId: function(id, callback,con){
     if(id == null)
       throw("ImpelPeer::retireveByPkIdJoinAll requires an id argument");
     
     c = new Criteria();
        c.add(this.getBaseObjName()+"Peer::id",id);
     this.doSelectOne(c, callback, con);
     
   },
   /**
    * Retrieve a single object from the database based on its primary key (id), but also retrieve its associated objects.
    * @param {Number} id      - The value of the id for the object that you want to retrieve
    *
    * @param {function} callback(object)  - The function to call when the query completes.
    * @param {connection} [con]           - The database connection to use. Impel.db will be used if it is undefined. 
    * @param {Array} except               - Do not JOIN with the peers in this array
    *
    * @returns {undefined} To access the ImpelClass object that is retreived, pass in a callback function.
    * @see ImpelPeer#doSelectOneJoinAll
    */
   retrieveByPkIdJoinAll: function(id, callback, con, except){
      if(id == null)
        throw("ImpelPeer::retireveByPkIdJoinAll requires an id argument");
      c = new Criteria();
      c.add(this.getBaseObjName()+"Peer::id",id);
      this.doSelectJoinAll(c,function(cards){
                                      callback(cards.getValues()[0]);
                                      cards = null;
                                    }, con, except);
   },
   /**
    * Retrieve objets of the ImpelClass that are associated with this ImpelPeer, but also retieve all the other ImpelClass objects that
    * are associated with each object for this ImpelPeer.
    *
    * @param {Criteria} criteria - The criteria used to limit the results retrieved. The appropriate table and columns will be added
    *                            to the Criteria object automatically, so you only need to specify the pieces of the WHERE clause.
    *                            It can also be an empty criteria, so doSelect(new Criteria(), ...) is fine if you want to retireve
    *                            all of the associated objects from the database.
    *
    * @param {function} callback(object)  - The function to call when the query completes.
    * @param {connection} [con]           - The database connection to use. Impel.db will be used if it is undefined. 
    * @param {Array} except               - Do not JOIN with the peers in this array
    *
    * @returns {undefined} To access the ImpelClass objects that are retreived, pass in a callback function.
    *
    * @example
    * var c = new Criteria();
    *  c.add("CardPeer::id",119);
    * CardPeer.doSelectJoinAllExcept(c,function(cards){ ... }, null, ['CardScore','Stack']);
    */
   doSelectJoinAll: function(criteria, callback, con, except){
      if($type(except) != 'array')
          except = [];
       var c = this.addTable(this.addSelectColumns(criteria));
               this.has_manys.each(function(peer_column){
                 if(except.contains(peer_column.peer.getBaseObjName()))
                    return;
                 c = peer_column.peer.addTable(peer_column.peer.addSelectColumns(c));
                 c.addJoin(this.getBaseObjName()+"Peer::id",peer_column.peer_name+"::"+peer_column.column);
               },this);
               
               this.has_many_throughs.each(function(rel){
                   if(except.contains(rel[0].peer.getBaseObjName()))
                      return;
                   c = rel[0].peer.addTable(rel[0].peer.addSelectColumns(c));
                   c = rel[1].peer.addTable(c);
                   c.addJoin(this.options.base_object+"Peer::id",rel[1].peer_name+"::"+rel[1].column);
                   c.addJoin(rel[0].peer_name+"::"+rel[0].column,rel[2].peer_name+"::"+rel[2].column);
               },this);
                   
                   
                          
       this.executeSQL(c.getSelectSQL(),c.getValues(),
           function(rs){
               var objs   = $H({});
               new ResultSet(rs).toArray().each(function(row){
                   var obj          = new window[this.getBaseObjName()]();
                   var robjs        = [];
                   var robj         = null;
                   
                   obj.hydrate(row);
                   var id  = obj.getId();
                   objs.include(id,obj);
                     obj = null;
                     obj = objs.get(id);
                  
                   this.has_manys.each(function(peer_column){
                       if(except.contains(peer_column.peer.getBaseObjName()))
                          return;
                        
                        robj = new window[peer_column.peer.getBaseObjName()]();
                        robj.hydrate(row);
                        obj['add'+peer_column.peer.getBaseObjName()](robj);
                   },this);
                   
                   this.has_many_throughs.each(function(rel){
                       if(except.contains(rel[0].peer.getBaseObjName()))
                          return;
                     
                        robj = new window[rel[0].peer.getBaseObjName()]();
                        robj.hydrate(row);
                        obj['add'+rel[0].peer.getBaseObjName()](robj);
                   },this);
               },this);
               callback(objs);
             }.bind(this),
             function(e){ throw("Query failed: "+e); }
       );
   },
   
   /**
    * Retrieve objets of the ImpelClass that are associated with this ImpelPeer, but also retieve all the other ImpelClass objects that
    * are associated with each object for this ImpelPeer.
    *
    * @param {Criteria} criteria - The criteria used to limit the results retrieved. The appropriate table and columns will be added
    *                            to the Criteria object automatically, so you only need to specify the pieces of the WHERE clause.
    *                            It can also be an empty criteria, so doSelect(new Criteria(), ...) is fine if you want to retireve
    *                            all of the associated objects from the database.
    *
    * @param {function} callback(object)  - The function to call when the query completes.
    * @param {Array} except               - Do not JOIN with the peers in this array
    * @param {connection} [con]           - The database connection to use. Impel.db will be used if it is undefined. 
    *
    * @returns {undefined} To access the ImpelClass objects that are retreived, pass in a callback function.
    *
    * @example
    * var c = new Criteria();
    *  c.add("CardPeer::id",119);
    * CardPeer.doSelectJoinAllExcept(c,function(cards){ ... }, ['CardScore','Stack']);
    */
   doSelectJoinAllExcept: function(criteria,callback,peers,con){
     if($type(peers) != 'array')
      throw("doSelectJoinAllExcept requires an array of peer names as an argument");
      return this.doSelectJoinAll(criteria,callback,con,peers);
   },
   
   /**
    * Define an one-to-many relationship between this ImpelPeer and another.
    * <p>This ImpelPeer will be modified to include methods to select its associated ImpelClass objects from the database along with the the related 
    *     ImpelClass specified by the peer_column argument. This ImpelPeer's associated ImpelClass will also be modified to include methods for holding 
    *     the related objects.</p>
    * <p>Any calls to save an ImpelClass that uses this ImpelPeer will also save any of the related objects that it has a one-to-many relationship with</p>
    *
    * @param {String} peer_column The Peer::column that relates the two ImpelPeers.
    *
    * @returns {undefined} This ImpelPeer will be modified to include new methods as will the prototype for the associated ImpelClass
    * <h3>Example</h3>
    * <pre class="code brush: js;">
    *   CardTablePeer.hasMany("PlayerPeer::card_table_id");
    * </pre>
    *
    * <h4>This ImpelPeer (CardTablePeer) now includes the following method</h4>
    * <pre class="code brush: js;">
    *   CardTablePeer.doSelectJoinPlayer(criteria,s_callback,con);
    * </pre>
    *
    * <h4>The related ImpelClass (CardTable) now includes the following methods</h4>
    * <pre class="code brush: js;">
    *   CardTable.addPlayer(player);
    *   CardTable.getPlayers();
    * </pre>
    *
    * @see ImpelClass#generateDocs
    */
   hasMany: function(peer_column){
     this.has_manys.set([peer_column],peer_column.parsePeerColumn());
     peer_column                  = this.has_manys[peer_column];
     var adder                    = 'add'+peer_column.peer.options.base_object;
     var getter                   = 'get'+peer_column.peer.options.base_object+'s';
     var holder                   = peer_column.peer.options.base_object.toLowerCase();
     
     var mods           = {};
         mods[getter]   = function(){ 
           return this.attributes[holder] 
         }
         mods[adder]    = function(obj){
                 if(this.attributes[holder] == null)
                   this.attributes[holder] = [];
                 if(this.attributes[holder][obj.getId()] == null)
                   this.attributes[holder].push(obj);
                  // don't forget to record that it has been modified 
         }
     window[this.options.base_object].implement(mods);
     
     
     /** 
      * Now add in Peer methods for retrieving with Joins.
      * For this method to work this Object must have a name equivalent with
      * this.options.base_object+Peer
      *
      */
     var method = "doSelectJoin"+peer_column.peer.options.base_object;
     this[method] = function(criteria, callback, con){
           var c = this.addTable(this.addSelectColumns(criteria));
             c = peer_column.peer.addTable(peer_column.peer.addSelectColumns(c));
             c.addJoin(this.options.base_object+"Peer::id",peer_column.peer_name+"::"+peer_column.column);
             this.executeSQL(c.getSelectSQL(),c.getValues(),
                 function(rs){
                   var objs   = $H({});
                   new ResultSet(rs).toArray().each(function(row){
                       var obj          = new window[this.options.base_object]();
                       var robj         = new window[peer_column.peer.options.base_object]();
                       obj.hydrate(row);
                       var id  = obj.getId();
                       objs.include(id,obj);
                         obj = null;
                         obj = objs.get(id);
                       robj.hydrate(row);
                       obj[adder](robj);
                   },this);
                   callback(objs);
                 }.bind(this),
                 function(e){ throw("Query failed: "+e); }
             );       
     }
   },
   /**
    * Define a many-to-many relationship between this ImpelPeer and another via a third ImpelPeer.
    * <p>This ImpelPeer will be modified to include methods to select its associated ImpelClass objects from the database along with the the related 
    *    ImpelClass specified by the peer_column argument. This ImpelPeer's associated ImpelClass will also be modified to include methods for holding 
    *    the related objects.</p>
    * <p>Any calls to save an ImpelClass that uses this ImpelPeer will also save any of the related objects that it has a many-to-many relationship with.
    *    The save call will also keep the association up to date via the third ImpelPeer</p>
    *
    * @param {String} peer_column The Peer::column that this ImpelPeer has a many-to-many relationship with.
    * @param {String} through_peer_column The Peer::column that associates this Peer with the third Peer
    * @param {String} through_peer_column_relation The peer::column that associates the related Peer with the third Peer
    *
    * @returns {undefined} This ImpelPeer will be modified to include new methods as will the prototype for the associated ImpelClass
    * <h3>Example</h3>
    * <pre class="code brush: js;">
    *   CardPeer.hasManyThrough("StackPeer::id", "CardStackPeer::card_id", "CardStackPeer::stack_id");
    * </pre>
    *
    * <h4>The ImpelPeer (CardPeer) now includes the following method</h4>
    * <pre class="code brush: js;">
    *   CardPeer.doSelectJoinStackThroughCardStack(criteria,s_callback,con);
    * </pre>
    *
    * <h4>The related ImpelClass (CardTable) now includes the following methods</h4>
    * <pre class="code brush: js;">
    *   Card.addStack(stack);
    *   Card.getStacks();
    * </pre>
    *
    * <p>The Card.doSelectJoinAll method will take the many-to-many relationship between CardPeer and StackPeer into account; as will the Card.save() method.</p>
    * <br />
    * <p>Currently, you must manually specify both sides of the many-to-many relationship, so in our example we need to call StackPeer.hasManyThrough as well.</p>
    * <pre class="code brush: js;">
    *   StackPeer.hasManyThrough("CardPeer::id", "CardStackPeer::stack_id", "CardStackPeer::card_id");
    * </pre>
    *
    * <h4>The ImpelPeer (StackPeer) now includes the following method</h4>
    * <pre class="code brush: js;">
    *   StackPeer.doSelectJoinStackThroughCardStack(criteria,s_callback,con);
    * </pre>
    *
    * <h4>The related ImpelClass (Stack) now includes the following methods</h4>
    * <pre class="code brush: js;">
    *   Stack.addCard(card);
    *   Stack.getCards();
    * </pre>
    *
    * @see ImpelClass#generateDocs
    */
   hasManyThrough: function(peer_column,through_peer_column,through_peer_column_relation){
      var skey                        = peer_column+","+through_peer_column+","+through_peer_column_relation;
      this.has_many_throughs.set(skey,[peer_column.parsePeerColumn(),through_peer_column.parsePeerColumn(),through_peer_column_relation.parsePeerColumn()]);
      peer_column                     = this.has_many_throughs[skey][0];
      through_peer_column             = this.has_many_throughs[skey][1];
      through_peer_column_relation    = this.has_many_throughs[skey][2];
      
      var adder  = 'add'+peer_column.peer.options.base_object;
      var getter = 'get'+peer_column.peer.options.base_object+'s';
      var holder = peer_column.peer.options.base_object.toLowerCase();

      var mods = {};
          mods[getter] = function(){ return this.attributes[holder] }
          mods[adder]  = function(obj){
                  if(this.attributes[holder] == null)
                    this.attributes[holder] = [];
                  if(this.attributes[holder][obj.getId()] == null)
                    this.attributes[holder].push(obj);
                 // don't forget to record that it has been modified 
          }
      window[this.options.base_object].implement(mods);

      /** 
       * Now add in Peer methods for retrieving with JoinThroughs.
       * For this method to work this Object must have a name equivalent with
       * this.options.base_object+Peer
       */
      var method = "doSelectJoin"+peer_column.peer.options.base_object+"Through"+through_peer_column.peer.options.base_object;
      this[method] = function(criteria, callback, con){
              var c = this.addTable(this.addSelectColumns( criteria));
                  c = peer_column.peer.addTable(peer_column.peer.addSelectColumns(c));
                  c = through_peer_column.peer.addTable(c);
                  c.addJoin(this.options.base_object+"Peer::id", through_peer_column.peer_name+"::"+through_peer_column.column, CritConstants.LEFT_JOIN);
                  c.addJoin(peer_column.peer_name+"::"+peer_column.column, through_peer_column_relation.peer_name+"::"+through_peer_column_relation.column);
              
              this.executeSQL(c.getSelectSQL(),c.getValues(),
                  function(rs){
                    var objs   = $H({});
                    new ResultSet(rs).toArray().each(function(row){
                        var obj          = new window[this.options.base_object]();
                        var robj         = new window[peer_column.peer.options.base_object]();
                        obj.hydrate(row);
                        var id  = obj.getId();
                        objs.include(id,obj);
                          obj = null;
                          obj = objs.get(id);
                        robj.hydrate(row);
                        obj[adder](robj);
                    },this);
                    callback(objs);
                  }.bind(this),
                  function(e){ throw("Query failed: "+e); }
              );
      }
   },
   /**
    * Determine if Impel is currently deleting an ImpelClass with a specific id.
    * <p>This method is used by Impel to prevent certain race-conditions. It can be used externally, but there should be no need.</p>
    *
    * @param {Number} id The id of the ImpelClass object to check.
    */
   isDeleting: function(id){
     if($type(id) != 'number' || id == 0)
       return false;
     return this.deleting_ids.contains(id);
   },
   /**
    * Record that an ImpelClass object has been deleted.
    * <p>This method is used by Impel to prevent certain race-conditions. It can be used externally, but there should be no need.</p>
    *
    * @param {Number} id The id of the ImpelClass object
    */
   setDeleted: function(id){
     if($type(id) != 'number' || id == 0)
       return false;
     return this.deleting_ids.erase(id); 
   },
   /**
    * Record that an ImpelClass object is being deleted.
    * <p>This method is used by Impel to prevent certain race-conditions. It can be used externally, but there should be no need.</p>
    *
    * @param {Number} id The id of the ImpelClass object
    */
   setDeleting: function(id){
     if($type(id) != 'number' || id == 0)
       return false;
     return this.deleting_ids.push(id); 
   },
   
   /**
    * Generate a documentation page for this object detailing all of it's doSelectJoin* methods, which are automatically generated.
    * <p><strong>Important Note:</strong> The documentation does include the method definitons, but they cannot be copied verbatim 
    * into your code and substituted for the actual automatically generated methods. </p>
    *
    * @returns {String} A jsdoc-toolkit formatted string of declarations
    *
    * <pre class="code brush: js;">
    * /&#x2a;&#x2a;
    *  * Retrieve objects from the database including their associated Compound m-m 
    *  * objects using CardCompound as an intermediary. 
    *  * @param   {Criteria} criteria The Criteria object to use to construct and limit 
    *  *                              the query. 
    *  * @param   {function} callback(Objects[]) The function to pass the results to 
    *  * @param   {Database} [con] The database connection to use.
    *  * @returns {undefined} The callback function will be used to pass the results back
    *  &#x2a;/
    * doSelectJoinCompoundThroughCardCompound : function (criteria, callback, con) {
    *     var c = this.addTable(this.addSelectColumns( criteria));
    *         c = peer_column.peer.addTable(peer_column.peer.addSelectColumns(c));
    *         c = through_peer_column.peer.addTable(c);
    *         c.addJoin(this.options.base_object+"Peer::id", through_peer_column.peer_name + "::" + through_peer_column.column, CritConstants.LEFT_JOIN);
    *         c.addJoin(peer_column.peer_name + "::" + peer_column.column, through_peer_column_relation.peer_name + "::" + through_peer_column_relation.column);
    *
    *     this.executeSQL(c.getSelectSQL(),c.getValues(),
    *           function(rs){
    *             var objs   = $H({});
    *             new ResultSet(rs).toArray().each(function(row){
    *                 var obj     = new window[this.options.base_object]();
    *                 var robj    = new window[peer_column.peer.options.base_object]();
    *                     obj.hydrate(row);
    *
    *                 var id      = obj.getId();
    *                     objs.include(id,obj);
    *                     obj         = null;
    *                     obj         = objs.get(id);
    *
    *                 robj.hydrate(row);
    *                 obj[adder](robj);
    *              },this);
    *            callback(objs);
    *         }.bind(this),
    *         function(e){ 
    *            throw("Query failed: "+e); 
    *         }
    *     );
    * }
    * </pre>
    * @see ImpelClass#generateDocs
    */
   generateDocs: function(){
     var prefix,getters,t,e;
         getters   = [];
         jsdoc     = "";
     for(mem in this){
       // we can use hasOwnProperty here because Peers are instantiations whereas ImpelClasses are new classes.
       // the former has its signature modfied while the latter has its prototype modified.
       if(!this.hasOwnProperty(mem))
        continue;
       prefix = mem.substring(0,"doSelectJoin".length);
       if( mem !== 'doSelectJoinAll' && mem !== 'doSelectJoinAllExcept' && mem.contains("doSelectJoin")){
             getters.push(mem);
       }
     }

     getters.each(function(getter){
       if(getter.contains("Through")){
         t = getter.substring("doSelectJoin".length,getter.indexOf("Through"));  
         e = getter.substring(getter.indexOf("Through") + "Through".length,getter.length)       
         jsdoc += "\n\n/**\n * Retrieve objects from the database including their associated "+ t +" m-m objects using "+ e +" as an intermediary. \n * @param {Criteria} criteria The Criteria object to use to construct and limit the query. \n * @param {function} callback(Objects[]) The function to pass the results to \n * @param {Database} [con] The database connection to use.\n * @returns {undefined} The callback function will be used to pass the results back\n */\n"+getter+" : "+this[getter];
       } else {
         t = getter.substring("doSelectJoin".length,getter.length);
         jsdoc += "\n\n/**\n * Retrieve objects from the database including their associated "+ t +" 1-m objects.\n * @param {Criteria} criteria The Criteria object to use to construct and limit the query. \n * @param {function} callback(Objects[]) The function to pass the results to \n * @param {Database} [con] The database connection to use.\n * @returns {undefined} The callback function will be used to pass the results back\n */\n"+getter+" : "+this[getter];
      }

     },this);


     return jsdoc;
   }
 });
 
 

/**
 * Any class of objects that is to be persisted via Impel must Extend the ImpelClass, contain a 'peer_class' attribute,
 * and be within the scope of window. 
 *
 * <p>Your classes can have any attributes or methods that you want, but only attributes that are defined in the column 
 * object of the associated peer class will be persisted. If you define a toString method the result of that
 * method will be used when your object is used in String context.</p>
 *
 * <p>Every instance of ImpelClass and it's inheritors must have an associated and instantiated ImpelPeer. The Peer object
 * defines the attributes ImpelClass that will be persisted along with where in the database they will be saved.</p>
 *
 * <ul>
 *  <lh><strong>Important Notes:</strong></lh>
 *  <li>The ImpelPeer object must be declared after the ImpelClass class.</li>
 *  <li>Unlike ImpelPeer, ImpelClass should not be directly instantiated. Instead you should create another class that extends ImpelClass</li>
 *  <li>Define the member attributes of this class, that will be persisted, through an associated instance of ImpelPeer.</li>
 *  <li>Member attributes defined via an ImpelPeer will automatically be accessible by get and set methods. If you want to override the getters
 *      and setters then define one ImpelClass along with an ImpelPeer then define another ImpelClass that extends the first. If you don't your
 *      customizations will be overwritten.</li>
 *  <li>You must define the peer_class member manually.</li>
 * </ul>
 *
 * @see ImpelPeer
 *
 * @example
     var Card = new Class({
                          Extends       : ImpelClass,
                          peer_class    : "CardPeer",
                          toString      : function(){
                                            return this.getKanji();
                                          }
                });

     var CardPeer = new ImpelPeer({
                          'columns'     :   { 
                                              'id'          : 'card.id', 
                                              'kanji'       : 'card.kanji', 
                                              'hatsuon'     : 'card.hatsuon',
                                              'meaning'     : 'card.meaning', 
                                              'level'       : 'card.level', 
                                              'created_at'  : 'card.created_at',
                                              'updated_at'  : 'card.updated_at'
                                             },
                          'table'         : 'card',
                          'base_object'   : 'Card'
                   }); 
 *
 * @class ImpelClass
 */
var ImpelClass = new Class({
  Implements: [Options, Events],
  options: {},
  attributes: {},
  is_new: true,
  modified_columns: [],
  is_deleted: false,
  is_deleting: false,
  is_saving: false,
  /**
   * @param {Object} options Options to bind to this ImpelClass object. Currently no configurable Options are supported by this class.
   * @param {Object} events Events to bind to to this ImpelClass object. Currently no Events are fired by this class
   */
  initialize: function(options,events){    
    this.setOptions(options);
    this.addEvents(events);
  },
  /**
   * Retrieve the Peer object from memory.
   */
  getPeer: function(){
    return window[this.peer_class];
  },
  /**
   * After the base peer saves the object to the database it wil call this method on the saved object with 
   * an SQLResultSet, that *should* contain the id of the newly inserted row.
   * <p>We check for the id, update ourselves with it and take ourselves out of the saving state.</p>
   *
   * @param {SQLResultSet} rs - The result set returned by the database query
   *
   * @see ImpelPeer#executeSQL
   * @see ImpelClass#saveOnlyMe
   */
  updateIdFromRS: function(rs){
    if(this.isNew()){
        try{
          this.attributes.id = rs.insertId;
          this.is_new = false;
        } catch(e){
          console.log("Failed to save the new object into the database. Did you manually call isNew(false)? Don't do that");
        }
    }
    
    this.is_saving = false;
    
    if(rs.rowsAffected <= 0){
      if(this.is_deleted){
        throw "Can't update or insert and object that has been deleted";
      }
      throw "INSERT or UPDATE seems to have failed.";
    }
  },

  /**
   * Save this object, but don't bother saving any related objects. 
   * <p>If the object is new use an INSERT statement, but if it is not use an UPDATE statement. Also don't bother with
   * attributes that haven't been set.</p>
   *
   * <p>If the object contains an updated_at or created_at member they will automatically be set to the appropriate time</p>
   *
   *
   * @param {function} [s_callback(object ResultSet)=null]  - The callback to use if the save is succesful
   * @param {function} [f_callback(string error)=null]      - The callback to use if the save is not successful
   *
   * @see ImpelClass.save
   * @see Criteria#getInsertSQL
   * @see Criteria#getUpdateSQL
   */
  saveOnlyMe: function(s_callback,f_callback){
    if(this.is_deleted || window[this.peer_class].isDeleting(this.getId()))
      throw("Can't save an object that has been, or is being deleted: "+this.getId());
    this.is_saving = true;
    
    // only INSERT/UPDATE attributes that have been modified
    var crit = new Criteria();
    this.modified_columns.each(function(column){
        crit.add(this.peer_class+"::"+column,this.attributes[column]);
    },this);
    
    var stmt = "";
    
    // this next section in particular is dubious
    if(this.isNew()){ 
      if(this.attributes['created_at'] != null)
        this.setCreatedAt(Date());
      stmt = crit.getInsertSQL(); 
    }else{
        if(isEmpty(this.attributes.id))
          throw "Objects must have a defined id attribute before they can be updated.";
        if(this.attributes['updated_at'] != null)
          this.setUpdatedAt(Date());
          
        constraintCrit = new Criteria();
          constraintCrit.add(this.peer_class+"::id",this.attributes.id);
          
        stmt  = crit.getUpdateSQL(constraintCrit);
    }
    
    /** 
     * Execute the SQL statement and have the Peer call this object's updateIdFromRS method when complete. We also
     * pass on the callbacks that were passed to us. 
     */
    this.getPeer().executeSQL(stmt,crit.getValues(),s_callback, f_callback,this, 'updateIdFromRS');
    // what happens if stmt is null?
    
  },
  /** 
   * Save any objects that have a one-to-many relationship with this one.
   * <p>Use the Peer's list of one-to-many relationships to access this objects get method for one-to-many objects.
   * Iterate over the list of objects and update any of them that don't have our id, i.e. aren't recorded as 
   * being related to this object.</p>
   *
   * @param {function} [s_callback(object ResultSet)=null]  - The callback to use if the save is succesful
   * @param {function} [f_callback(string error)=null]      - The callback to use if the save is not successful
   *
   * @see ImpelClass.saveMtoMObjsandLink
   *
   */
  saveOneToManyObjs: function(s_callback,f_callback){
      if(this.isNew())
          throw("saveOneToManyObjs cannot be called until this object has been saved");
      
      var dobjsToSave    = []
      this.getPeer().has_manys.each(function(peer_column){
           var dobjs          = this['get'+peer_column.peer.getBaseObjName()+"s"]();
           if(dobjs == null) 
             return;
           // now we check to see if they have our id saved into them
           // but we need to know which attribute holds our id
           // CardPeer.hasMany("CardScorePeer::card_id");
           dobjs.each(function(dobj,index){
               if(dobj[peer_column.getter]() != this.getId())
                  dobj[peer_column.setter](this.getId());
               // we want to save objects that aren't associated, but we also want to save
               // any, already associated objects, that have been modified 
               if(dobj.isModified())
                   dobjsToSave.push(dobj);
           },this);
      },this);
      // these functions should be replaced by a method in this object that keeps track of which ones failed and which ones succeeded
      dobjsToSave.each(function(dobj){ dobj.save($empty,function(e){ throw "Failed to save dependent object. Database error:"+e.message; }); })
  },
  /**
   * Save any related many-to-many objects along with the link between this object and them.
   * <p>If this object was new then there is no possibility that the joining table has an entry for this object and
   * it's related objects, so we must save the link. The related object may not have been previously saved though.
   * If the related object is new then it won't have an id so we can't save the connecting object until after 
   * we've saved it.</p>
   *
   * <p>If this object was not new then it is possible that a link already exists in the database between it and its
   * related objects. We have to check for that link before creating new ones.</p>
   *
   * @param {function} [s_callback(object ResultSet)=null]  - The callback to use if the save is succesful
   * @param {function} [f_callback(string error)=null]      - The callback to use if the save is not successful
   * @param {boolean} wasNew  - Inidicates that this object was new before calling this method. If this parameter is not accurate then the database could become inconsistent
   *
   * @see ImpelClass#saveOneToManyObjs
   */
  saveMtoMObjsandLink: function(s_callback,f_callback,wasNew){
      if(this.isNew())
          throw("saveMtoMObjsandLink cannot be called until this object has been saved");
      var saving  = 0;
      var slept   = 1;
      
      this.getPeer().has_many_throughs.each(function(rel,index){
              var dobjs    = this['get'+rel[0].peer.getBaseObjName()+'s']();
              if(dobjs == null)
                  return;
              dobjs.each(function(dobj,index){
                  var connection = new window[rel[1].peer.getBaseObjName()]();
                      connection[rel[1].setter](this.getId());
                  
                  if(dobj.isNew()){
                          saving++;
                          dobj.save(function(rs){
                              try{ 
                                    connection[rel[2].setter](rs.insertId); 
                                    connection.save(function(){ saving--;},function(e){ throw("database error: "+ e.message);}); 
                                  } catch(e) { 
                                      throw "Saved m-m dependent object, but failed to save connection between them:"+e; 
                                  }
                          }.bind(this),function(e){throw "Failed to save m-m dependent object, will not save connection object:"+e.message});
                  } else {
                      if(wasNew){
                          saveing++;
                          connection[rel[2].setter](dobj.getId());
                          connection.save(function(){ save--;},function(e){ throw("Database error: "+e.message)});
                      } else {
                          /*
                           * If neither object was/is New then it is possible that there is an entry in the joining table,
                           * so we need to check for one before creating it.
                           */
                           var c = new Criteria();
                              c.add(rel[1].orig,this.getId());
                              c.add(rel[2].orig,dobj[rel[2].getter]);
                              rel[2].peer.doSelectOne(c, 
                                  function(rs){
                                      if($type(rs) != 'object')
                                          var connection = new window[rel[1].peer.getBaseObjName()]();
                                              connection[rel[1].setter](this.getId());
                                              connection[rel[2].setter](dobj.getId());
                                              saving++;
                                              connection.save(function(){ save--;},function(e){ throw("Database error: "+ e.message);});
                                  }.bind(this));
                      }
                      // if dobj is modified we need to save it, but we can concurrently save the connection because
                      // dobj is not new and therefore already has an id
                      if(dobj.isModified())
                          dobj.save();
                  }
              },this);
              
      },this);
      
      /** 
       * This is unfortunate, but the only way we know when we've finished saving everything is to wait. It's a bit of a game
       * to figure out the best amount of time to wait during each iteration. It's also risky in that the code above must
       * be rock solid with regards to incrementing and decrementing the saving counter.
       */
      var saveCheck = function(){
          if(slept > 1 && saving == 0)
            s_callback();
          else if(slept > 100)
            f_callback("Failed to save all m-m related objects");
          else{
            this.delay(10,this);
            slept++;
          }          
      }
      saveCheck.delay(50,saveCheck);
      
  },
  /**
   * Has this object been modified since it was last retreived from the database
   */
  isModified: function(){
    return (this.modified_columns.length > 0) ? true : false;
  },
  /**
   * Persist this object in the database or update the appropriate database row to reflect changes in this object since it was last instantiated.
   * <p>If there are other objects associated with this one via 1-m and m-m relationships they will be automatically saved/updated if necessary.</p>
   * <p>If the object contains an updated_at or created_at member they will automatically be set to the appropriate time</p>
   *
   * @param {function} [s_callback({Object} ResultSet)=null]  - The callback to use if the save is succesful
   * @param {function} [f_callback({String} error)=null]      - The callback to use if the save is not successful
   *
   * @see ImpelClass#saveOnlyMe
   */
  save: function(s_callback,f_callback){
      if($type(s_callback) != 'function')
        s_callback = $empty;
      if($type(f_callback) != 'function')
        f_callback = $empty;
      
      if(this.isNew()){
          this.saveOnlyMe(
              function(rs){
                  try{
                      this.saveOneToManyObjs();
                        // the m-to-m save is setup to fire the callback only after all the necessary saves have occured
                        // if the 1-m save takes longer than the m-m we can end up with a race condition...
                      this.saveMtoMObjsandLink(function(){ s_callback(rs); },$empty,true);
                  } catch(e){
                      throw("Failed to save dependent objects: "+ e.message);
                  }
              }.bind(this),
              function(e){
                  console.log("Failed to save base object: "+e);
                  f_callback(arguments);
              });
      } else {
          if(this.isModified())
            this.saveOnlyMe(s_callback,f_callback);
          // we can call saveDeps at the same time as saveOnlyMe because we are not new and therefore have a DB id
          // so saveDeps will still work
          this.saveOneToManyObjs();
          this.saveMtoMObjsandLink($empty,$empty,false);
      }
  },
  /**
   * Mark this object as having been deleted, so that it cannot be saved or updated. This, hopefully, eliminates at least one class of race condition.
   */
  removed: function(){
    this.is_deleted   = true;
    this.getPeer().setDeleted(this.getId());
  },
  /**
   * Remove this object from the database
   * <p>Tell the Peer that this object is being removed, so that it cannot be saved by another process, delete it and then mark it as deleted, so that it cannot be used.
   * The object still exists in memory though ...</p>
   *
   * @param {function} [s_callback({Object} ResultSet)=null]  - The callback to use if the remove is succesful
   * @param {function} [f_callback({String} error)=null]      - The callback to use if the remove is not successful   
   */
  remove: function(s_callback,f_callback){
    if(this.is_saving){
      throw("Can't remove object because it is currently being saved. ");
    }
        
    if(this.isNew()){
      throw("Object does not exist in the database");
    }
    
    this.getPeer().setDeleting(this.getId());
    
    
    var crit = new Criteria();
      crit.add(this.peer_class+"::id",this.getId());
    this.getPeer().executeSQL(crit.getDeleteSQL(),crit.getValues(),s_callback, f_callback,this, 'removed');
  },
  /**
   * Convert an array of columns:values retrieved from the database into attributes of this object.
   * <p>When a SELECT statement is executed on two tables that contain a column with the same name the column name will be prepended with a the table name and a period, e.g., [table.]column.
   * We need to strip off that table name specifier and use only the column name as an attribute. It is also possibe that the results of the query could include columns that are not a 
   * part of this class, so we check if the table matches our peer's table name before using the column.</p>
   *
   * @param {Object} attrs - The column/value pairs retrieved from the database
   */
  hydrate: function(attrs){
    var newAttrs = {};
    $H(attrs).getKeys().each(function(key){
      if(key.contains('.')){
          attr = key.split('.')[1];
          klass = key.split('.')[0];
          if(klass == window[this.peer_class].getTableName())
            newAttrs[attr] = attrs[key];
      } else
       { newAttrs[key] = attrs[key]; }
    },this);
    
    if(newAttrs.id && window[this.peer_class].isDeleting(newAttrs.id))
      throw "Can't hydrate object because it is currently being deleted from the database.";
    
    this.setAttributes(newAttrs);
    this.is_new = false;
  },
  /**
   * Take a list of JSON objects and convert it into attributes for this object. The attributes will be accessible via 
   * camelCase named getters, e.g., updated_at is accessible via the getUpdatedAt method.
   *
   * This method should really only be called internally via the hydrate method.
   *
   * @param {Object} attrs 
   */
  setAttributes: function(attrs){
    this.attributes = $merge.run([this.attributes].extend(arguments));
  },
  /**
   * 
   * This is a vestigial method that should be removed as it exists verbatim in the parent class.
   * @param {Object} options
   */
  setOptions: function(options){
    this.parent(options);
  },
  /**
   * Generate a string representing this object's attributes and their current values.
   * @method getDbug
   */
  getDbug: function(){
    dbg = '';
    $H(this.attributes).getKeys().each(function(key){
      dbg += key + " : " + this.attributes[key] + "\n";
    }.bind(this));
    dbg += "isNew: "+this.isNew()+"\n";
    return dbg;
  },
  /**
   * Log the this objects attributes to the console.
   *
   * @method dbug
   */
  dbug: function(){
    console.log(this.getDbug());
  },
  /**
   * Set this object to new or retireve its current state.
   * If only javascript class methods could be made private ....
   *
   * @param boolean b - If b is defined and is a boolean this objects new status will be set to the value of b.
   *
   * @method isNew
   */
  isNew: function(b){
    if($type(b) == 'boolean')
      this.is_new = b;
    return this.is_new;
  },
  
  /**
   * Generate a documentation page for this object detailing all of it's get and set methods, which are automatically generated
   * by the peer. This method should only be called on a new object.
   * <p><strong>Important Note:</strong> The documentation does include the method definitons, but they cannot be copied verbatim 
   * into your code and substituted for the actual automatically generated methods. </p>
   *
   * @returns {String} A jsdoc-toolkit formatted string of declarations
   *
   * <pre class="code brush: js;">
   *  /&#x2a;&#x2a;
   *   * @param   {mixed} v The value to set the corresponding internal meaning attribute
   *   * @returns {undefined}
   *   &#x2a;/
   *   setMeaning : function (v) { 
   *                  this.attributes[attr] = v;
   *                  this.modified_columns.push(attr);
   *                }
   *
   *  /&#x2a;&#x2a;
   *   * Retrieve the corresponding internal level attribute
   *   * @returns {mixed} The corresponding internal attribute
   *   &#x2a;/
   *   getLevel : function () { 
   *                  return this.attributes[attr]; 
   *               }
   *
   *  /&#x2a;&#x2a;
   *   * Add an associated 1-m or m-m Stack object to object 
   *   * @returns {undefined} 
   *   &#x2a;/
   *   addStack : function (obj) {
   *                 if(this.attributes[holder] == null)
   *                    this.attributes[holder] = [];
   *                 if(this.attributes[holder][obj.getId()] == null)
   *                   this.attributes[holder].push(obj);
   *              }
   *
   *  /&#x2a;&#x2a;
   *   * Retrieve the associated 1-m or m-m Stack objects from this object's internal 
   *   * storage; Not the database.
   *   * @returns {Stack[]} An array of the associated objects 
   *   &#x2a;/
   *   getStacks : function () { 
                 return this.attributes[holder] 
               }
   * </pre>   
   
   
   * @see ImpelPeer#generateDocs
   */
  generateDocs: function(){
    var prefix,jsdoc,setters,getters,adders,mmadders,t;
        getters   = [];
        setters   = [];
        adders    = [];
        mmgetters = [];
        jsdoc     = "";
    for(mem in this){
      prefix = mem.substring(0,3);
      if((prefix === 'get' || prefix === 'set' || prefix === 'add') && (mem !== 'setOptions' && mem !== 'setAttributes' && mem !== 'getDbug' && mem !== 'addEvents' && mem !== 'addEvent' && mem !== 'getPeer') ){
          if(mem.charAt(mem.length - 1) == 's')
            mmgetters.push(mem);
          else if(prefix == 'set')
            setters.push(mem);
          else if(prefix == 'get')
            getters.push(mem);
          else if(prefix == 'add')
            adders.push(mem);
      }
    }
    
    setters.each(function(setter){
      t = setter.substring(3,setter.length).toLowerCase();
      jsdoc += "\n\n/**\n * @param {mixed} v The value to set the corresponding internal "+t+" attribute\n * @returns {undefined}\n */\n"+setter+" : "+this[setter];
    },this);
    
    getters.each(function(getter){
      t = getter.substring(3,getter.length).toLowerCase();
      jsdoc += "\n\n/**\n * Retrieve the corresponding internal "+t+" attribute\n * @returns {mixed} The corresponding internal attribute\n */\n"+getter+" : "+this[getter];
    },this);
   
    adders.each(function(adder){
      t = adder.substring(3,adder.length);
      jsdoc += "\n\n/**\n * Add an associated 1-m or m-m "+ t +" object to object \n * @returns {undefined} \n */\n"+adder+" : "+this[adder];
    },this);
   
    mmgetters.each(function(mmgetter){
      t = mmgetter.substring(3,mmgetter.length - 1);
      jsdoc += "\n\n/**\n * Retrieve the associated 1-m or m-m "+ t +" objects from this object's internal storage. <strong>Not the database</strong> \n * @returns {"+t+"[]} An array of the associated objects \n */\n"+mmgetter+" : "+this[mmgetter];
    },this);
   
    return jsdoc;
  }
});