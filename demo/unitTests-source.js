/**
 * Unit Tests are functions that take a single argument (chain), run their tests and then
 * report success, failure or inconclusive results to the chain.
 *
 * The only way - without locking up the browser - to know when an asynchronous function has completed
 * is for that function to tell you. When we call a unit test we, therefore, hand it a chain object 
 * containing the remaining tests. Once the unit test completes it must call one of three methods on 
 * the chain object: 
 *  method next()             - The current test has finished, just move on to the next one
 *  method failure(unitTest)  - The current test has failed, now move onto the next
 *                              @params string unitTest - The name of the test that failed
 *  method success(unitTest)  - The current test has succeeded, now move onto the next
 *                              @params string unitTest - The name of the test that succeeded
 */


var addSameColumnUnitTest           = function(chain){
  var c = new Criteria();
      c.add("CardPeer::kanji","blah");
      c.add("CardPeer::kanji","zzzz");
  dbug.log(c.getUpdateSQL(new Criteria()),c.getValues());
  if(c.getValues().length > 1)
    chain.failure("addSameColumnUnitTest");
  else
    chain.success("addSameColumnUnitTest");
  
}
var mmSave                          = function(chain){
  var card,score,confirmCard,c = null;
    card = new Card();
      card.setKanji("calev");
      card.setMeaning("dog");
    compound = new Compound();
      compound.setKanji("caleverine");
      
  card.addCompound(compound);
  card.save(function(){
              dbug.log(card.getId());
              c = new Criteria();
              try{
                CardPeer.retrieveByPkIdJoinAll(card.getId(),
                                          function(confirmCard){
                                            display(confirmCard.getDbug());
                                            if(confirmCard.getCompounds().length != 1)
                                              chain.failure("mmSave");
                                            else
                                              chain.success("mmSave");
                                          }, null, ["CardScore","Stack"]);
              } catch (e){
                dbug.log("race condition discovered with save then immediately retrieving object via pkid");
                chain.failure("mmSave");
              }
            }, 
            function(e){chain.failure("mmSave"); dbug.log("mmSave - database error: " + e);});
}


var nmSave                          = function(chain){
  var card,score,confirmCard,c = null;
    card = new Card();
      card.setKanji("calev");
      card.setMeaning("dog");
    score = new CardScore();
      score.setCorrect(10);
      score.setIncorrect(2);
  
  card.addCardScore(score);
  card.save(function(){
              dbug.log(card.getId());
              c = new Criteria();
              try{
                CardPeer.retrieveByPkIdJoinAll(card.getId(),
                                          function(confirmCard){
                                            display(confirmCard.getDbug());
                                            
                                            if(confirmCard.getCardScores().length != 1)
                                              chain.failure("nmSave");
                                            else
                                              chain.success("nmSave");
                                            
                                          }, null, ["Compound","Stack"]);
              } catch (e){
                dbug.log("race condition discovered with save then immediately retrieving object via pkid");
                chain.failure("nmSave");
              }
            }, 
            function(e){chain.failure("nmSave"); dbug.log("nmSave - database error: " + e);});  
}
var executeSQLUnitTest              = function(chain){
   var c = CardPeer.addTable(CardPeer.addSelectColumns( new Criteria()));
     c.setLimit(1);
     
   var b = CardPeer.addTable(CardPeer.addSelectColumns( new Criteria()));
       b = CardCompoundPeer.addTable(CardCompoundPeer.addSelectColumns(b));
       b.setLimit(1);
       b.addJoin("CardPeer::id","CardCompoundPeer::card_id");

   var partTwo = function(){
     CardPeer.executeSQL(b.getSelectSQL(),b.getValues(),
         function(rs){
           /** Success */
           dbug.log("Part Two Result Set:");
           dbug.log(rs);
           for (var i=0; i<rs.rows.length; i++){
               dbug.log(rs.rows.item(i));
           }
           chain.success('executeSQLUnitTest');
         }, 
         function(){ chain.failure('executeSQLUnitTest');}
     );      
   }

   CardPeer.executeSQL(c.getSelectSQL(),c.getValues(),
       function(rs){
         /** Success */
         dbug.log("Part One Result Set:");
         dbug.log(rs);
         for (var i=0; i<rs.rows.length; i++){
             dbug.log(rs.rows.item(i));
         }
         partTwo();
       },
       function(){ chain.failure('executeSQLUnitTest'); }
   );
}
var hydrateUnitTest                 = function(chain){
 var c = CardPeer.addTable(CardPeer.addSelectColumns( new Criteria()));
   c = CardCompoundPeer.addTable(CardCompoundPeer.addSelectColumns(c));
   c = CompoundPeer.addTable(CompoundPeer.addSelectColumns(c));
   c.setLimit(1);
   c.addJoin("CardPeer::id","CardCompoundPeer::card_id");
   c.addJoin("CompoundPeer::id","CardCompoundPeer::compound_id");
   
   CardPeer.executeSQL(c.getSelectSQL(),c.getValues(),
       function(rs){
         /** Success */
         dbug.log("Hydrate Result Set:");
         dbug.log(rs.rows.item(0));
         
         rs                = new ResultSet(rs).toArray()[0];
         var card          = new Card();
         var cardCompound  = new CardCompound();
         var compound      = new Compound();
         
           card.hydrate(rs);
           cardCompound.hydrate(rs);
           compound.hydrate(rs);
           
           dbug.log(card);
           dbug.log(cardCompound);
           dbug.log(compound);
           display("oo.. Card ..oo\n"+card.getDbug());
           display("oo.. CardCompound ..oo\n"+cardCompound.getDbug());
           display("oo.. Compound ..oo\n"+compound.getDbug());
           chain.success('hydrateUnitTest');
       },
       function(){ chain.failure('hydrateUnitTest'); }
   );
}

