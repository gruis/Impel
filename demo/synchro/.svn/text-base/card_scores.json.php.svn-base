<?php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>


<?php echo $callback?>({
  "version" : 1,
  "table": "card_scores",
  "create": "CREATE TABLE `card_score` (`id` INTEGER PRIMARY KEY,`card_id` int(11) default NULL,`correct` int(11) default '0',`incorrect` int(11) default '0',`srs_bucket` tinyint(2) NOT NULL default '1',`srs_bucket_changed_on` datetime default NULL,`srs_bucket_was` tinyint(4) default NULL,`module` varchar(255) default NULL,`action` varchar(255) default NULL,`created_at` datetime default NULL,`updated_at` datetime default NULL,`session_id` varchar(255) default NULL);",
  "indexes" : ["CREATE INDEX card_score_I_1 ON card_score(card_id);", "CREATE INDEX card_score_I_2 ON card_score(module);", "CREATE INDEX card_score_I_3 ON card_score(action);", "CREATE INDEX card_score_I_4 ON card_score(srs_bucket);", "CREATE INDEX card_score_I_5 ON card_score(srs_bucket_changed_on);"],
  "data" : <?php include('card_scores.sql.json');?>
  });
  