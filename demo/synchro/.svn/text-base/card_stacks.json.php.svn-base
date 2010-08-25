<?php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>


<?php echo $callback?>({
  "version" : 1,
  "table": "card_stacks",
  "create": "CREATE TABLE `card_stack` (`id` INTEGER PRIMARY KEY,`card_id` int(11) default NULL, `stack_id` int(11) default NULL);",
  "extra" : ["CREATE INDEX card_stack_I_1 ON card_stack(card_id);", "CREATE INDEX card_stack_I_2 ON card_stack(stack_id);"],
  "data" : <?php include('card_stacks.sql.json');?>
  });