var doSelectCardJoinStackThroughCardStackUnitTest = function(chain){
  var c = new Criteria();
          var crit = c.getNewCriterion("CardPeer::id",119);
              crit.addOr(c.getNewCriterion("CardPeer::id",1004));
  c.add(crit);

  CardPeer.doSelectJoinStackThroughCardStack(c,function(cards){
      dbug.log("Retrieved " + cards.getLength() + " cards");
      dbug.log(cards);
      cards.each(function(card){
          display("oo.. Card ..oo\n"+card.getDbug());
          card.getStacks().each(function(cc){
              display("oo.. CardStack ..oo\n"+cc.getDbug());
          });
      });
      chain.success('doSelectCardJoinWithStackThroughCardStackUnitTest');
  });

}
var doSelectJoinAllUnitTest         = function(chain){
      dbug.log("doSelectJoinAllUnitTest");
      var c = new Criteria();
        c.setLimit(10);
        c.addDescendingOrderByColumn("CardPeer::id");
      CardPeer.doSelectJoinAll(c,
                function(cards){ 
                    cards.each(function(card){
                      display(card.getDbug());
                    });
                    if(cards.getLength() > 0)
                      chain.success("doSelectJoinAllUnitTest");
                    else 
                      chain.failure("doSelectJoinAllUnitTest");
                }, null, ["CardScore"]);
}
var doSelectOneJoinAllUnitTest      = function(chain){
      dbug.log("doSelectOneJoinAllUnitTest");
      var c = new Criteria();
          c.add("CardPeer::kanji","直")
      CardPeer.doSelectOneJoinAll(c,
                function(card){ 
                      display(card.getDbug());
                      if(card != null)
                        chain.success("doSelectOneJoinAllUnitTest");
                      else 
                        chain.failure("doSelectOneJoinAllUnitTest");
                }, null, ["CardScore"]);
}
var retrieveByPkIdJoinAllUnitTest   = function(chain){
      dbug.log("retreiveByPkIdJoinAllUnitTest");
      var c = new Criteria();
      CardPeer.retrieveByPkIdJoinAll('1331',
                function(card){ 
                      display(card.getDbug());
                      if(card != null)
                        chain.success("retrieveByPkIdJoinAllUnitTest");
                      else 
                        chain.failure("retrieveByPkIdJoinAllUnitTest");
                },null, ["CardScore"]);
}
var retrieveByPkIdUnitTest          = function(chain){
      dbug.log("retreiveByPkIdUnitTest");
      var c = new Criteria();
      CardPeer.retrieveByPkId('1331',
                function(card){ 
                      display(card.getDbug());
                      if(card != null)
                        chain.success("retrieveByPkIdUnitTest");
                      else 
                        chain.failure("retrieveByPkIdUnitTest");
                });
}

