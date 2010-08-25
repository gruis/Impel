<?php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>


<?php echo $callback?>({
  "version" : 1,
  "table": "cards",
  "create": "CREATE TABLE `card` (`id` INTEGER PRIMARY KEY, `kanji` varchar(255) default NULL, `hatsuon` varchar(255) default NULL, `meaning` varchar(255) default NULL, `level` int(11) default NULL, `created_at` datetime default NULL, `updated_at` datetime default NULL, `session_id` varchar(255) default NULL);",
  "extra" : ["CREATE INDEX card_I_1 ON card(kanji);", "CREATE INDEX card_I_2 ON card(hatsuon);", "CREATE INDEX card_I_3 ON card(meaning);", "CREATE INDEX card_I_4 ON card(level);"],
  "data" : <?php include('cards.sql.json');?>
  });
