<?php
require_once('xml.php');
require_once('json.php');

// 出力/内部文字コードをUTF-8に設定
mb_http_output('UTF-8');
mb_internal_encoding('UTF-8');
header('Content-Type: text/xml;charset=UTF-8');
$url ='http://api.search.yahoo.co.jp/WebSearchService/V1/webSearch?';
$url.='appid=wings-project&query='
	.urlencode(mb_convert_encoding($_POST['keyword'],'UTF-8','auto'))
		.'&'.'results='.$_POST['results'].'&'.'start='.$_POST['start'];
//連想配列に変換
$ary2json = XML_unserialize(file_get_contents($url));
//JSONに変換
$json = new Services_JSON; 
$encode = $json->encode($ary2json);
echo $encode;
?>