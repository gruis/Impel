<?php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>


<?php echo $callback?>({
  "version" : 1,
  "table": "card_compounds",
  "create": "CREATE TABLE `card_compound` (`id` INTEGER PRIMARY KEY,`card_id` int(11) default NULL,`compound_id` int(11) default NULL,`created_at` datetime default NULL);",
  "extra" : ["CREATE INDEX card_compound_I_1 ON card_compound(card_id);", "CREATE INDEX card_compound_I_2 ON card_compound(compound_id);"],
  "data" : <?php include('card_compounds.sql.json');?>
  });



  