var doSelectJoinAllExceptUnitTest   = function(chain){
      var c = new Criteria();
        c.add("CardPeer::id",119);
      CardPeer.doSelectJoinAllExcept(c,
                function(cards){ 
                    cards.each(function(card){
                      display(card.getDbug());
                    });
                }, ['CardScore','Stack']);
      chain.next();
}

var doSelectJoinAllExceptBetaUnitTest = function(chain){
      var c = new Criteria();
        c.add("CardPeer::id",119);
      CardPeer.doSelectJoinAll(c,
                function(cards){ 
                    cards.each(function(card){
                      display(card.getDbug());
                    });
                }, null, ['CardScore','Stack']);
      chain.next();
}

var doSelectJoinUnitTest            = function(chain){
 var c = new Criteria();
         var crit = c.getNewCriterion("CardPeer::id",119);
             crit.addOr(c.getNewCriterion("CardPeer::id",1004));
 c.add(crit);
 
 CardPeer.doSelectJoinCardCompound(c,function(cards){
     dbug.log("Retrieved " + cards.getLength() + " cards");
     dbug.log(cards);
     cards.each(function(card){
         display("oo.. Card ..oo\n"+card.getDbug());
         card.getCardCompounds().each(function(cc){
             display("oo.. CardCompound ..oo\n"+cc.getDbug());
         });
     });
     chain.success('doSelectJoinTestUnit');
 });
 
}
var doSelectJoinThroughUnitTest     = function(chain){
 var c = new Criteria();
         var crit = c.getNewCriterion("CardPeer::id",119);
             crit.addOr(c.getNewCriterion("CardPeer::id",1004));
 c.add(crit);
 
 CardPeer.doSelectJoinCompoundThroughCardCompound(c,function(cards){
     dbug.log("Retrieved " + cards.getLength() + " cards");
     dbug.log(cards);
     cards.each(function(card){
         display("oo.. Card ..oo\n"+card.getDbug());
         card.getCompounds().each(function(cc){
             display("oo.. CardCompound ..oo\n"+cc.getDbug());
         });
     });
     chain.success('doSelectJoinTestUnit');
 });
 
}


var dumbJoinTestUnit                = function(chain){
  chain.next();
  return;
  if(requestParams.has('stack')){
    crit = new Criteria()
    crit.add("StackPeer::name",requestParams.get('stack'));
    StackPeer.doSelectOne(crit,function(stack){
        display(stack.getDbug());
        stack.getCardStacks(function(card_stacks){
          display("Stack contains: "+card_stacks.length + " cards");
          if(card_stacks.length <= 0){
            chain.failure("dumbJoinTestUnit");
            return;
          }
          var i = 0;
          card_stacks.each(function(card_stack){
              card_stack.getCard(function(card){
                  i++;
                  display(card.getDbug());
                  if(i >= card_stacks.length){
                    dbug.log("finished retrieval of all cards from card_stack");
                    chain.next();
                  }
              });
          });
        });
    });
  } else {
    throw("Can't execute dumbJoinTestUnit without a stack argument");
    chain.next();
  }
}
var leftJoinTestUnit                = function(chain){
  //crit.addJoin('CardPeer::id','CardCompoundPeer::card_id',crit.LEFT_JOIN);
  //crit.addJoin('CardCompoundPeer::compound_id','CompoundPeer::id',crit.LEFT_JOIN);
  chain.next();
}
var selectJoinTestUnit              = function(chain){
  //CardStackPeer.doSelectJoinCard(crit);
  chain.next();
}

var limitTestUnit                   = function(chain){
  display("limitTestUnit\n");
  crit = new Criteria();
    crit.add("CardPeer::level",3);
    crit.setLimit(2);
    CardPeer.doSelect(crit,function(cards){
      if(cards.length != 2)
        chain.failure("limitTestUnit");
      chain.success('limitTestUnit');
    });
}

