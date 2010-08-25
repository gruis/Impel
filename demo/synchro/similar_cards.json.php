<?php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>


<?php echo $callback?>({
  "version" : 1,
  "table": "similar_cards",
  "create": "CREATE TABLE `similar_card` (`id` INTEGER PRIMARY KEY,`card_id` int(11) default NULL,`similar_card_id` int(11) default NULL,`session_id` varchar(255) default NULL,`created_at` datetime default NULL, `updated_at` datetime default NULL);",
  "data" : <?php include('similar_cards.sql.json');?>
  });