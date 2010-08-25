<?php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>


<?php echo $callback?>({
  "version" : 1,
  "table": "compound_stacks",
  "create": "  CREATE TABLE `compound_stack` ( `id` INTEGER PRIMARY KEY,`compound_id` int(11) default NULL, `stack_id` int(11) default NULL);",
  "extra" : ["CREATE INDEX compound_stack_I_1 ON compound_stack(compound_id);", "CREATE INDEX compound_stack_I_2 ON compound_stack(stack_id);"],
  "data" : <?php include('compound_stacks.sql.json');?>
  });  