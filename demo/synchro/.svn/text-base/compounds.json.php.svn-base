<?php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>


<?php echo $callback?>({
  "version" : 1,
  "table": "compounds",
  "create": "CREATE TABLE `compound` (`id` INTEGER PRIMARY KEY, `kanji` varchar(255) default NULL,`hatsuon` varchar(255) default NULL,`meaning` varchar(255) default NULL,  `level` int(11) default NULL,  `created_at` datetime default NULL,  `updated_at` datetime default NULL,  `session_id` varchar(255) default NULL );",
  "extra" : ["CREATE INDEX compound_I_1 ON compound(kanji);", "CREATE INDEX compound_I_2 ON compound(hatsuon);", "CREATE INDEX compound_I_3 ON compound(meaning);", "CREATE INDEX compound_I_4 ON card(level);"],
  "data" : <?php include('compounds.sql.json');?>
  });