var findCardsByStackTestUnit        = function(chain){
    dbug.log("stackTestUnit:");
    if(requestParams.has('stack')){
        var stack = requestParams.get('stack');
        var failed = false;
        crit = new Criteria();
          crit.add('StackPeer::name', stack);
          CardPeer.doSelectJoinStackThroughCardStack(crit,function(cards){
            display("Retrieved "+cards.length+" cards");
            /** Enable this when selectJoin is supported */
            cards.each(function(card){ 
                display(card.getDbug()); 
                card.getStacks().each(function(lstack){
                    if(lstack.getName() != stack) 
                      failed = true; 
                });
            });
            if(failed){
              chain.failure('findbyStackTestUnit');
            }else{
              chain.success('findbyStackTestUnit');
            }
            chain.next();
          }, function(e) { dbug.log("error:"); dbug.log(e);});
    }else {
      throw("Can't execute findByStackTestUnit without a stack argument");
      chain.next();
    }
}
var findCardsByKanjiTestUnit        = function(chain){
  if(requestParams.has('kanji')){
    var failed      = false;
    var kanji       = requestParams.get('kanji');
    var criteria    = new Criteria();
      criteria.add('CardPeer::kanji',kanji);
      CardPeer.doSelect(criteria,function(cards){
        display("Retrieved "+cards.length+" cards");
        cards.each(function(card){ display(card.getDbug()); if(card.getKanji() != kanji ) failed = true; });
        if(failed){
          chain.failure('findCardByKanjiTestUnit');
        }else{
          chain.success('findCardbyKanjiTestUnit');
        }
      });
  } else {
    throw("Can't execute findCardByKanjiTestUnit without kanji request parameter");
    chain.next();
  }      
}
var findCardsByLevelTestUnit        = function(chain){
  if(requestParams.has('level')){
    var failed      = false;
    var level       = requestParams.get('level');
    var criteria    = new Criteria();
      criteria.add('CardPeer::level',level);
      c.setLimit(20);
      CardPeer.doSelect(criteria,function(cards){
        display("Retrieved "+cards.length+" cards");
        cards.each(function(card){ if(card.getLevel() != level ) failed = true; });
        if(failed){
          chain.failure('findCardByLevelTestUnit');
        }else{
          chain.success('findCardbyLevelTestUnit');
        }
      });
  } else {
    throw("Can't execute findCardByLevelTestUnit without level request parameter");
    chain.next();        
  }
}
var findCompoundsByLevelTestUnit    = function(chain){
  if(requestParams.has('level')){
    var failed      = false;
    var level       = requestParams.get('level');
    var criteria    = new Criteria();
      criteria.add('CompoundPeer::level',level);
      c.setLimit(20);
      CompoundPeer.doSelect(criteria,function(compounds){
        display("Retrieved "+compounds.length+" compounds");
        compounds.each(function(compound){ if(compound.getLevel() != level ) failed = true; });
        if(failed){
          chain.failure('findCompoundByLevelTestUnit');
        }else{
          chain.success('findCompoundbyLevelTestUnit');
        }
      });
  } else {
    throw("Can't execute findCompoundByLevelTestUnit without level request parameter");
    chain.next();
  }
}

