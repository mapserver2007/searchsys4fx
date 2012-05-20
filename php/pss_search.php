<?php
require_once('pss_config.php');
require_once('json.php'); 

//値のチェック
$kw = h($_POST['keyword']);
$opt_title  = $_POST['opt_title'];
$opt_artist = $_POST['opt_artist'];
$opt_music  = $_POST['opt_music'];
$cat_cd     = $_POST['cat_cd'];
$cat_doujin = $_POST['cat_doujin'];
//一度に表示する件数(3の倍数の値推奨)
//$display = 30;
$display = $_POST['display'];
$limit = $display / ($opt_title + $opt_artist + $opt_music);
//ページ番号
$page = $_POST['page'];

//SQL定義
$data = array(
	array(
		"table" => "album",
		"column" => array(
			"ID" => "id",
			"Title" => "title",
			"Count" => "count(title)"
		),
		"sql" => "",
		"search" => "Title", //配列を特定するために指定
		"limit" => $limit * $page,
		"offset" => $limit,
		"category" => array(
			"cd" => $cat_cd ? "CD" : null,
			"doujin" => $cat_doujin ? "同人音楽" : null
		)
	),
	array(
		"table" => array("syousai", "artist"),
		"column" => array(
			"ID" => "syousai.id", 
			"AlbumID" => "syousai.album_id",
			"Artist" => "syousai.artist",
			"ArtistID" => "artist.artist_id",
			"Count" => "count(syousai.artist)"
		),
		"sql" => "",
		"search" => "Artist", //配列を特定するために指定
		"limit" => $limit * $page,
		"offset" => $limit,
		"category" => array(
			"cd" => $cat_cd ? 1 : null,
			"doujin" => $cat_doujin ? 2 : null
		)
	),
	array(
		"table" => "syousai",
		"column" => array(
			"ID" => "id",
			"Music" => "music_name",
			"Count" => "count(music_name)"
		),
		"sql" => "",
		"search" => "Music", //配列を特定するために指定
		"limit" => $limit * $page,
		"offset" => $limit,
		"category" => array(
			"cd" => $cat_cd ? 1 : null,
			"doujin" => $cat_doujin ? 2 : null
		)
	)
);

//タイトル検索SQL
if($opt_title){
	$sqlbuilder = new SQLBuild(1);
	$sqlbuilder->setTable($data[0]["table"]);
	$sqlbuilder->addSelectCols($data[0]["column"]);
	$sqlbuilder->setWhereOrArray('category', $data[0]["category"]);
	$sqlbuilder->setWherelike('title', $kw);
	$sqlbuilder->setGroupby('title');
	$sqlbuilder->setOrderby('title');
	$sqlbuilder->setLimit($data[0]["limit"], $data[0]["offset"]);
	$data[0]["sql"] = $sqlbuilder->makeSQL();
}
//アーティスト検索SQL
if($opt_artist){
	$sqlbuilder = new SQLBuild(1);
	$sqlbuilder->setTable($data[1]["table"]);
	$sqlbuilder->addSelectCols($data[1]["column"]);
	$sqlbuilder->setWhereOrArray('category_no', $data[1]["category"]);
	$sqlbuilder->setWhere(array("syousai.artist", "artist.artist_name"), null);
	$sqlbuilder->setWherelike('artist', $kw);
	$sqlbuilder->setGroupby('artist');
	$sqlbuilder->setOrderby('artist');
	$sqlbuilder->setLimit($data[1]["limit"], $data[1]["offset"]);
	$data[1]["sql"] = $sqlbuilder->makeSQL();
}
//曲名検索SQL
if($opt_music){
	$sqlbuilder = new SQLBuild(1);
	$sqlbuilder->setTable($data[2]["table"]);
	$sqlbuilder->addSelectCols($data[2]["column"]);
	$sqlbuilder->setWhereOrArray('category_no', $data[1]["category"]);
	$sqlbuilder->setWherelike('music_name', $kw);
	$sqlbuilder->setGroupby('music_name');
	$sqlbuilder->setOrderby('music_name');
	$sqlbuilder->setLimit($data[2]["limit"], $data[2]["offset"]);
	$data[2]["sql"] = $sqlbuilder->makeSQL();
}

//SQL実行
$ary2json = "";
foreach($data as $child){
	if(!$child["sql"]) continue;
	$jkey1 = $child["search"];
	$ary2json["Offset"][$jkey1] = $child["offset"];
	$ary2json["SQL"][$jkey1] = $child["sql"];
	
	$db = new DB;
	$db->DBConnect();
	$db->executeSQL($child["sql"]);
	$j = 0;
	while($row = $db->executeFetch()){
		$gchild = $child["column"];
		foreach($row as $k => $v){ //key:id,title,count(title),...
			if(is_string($k)){//キーが連想のもののみ取り出す
				foreach($gchild as $gkey => $gvalue){ //key:ID,Title,Count,..
					if($gkey == $k){
						$ary2json[$jkey1][$j][$gkey] = $v;
					}
				}
			}
		}
		$j++;
	}
	$db->DBClose();
}

//JSONに変換
$json = new Services_JSON; 
$encode = $json->encode($ary2json);
echo $encode;
?>