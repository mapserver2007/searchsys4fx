<?php
require_once('pss_config.php');
require_once('json.php'); 

//値のチェック
$id  = $_POST['id'];
$opt = $_POST['opt'];
$kw  = $_POST['kw'];

$ary2json = "";
//詳細
if($opt == "t"){
	$data = array(
		"table" => array("album", "syousai"),
		"column" => array(
			//"AlbumID" => "album.id",
			"Category" => "album.category",
			"Hozon" => "album.hozon",
			"Img" => "album.image",
			"SID" => "syousai.id",
			"Music" => "syousai.music_name",
			"Artist" => "syousai.artist",
			"Idx" => "syousai.index_no"
		),
		"search" => "Detail",
		"option" => $opt,
		"noreg" => array(
			"table" => "album",
			"column" => array(
				"AlbumID" => "id",
				"Img" => "image",
				"Category" => "category",
				"Hozon" => "hozon"
			),
			"where" => array(
				"id" => $id
			)
		),
		"sql" => ""
	);
	//SQL
	$sqlbuilder = new SQLBuild(1);
	$sqlbuilder->setTable($data["table"]);
	$sqlbuilder->addSelectCols($data["column"]);
	$sqlbuilder->setWhere('album.id', $id);
	$sqlbuilder->setWhere(array('album.id', 'syousai.album_id'), null);
	$sqlbuilder->setOrderby('syousai.index_no');
	$data["sql"] = $sqlbuilder->makeSQL();
}else if($opt == "a"){
	$data = array(
		"table" => array("syousai", "artist"),
		"column" => array(
			"ID" => "syousai.id",
			//"ArtistID" => "artist.artist_id",
			"Music" => "syousai.music_name",
			"Count" => "count(syousai.id)"
		),
		"sub" => array(
			"table" => "artist",
			"column" => "artist_name"
		),
		"search" => "Detail",
		"option" => $opt,
		"sql" => ""
	);
	//SQL
	$sqlbuilder = new SQLBuild(1);
	$sqlbuilder->setTable($data["table"]);
	$sqlbuilder->addSelectCols($data["column"]);
	$sqlbuilder->setWhere('artist.artist_id', $id);
	//SubQuery
	$sqlbuilder2 = new SQLBuild(1);
	$sqlbuilder2->setTable($data["sub"]["table"]);
	$sqlbuilder2->addSelectCols($data["sub"]["column"]);
	$sqlbuilder2->setWhere('artist_id', $id);
	$sqlbuilder->setWhere('syousai.artist', "(".$sqlbuilder2->makeSQL().")", true);
	$sqlbuilder->setGroupby('syousai.music_name');
	$sqlbuilder->setOrderby('syousai.music_name');
	$data["sql"] = $sqlbuilder->makeSQL();
}else if($opt == "m" || $opt == "a_m" || $opt == "m_m"){
	if($id && !$kw){
		$data = array(
			"table" => array("album", "syousai"),
			"column" => array(
				"Title" => "album.title",
				"Category" => "album.category",
				"Hozon" => "album.hozon",
				"Img" => "album.image",
				"SID" => "syousai.id",
				"Music" => "syousai.music_name",
				"Artist" => "syousai.artist",
				"Idx" => "syousai.index_no"
			),
			"search" => "Detail",
			"option" => $opt,
			"sub" => array(
				"table" => "syousai",
				"column" => "album_id"
			),
			"noreg" => array(
				"table" => "album",
				"column" => array(
					"AlbumID" => "id",
					"Img" => "image",
					"Category" => "category",
					"Hozon" => "hozon"
				),
				"where" => array(
					"id" => "select album_id from syousai where id = ".$id
				)
			),
			"sql" => ""
		);
		//SQL
		$sqlbuilder = new SQLBuild(1);
		$sqlbuilder->setTable($data["table"]);
		$sqlbuilder->addSelectCols($data["column"]);
		//SubQuery
		$sqlbuilder2 = new SQLBuild(1);
		$sqlbuilder2->setTable($data["sub"]["table"]);
		$sqlbuilder2->addSelectCols($data["sub"]["column"]);
		$sqlbuilder2->setWhere('id', $id);
		$sqlbuilder->setWhere('album.id', "(".$sqlbuilder2->makeSQL().")", true);
		$sqlbuilder->setWhere(array('album.id', 'syousai.album_id'), null);
		$sqlbuilder->setOrderby('syousai.index_no');
		$data["sql"] = $sqlbuilder->makeSQL();
	}else if($id && $kw){
		$data = array(
			"table" => "syousai",
			"column" => array(
				"ID" => "id",
				"Music" => "music_name",
				"Count" => "count(music_name)"
			),
			"search" => "Detail",
			"option" => $opt,
			"sql" => ""
		);
		//SQL
		$sqlbuilder = new SQLBuild(1);
		$sqlbuilder->setTable($data["table"]);
		$sqlbuilder->addSelectCols($data["column"]);
		$sqlbuilder->setWhere('music_name', $kw);
		$sqlbuilder->setGroupby('id');
		$data["sql"] = $sqlbuilder->makeSQL();
	}
}

//JSON用配列生成
$jkey1 = $data["search"];
$ary2json["SQL"] = $data["sql"];
$ary2json["Option"] = $data["option"];
$ary2json["AppendID"] = $id;

$db = new DB;
$db->DBConnect();
$db->executeSQL($data["sql"]);
if($db->executeNumRows() == 0){
	//SQL(no register)
	$sqlbuilder = new SQLBuild(1);
	$sqlbuilder->setTable($data["noreg"]["table"]);
	$sqlbuilder->addSelectCols($data["noreg"]["column"]);
	$sqlbuilder->setWhere('id', $data["noreg"]["where"]["id"]);
	$data["sql"] = $sqlbuilder->makeSQL();

	$db->executeSQL($data["sql"]);
	$ary2json["SQL"] = $data["sql"];
}
$j = 0;
while($row = $db->executeFetch()){
	$gchild = $data["column"];
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

//JSONに変換
$json = new Services_JSON; 
$encode = $json->encode($ary2json);
echo $encode;

?>