var criterionTestUnit1              = function(chain){
  console.log("criterion TestUnit1");
    var c = new Criteria();
    crit = c.getNewCriterion('CardPeer::id','233');
      crit.addOr(c.getNewCriterion('CardPeer::id','231'));
    c.add(crit);
    c.add("CardPeer::meaning","shit");
    dbug.log("crit: "+crit.getDbug());
    dbug.log("c: "+c.getSelectSQL()+"["+c.getValues()+"]");
  chain.next();
}
var criterionTestUnit2              = function(chain){
  console.log("Test 2");
    var c = new Criteria();
      crit1 = c.getNewCriterion('CardPeer::meaning','junk');
      crit2 = c.getNewCriterion('CardPeer::id',[23,43,67], CritConstants.IN);
    crit1.addOr(crit2);
    c.add(crit1);
    dbug.log("crit: "+crit1.getDbug());
    dbug.log("c: "+c.getSelectSQL()+"["+c.getValues()+"]");

  chain.next();
}
var criterionTestUnit3              = function(chain){
    console.log("Test 3")
      var c = new Criteria();
        c.addOr("CardPeer::hatsuon","クッソ");
        c.addOr("CardPeer::meaning","shit");
      dbug.log("c: "+c.getSelectSQL()+"["+c.getValues()+"]");

    chain.next();
}
var criterionTestUnit4              = function(chain){
    console.log("Testing Insert");
      var card  = new Card();
        card.setHatsuon("eeeee");
        card.setMeaning("wahaaaa");
      var c     = new Criteria();
        c.add('CardPeer::hatsuon',card.getHatsuon());
        c.add('CardPeer::meaning',card.getMeaning());
      dbug.log("c: "+c.getInsertSQL()+"["+c.getValues()+"]");

    chain.next();
}
var criterionTestUnit5              = function(chain){
    console.log("Testing Update");
      var card  = new Card();
        card.setHatsuon("eeeee");
        card.setMeaning("wahaaaa");
      var c     = new Criteria();
        c.add('CardPeer::hatsuon',card.getHatsuon());
        c.add('CardPeer::meaning',card.getMeaning());
      var cons   = new Criteria();
        cons.add('CardPeer::id',232);
      dbug.log("c: "+c.getUpdateSQL(cons)+"["+c.getValues()+"]");
    chain.next();
}
var deleteTestUnit              = function(chain){
    console.log("Testing Delete");
      var c = new Criteria();
        c.add('CardPeer::meaning','bitch');
        c.addAscendingOrderByColumn('CardPeer::id');
        CardPeer.doSelectOne(c,function(card){
            display("\n!!..!!\nDeleting a card\n"+card.getDbug());
            dbug.log("removing a card:"+card.getId());
            card.remove(function(){dbug.log("deleted")},function(){dbug.log("not deleted");});
        });
    chain.next();
}


var createNewCardTestUnit           = function(chain){
  var card = new Card();
    card.setHatsuon('bbbbbbb');
    display(card.getDbug());
  chain.next();
}
var saveTestUnit                    = function(chain){
    console.log("saveTestUnit");
      var card = new Card();
        card.setMeaning('bitch');
        display("...00oo00...\nSaving a card\n"+card.getDbug()+"\n");
        card.save(function(rs){
                      display("\n...ooOOoo...\nSaved a card!\n"+card.getDbug()); 
                      if($type(card.getId()) == 'number' && card.getId() > 0)
                        { chain.success('saveTestUnit'); }
                      else
                        { chain.failure('saveTestUnit'); }
                  }, 
                  function(error){
                      display("\n...ooOOoo.. \nFailed to save the card\n");
                      dbug.log("save failed!", error); 
                      chain.failure('saveTestUnit'); 
                  }
       );
}
var updateTestUnit                  = function(chain){
    console.log("Testing update");
      var c = new Criteria();
        c.add("CardPeer::meaning","bitch");
      CardPeer.doSelectOne(c,function(card){
          display("Updating card:\n"+card.getDbug());
          card.setMeaning("big bitch");
          card.save( function(rs){ 
                        display("Updated card:\n"+card.getDbug()); 
                        if(card.getMeaning() == "big bitch") {
                            chain.success('updateTestUnit');
                        } else { 
                          chain.failure('updateTestUnit'); 
                        } 
                      }, 
                     function(error){ 
                        dbug.log("save failed!",error); 
                        chain.failure('updateTestUnit'); 
                      } 
          );
      });

}

var updateAllTestUnit               = function(chain){
  var c = new Criteria();
      c.add("CardPeer::updated_at",new Date().toString());
      
      //var stmt = c.getUpdateSQL(new Criteria()) + c.getValues();
      
      CardPeer.executeSQL(c.getUpdateSQL(new Criteria()), c.getValues(), 
                          function(){
                              dbug.log("success!");
                              chain.success("updateAllTestUnit");
                          }, 
                          function(e){
                            dbug.log("failure: "+ e);
                            chain.failure("updateAllTestUnit");
                          });
      
      dbug.log(stmt);
}

var nothingSpecialTestUnit          = function(chain){
  console.log("NothingSpecial");
  var n = new NothingSpecial();
      n.setName("Sad Sack");
      n.save(function(){
                dbug.log("saved!");
                chain.success("nothingSpecialTestUnit");
             },
             function(e){
                dbug.log("failed! " + e);
                chain.failure("nothingSpecialTestUnit");
             });
}