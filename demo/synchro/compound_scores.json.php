<?php $callback = isset($_REQUEST['callback']) ? $_REQUEST['callback'] : 'callback'; ?>


<?php echo $callback?>({
  "version" : 1,
  "table": "compound_scores",
  "create": "CREATE TABLE `compound_score` (`id` INTEGER PRIMARY KEY,`compound_id` int(11) default NULL,`correct` int(11) default '0',`incorrect` int(11) default '0',`srs_bucket` tinyint(2) NOT NULL default '1',`srs_bucket_changed_on` datetime default NULL,`srs_bucket_was` tinyint(4) default NULL,`module` varchar(255) default NULL,`action` varchar(255) default NULL,`created_at` datetime default NULL,`updated_at` datetime default NULL,`session_id` varchar(255) default NULL);",
  "extra" : ["CREATE INDEX compound_score_I_1 ON compound_score(compound_id);", "CREATE INDEX compound_score_I_2 ON compound_score(module);", "CREATE INDEX compound_score_I_3 ON compound_score(action);", "CREATE INDEX compound_score_I_4 ON compound_score(srs_bucket);", "CREATE INDEX compound_score_I_5 ON compound_score(srs_bucket_changed_on);"],
  "data" : <?php include('compound_scores.sql.json');?>
  });  