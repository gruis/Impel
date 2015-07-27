/**
 * The model portion for duplicating Cards backend functionality in Javascript on the client.
 */

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