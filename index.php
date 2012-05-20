<?php require_once('php/pss_common.php'); ?>
<?php require_once('php/pss_config.php'); ?>
<html>
<head>
<META http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="Cache-Control" content="no-cache">
<meta http-equiv="Pragma" content="no-cache">
<title>PSS 4TH EDITION</title>
<link type="text/css" rel="stylesheet" href="css/style.css" />
<link type="text/css" rel="stylesheet" href="css/tabMaker.css" />
<script language="javascript" src="js/prototype.js"></script>
<script language="javascript" src="js/pss_config.js"></script>
<script language="javascript" src="js/pss_common.js"></script>
<script language="javascript" src="js/tabMaker.js"></script>
</head>
<body>
<!-- BOXメイン -->
<div id="box_main" class="box">
	<!-- BOXタイトル -->
	<div id="box_title">
		<a href="http://summer-lights.dyndns.ws/"><img src="images/main3.png" border="0" /></a>
	</div>
	<!-- 各種アイコン(なし) -->
	<div id="box_icon">
	</div>
	<!-- リンク -->
	<div id="box_link">
		<?php setLink(); ?>
	</div>
	<!-- メインコンテナ -->
	<div id="pss_container">
		<!-- ヘッダ -->
		<div id="box_c_title"><img src="images/pss_title2.png" /></div>
	</div>
	<div id="pss_form">
		<form onSubmit="return false">
			<input name="pss_search" type="text" id="pss_inputform" class="form" />
			<button type="button" class="submit" onClick="initPssSearch();">PSS検索</button>
		</form>
		<div id="pss_option"></div>
		<div id="pss_info"></div>
	</div>
	<!-- 検索切り替え -->
	<div id="tabContent">
		<ul id="tabIndex">
			<li class="tab">PSS検索</li>
			<li class="tab">Yahoo!検索</li>
			<li class="tab">頭文字検索</li>
		</ul>
		<div id="tabBoxIndex">
			<div class="tabBox"><div id="search">SEARCH</div></div>
			<div class="tabBox"><div id="ysearch">YSEARCH</div></div>
			<div class="tabBox"><div id="fsearch">頭文字検索</div></div>
		</div>
	</div>
<div id="deb"></div>
</body>
</html>