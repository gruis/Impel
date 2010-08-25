<?php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>


<?php echo $callback?>({
  "version" : 1,
  "table": "stacks",
  "create": "CREATE TABLE `stack` (`id` INTEGER PRIMARY KEY,`name` varchar(255) default NULL, `created_at` datetime default NULL,`updated_at` datetime default NULL,`session_id` varchar(255) default NULL);",
  "extra" : ["CREATE INDEX stack_I_1 ON stack(name);"],  
  "data" : <?php include('stacks.sql.json');?>
  });