<?php
//登録数チェック処理
require_once('pss_config.php');
require_once('json.php'); 

//実行するSQL
$sql = array(
	"cd_title" => array(
		"sql" => "select count(id) Count from album where category = 'CD'",
		"unit" => "枚"
	),
	"cd_music" => array(
		"sql" => "select count(id) Count from syousai where category_no = 1",
		"unit" => "曲"
	),
	"dj_title" => array(
		"sql" => "select count(id) Count from album where category = '同人音楽'",
		"unit" => "枚"
	),
	"dj_music" => array(
		"sql" => "select count(id) Count from syousai where category_no = 2",
		"unit" => "曲"
	)
);

//JSON変数
$ary2json = "";

$i = 0;
foreach($sql as $key => $value){
	$db = new DB;
	$db->DBConnect();
	$db->executeSQL($value["sql"]);
	$row = $db->executeFetch();
	$ary2json[$i]["Count"] = $row["Count"];
	//$ary2json[$i]["Message"] = $value["message"];
	$ary2json[$i]["Unit"] = $value["unit"];
	$db->DBClose();
	$i++;
}

//JSONに変換
$json = new Services_JSON; 
$encode = $json->encode($ary2json);
echo $encode;

?>