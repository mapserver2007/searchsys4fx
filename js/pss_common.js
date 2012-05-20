// ========================================================================================
//  PHP SEARCH SYSTEM v4_fx
//  http://summer-lignts.dyndns.ws/searchsys4_fx/
// ========================================================================================
//  v4.00fx  2007/00/00 
// ========================================================================================
//  使用ライブラリ・API
//  prototype.js             
// ========================================================================================
//  問題点
//  詳細を、高速ダブルクリックすると二つ開いてしまう。どうしよう。
// ========================================================================================
//  開発メモ
// ========================================================================================

// パラメータ==============================================================================
var pss_opt = {														//オプションフラグ
	"title"  : 1,
	"artist" : 1,
	"music"  : 1
};
var pss_cat = {														//カテゴリフラグ
	"cd"     : 1,
	"doujin" : 1
}
var display = 30;													//1ページの表示件数
var pss_img = {};													//画像パスオブジェクト
pss_img.root = "images/";											//画像ルートパス
pss_img.album = "albumimg/"
pss_img.loading = pss_img.root + "loading.gif";
pss_img.counter_root = pss_img.root + "counter/";
ys_result = 5;														//1ページの表示件数
ys_start = 1;														//検索開始位置(デフォルト1)
ys_snap = "http://img.simpleapi.net/small/";						//スナップAPIのURL
// ========================================================================================

//load時のイベントリスナをセットする
addListener(window, 'load', setListener, false);

//初期処理
function setListener(e){
	/* ブラウザ種別判定 */
	setUserAgentInfo();

	//検索オプション・カテゴリ設定------------------------
	showOption();
	showCategory();	
	
	//検索情報設定----------------------------------------
	showInfo();

	//検索結果表示領域設定(Y!)----------------------------
	//ys = $('ysearch');
	
	//検索結果表示領域設定(50)----------------------------
	setFifSearch();

}

//頭文字検索を設定
function setFifSearch(){
	var fif = [
		["あ","い","う","え","お"],
		["か","き","く","け","こ"],
		["さ","し","す","せ","そ"],
		["た","ち","つ","て","と"],
		["な","に","ぬ","ね","の"],
		["は","ひ","ふ","へ","ほ"],
		["ま","み","む","め","も"],
		["や","  ","ゆ","  ","よ"],
		["ら","り","る","れ","ろ"],
		["わ","  ","  ","  ","を"]
	];
	
	var alp = [
		["A","B","C","D","E","F","G"],
		["H","I","J","K","L","M","N"],
		["O","P","Q","R","S","T","U"],
		["V","W","X","Y","Z","",""]
	];
	
	var elem_fif = document.createElement('div');
	elem_fif.className = "border";
	//elem_fif.style.float = "left";
	elem_fif.style.width = 210 + "px";
	elem_fif.style.padding = 5 + "px";
	elem_fif.style.margin = 5 + "px";
	elem_fif.appendChild(document.createTextNode(
		"50音から検索"
	));

	var elem_alp = document.createElement('div');
	elem_alp.className = "border";
	//elem_alp.style.float = "right";
	elem_alp.style.width = 210 + "px";
	elem_alp.style.padding = 5 + "px";
	elem_alp.style.margin = 5 + "px";
	elem_alp.appendChild(document.createTextNode(
		"アルファベットから検索"
	));

	/* 配列の方向を縦・横逆にする */
	var cel = [];
	for(var i = 0; i < fif[0].length; i++){
		cel[i] = [];
		for(var j = 0; j < fif.length; j++){
			cel[i][j] = fif[j][i];
		}
	}

	//50音
	var table = document.createElement("table");
	var tbody = document.createElement("tbody");
	for(var i = 0; i < cel.length; i++){
		var tr = document.createElement("tr");
		for(j = 0; j < cel[0].length; j++){
			if(cel[i][j] == "") continue;
			var td = document.createElement("td");
			td.style.textAlign = "center";
			var a = document.createElement("a");
			a.href = "javascript:void(0);"
			a.appendChild(document.createTextNode(cel[i][j]));
			addListener(a, "click", doInitialSearch, false);
			td.appendChild(a);
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	elem_fif.appendChild(table);
	
	//アルファベット
	var table = document.createElement("table");
	var tbody = document.createElement("tbody");
	for(var i = 0; i < alp.length; i++){
		var tr = document.createElement("tr");
		for(j = 0; j < alp[0].length; j++){
			if(alp[i][j] == "") continue;
			var td = document.createElement("td");
			td.style.textAlign = "center";
			var a = document.createElement("a");
			a.href = "javascript:void(0);"
			a.appendChild(document.createTextNode(alp[i][j]));
			addListener(a, "click", doInitialSearch, false);
			td.appendChild(a);
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	elem_alp.appendChild(table);
	
	
	$('fsearch').appendChild(elem_fif);
	$('fsearch').appendChild(elem_alp);
}

//頭文字検索開始
function doInitialSearch(e){
	elem = btype == 1 ? e.srcElement : e.target;
	kw = elem.firstChild.nodeValue;
	//フォームに書き出す
	$('pss_inputform').value = kw;
	//新規検索時に全ての表示内容クリア
	initElement('search');
	//ページ初期化
	page = 0;
	
	//タブ切り替え処理
	var tab_obj, tab_name;
	
	/* PSSタブをON */
	var psstobj = new Tab('Tab0', new Boolean(true));
	psstobj.open = true;
	tab_obj = $("Tab0Box").style;
	tab_name = $("Tab0");
	tab_obj.display = "inline"
	//tab_obj.position = "";
	tab_name.className = "open";

	/* YタブをOFF */
	var ytobj = new Tab('Tab1', new Boolean(false));
	ytobj.open = false;
	tab_obj = $("Tab1Box").style;
	tab_name = $("Tab1");
	tab_obj.display = "none"
	//tab_obj.position = "absolute";
	tab_name.className = "close";

	/* 50タブをOFF */
	var ftobj = new Tab('Tab2', new Boolean(false));
	ftobj.open = false;
	tab_obj = $("Tab2Box").style;
	tab_name = $("Tab2");
	tab_obj.display = "none"
	//tab_obj.position = "absolute";
	tab_name.className = "close";
	
	//ローディング画像を出す
	loadSetting($('search'));
	
	//再度検索
	doPssSearch();
}

//オプション設定
function showOption(){
	//セパレート画像
	var sepa1 = document.createElement("img");
	sepa1.src = pss_img.root + "pss_pause.gif";
	sepa1.style.verticalAlign = "middle";
	$('pss_option').appendChild(sepa1);
	
	//検索オプションの選択時の処理
	var chk1 = document.createElement("span");
	chk1.id = "opt_title";
	chk1.className = "pss_opts";
	chk1.appendChild(document.createTextNode("タイトル"));
	addListener(chk1, 'click', setSearchTerms, false);
	$('pss_option').appendChild(chk1);
	var chk2 = document.createElement("span");
	chk2.id = "opt_artist";
	chk2.className = "pss_opts";
	chk2.appendChild(document.createTextNode("アーティスト"));
	addListener(chk2, 'click', setSearchTerms, false);
	$('pss_option').appendChild(chk2);
	var chk3 = document.createElement("span");
	chk3.id = "opt_music";
	chk3.className = "pss_opts";
	chk3.appendChild(document.createTextNode("曲名"));
	addListener(chk3, 'click', setSearchTerms, false);
	$('pss_option').appendChild(chk3);

	//初期処理(フラグが立っている場合は色づけ)
	setSearchTerms("opt_title");
	setSearchTerms("opt_artist");
	setSearchTerms("opt_music");
}


//カテゴリ設定
function showCategory(){
	//セパレート画像
	var sepa2 = document.createElement("img");
	sepa2.src = pss_img.root + "pss_pause.gif";
	sepa2.style.verticalAlign = "middle";
	$('pss_option').appendChild(sepa2);

	//検索カテゴリの選択時の処理
	var chk1 = document.createElement("span");
	chk1.id = "cat_cd";
	chk1.className = "pss_cats";
	chk1.appendChild(document.createTextNode("CD"));
	addListener(chk1, 'click', setSearchTerms, false);
	$('pss_option').appendChild(chk1);
	var chk2 = document.createElement("span");
	chk2.id = "cat_doujin";
	chk2.className = "pss_cats";
	chk2.appendChild(document.createTextNode("同人音楽"));
	addListener(chk2, 'click', setSearchTerms, false);
	$('pss_option').appendChild(chk2);

	//初期処理(フラグが立っている場合は色づけ)
	setSearchTerms("cat_cd");
	setSearchTerms("cat_doujin");
}

function setSearchTerms(e){
	if(typeof(e) == "string"){
		//初回のみ通常と逆(実行によるフラグ反転は起きないため)
		elem = e;
		if(elem.split("_")[0] == "opt"){
			//フラグは変化させない
			if(pss_opt[elem.split("_")[1]] == 1){
				$(elem).style.backgroundColor = "yellow";
			}else{
				$(elem).style.backgroundColor = "white";
			}
		}else if(elem.split("_")[0] == "cat"){
			if(pss_cat[elem.split("_")[1]] == 1){
				$(elem).style.backgroundColor = "red";
			}else{
				$(elem).style.backgroundColor = "white";
			}
		}
	}else{
		var elem = e.target ? e.target.id : e.srcElement.id;
		if(elem.split("_")[0] == "opt"){
			if(pss_opt[elem.split("_")[1]] == 0){
				$(elem).style.backgroundColor = "yellow";
				pss_opt[elem.split("_")[1]] = 1;
			}else{
				$(elem).style.backgroundColor = "white";
				pss_opt[elem.split("_")[1]] = 0;
			}
		}else if(elem.split("_")[0] == "cat"){
			if(pss_cat[elem.split("_")[1]] == 0){
				$(elem).style.backgroundColor = "red";
				pss_cat[elem.split("_")[1]] = 1;
			}else{
				$(elem).style.backgroundColor = "white";
				pss_cat[elem.split("_")[1]] = 0;
			}
		}
	}
}

//登録数を問い合わせ
function showInfo(){
	ajaxUpdate('php/pss_counter.php', null, updatePhase2);
}

var kw_detail = "";
//詳細(タイトル)を問い合わせ
function showDetail(e){
	elem = btype == 1 ? e.srcElement : e.target;
	kw_detail = elem.firstChild.nodeValue;
	var this_kw = $(elem.parentNode.id).name;
	//既に表示済なら閉じて終了
	var did = "d_" + elem.parentNode.id;
	if($(did)){ rme(did); kw_detail = ""; return; }
	//オプション・IDを取得
	var elem_id = elem.parentNode.id.split("_");
	//詳細
	if(elem.parentNode.id.split("_").length == 2){
		var qopt = elem.parentNode.id.split("_")[0];
		var qid  = elem.parentNode.id.split("_")[1];
	}else{ //詳細の詳細
		var qopt = elem.parentNode.id.split("_")[0] + "_" + elem.parentNode.id.split("_")[1];
		var qid  = elem.parentNode.id.split("_")[2];
	}
	//オプションによってコールバックを変更
	if(qopt == "t"){
		ajaxUpdate('php/pss_detail.php', 'id='+qid+'&opt='+qopt, updatePhase3);
	}else if(qopt == "a"){
		ajaxUpdate('php/pss_detail.php', 'id='+qid+'&opt='+qopt, updatePhase4);
	}else if(qopt == "m"){
		if(!this_kw){
			ajaxUpdate('php/pss_detail.php', 'id='+qid+'&opt='+qopt, updatePhase5);
		}else{
			ajaxUpdate('php/pss_detail.php', 'kw='+this_kw+'&id='+qid+'&opt='+qopt, updatePhase6);
		}
	}else if(qopt == "a_m"){
		if(!this_kw){
			ajaxUpdate('php/pss_detail.php', 'id='+qid+'&opt='+qopt, updatePhase5);
		}else{
			ajaxUpdate('php/pss_detail.php', 'kw='+this_kw+'&id='+qid+'&opt='+qopt, updatePhase6);
		}
	}else if(qopt == "m_m"){
		ajaxUpdate('php/pss_detail.php', 'id='+qid+'&opt='+qopt, updatePhase5);
	}
}

var kw = "";
var page = "";
//検索開始
function initPssSearch(){
	//フォーム内容チェック
	var err = "";
	kw = $('pss_inputform').value;
	if(!kw){err = "ワード未入力";}
	if(kw.length >= 30){err = "ワードが長すぎ";}
	if(err){alert(err); return false;}
	
	//新規検索時に全ての表示内容クリア
	initElement('search');
	page = 0; //ページを初期化

	//タブ切り替え処理
	var tab_obj, tab_name;
	
	/* PSSタブをON */
	var psstobj = new Tab('Tab0', new Boolean(true));
	psstobj.open = true;
	tab_obj = $("Tab0Box").style;
	tab_name = $("Tab0");
	tab_obj.display = "inline"
	tab_name.className = "open";

	/* YタブをOFF */
	var ytobj = new Tab('Tab1', new Boolean(false));
	ytobj.open = false;
	tab_obj = $("Tab1Box").style;
	tab_name = $("Tab1");
	tab_obj.display = "none"
	tab_name.className = "close";

	/* 50タブをOFF */
	var ftobj = new Tab('Tab2', new Boolean(false));
	ftobj.open = false;
	tab_obj = $("Tab2Box").style;
	tab_name = $("Tab2");
	tab_obj.display = "none"
	tab_name.className = "close";

	//ローディング画像を出す
	loadSetting($('search'));
	
	//PSS検索
	doPssSearch();
}

function doPssSearch(){
	ajaxUpdate('php/pss_search.php', 'keyword='+kw+'&opt_title='+pss_opt.title
		+'&opt_artist='+pss_opt.artist+'&opt_music='+pss_opt.music+'&cat_cd='+pss_cat.cd
			+'&cat_doujin='+pss_cat.doujin+'&page='+page+'&display='+display, updatePhase1);
}

var ys_kw = "";
var ypage = "";
//Y検索開始
function initYahooSearch(e){
	//キーワード取得
	elem = btype == 1 ? e.srcElement : e.target;
	ys_kw = elem.parentNode.firstChild.firstChild.firstChild.nodeValue;
	
	//タブ切り替え処理
	var tab_obj, tab_name;
	
	/* PSSタブをON */
	var psstobj = new Tab('Tab0', new Boolean(true));
	psstobj.open = false;
	tab_obj = $("Tab0Box").style;
	tab_name = $("Tab0");
	tab_obj.display = "none"
	tab_name.className = "close";

	/* YタブをOFF */
	var ytobj = new Tab('Tab1', new Boolean(false));
	ytobj.open = true;
	tab_obj = $("Tab1Box").style;
	tab_name = $("Tab1");
	tab_obj.display = "inline"
	tab_name.className = "open";

	//新規検索時に全ての表示内容クリア
	initElement('ysearch');
	ypage = 0; //ページを初期化

	//ローディング画像を出す
	loadSetting($('ysearch'));

	//PSS検索
	doYahooSearch();
}

function doYahooSearch(){
	ajaxUpdate('php/pss_ysearch.php', 'keyword='+ys_kw+'&results='+ys_result+'&start='
		+(ys_start+ypage*ys_result), updatePhase7);
}

//次のページへ
function doNextPssPage(e){
	//ページ番号を増やす
	page++;
	
	//NEXTを消す
	rme('next');
	
	//ローディング画像を出す
	loadSetting($('search'));
	
	//PSS検索
	doPssSearch();
}

//次のページへ(Y)
function doNextYsPage(e){
	//ページ番号を増やす
	ypage++;
	
	//NEXTを消す
	rme('ys_next');
	
	//ローディング画像を出す
	loadSetting($('ysearch'));
	
	//PSS検索
	doYahooSearch();
}


//PSS検索結果
function updatePhase1(res){
	eval("var json = " + res.responseText);
	//SQLデバッガ------------------------------------------------
	//alert(json.SQL.Title);
	//var ttt = $('deb');
	//ttt.appendChild(document.createTextNode(json.SQL.Artist));
	//終わり-----------------------------------------------------

	//loadingを消す
	loadSetting($('search'));
	
	//見出し
	if(page == 0){
		var entry = "Result for '"+ kw + "'@PSS SEARCH"; //1ページ目
		var result_header = document.createElement("p");
		result_header.className = "pss_result_header";
		result_header.appendChild(document.createTextNode(entry));
		$('search').appendChild(result_header);
	}
	var jtitle, jartist, jmusic;
	try{
		jtitle = json.Title.length;
	}catch(err){
		jtitle = 0;
	}
	try{
		jartist = json.Artist.length;
	}catch(err){
		jartist = 0;
	}
	try{
		jmusic = json.Music.length;
	}catch(err){
		jmusic = 0;
	}
	
	//TITLE
	if(jtitle != 0){
		var ul_t = document.createElement('ul');
		for(var i = 0; i < jtitle; i++){
			var li_t = document.createElement('li');
			/* 名前 */
			var sp1_t = document.createElement("span");
			sp1_t.id = "t_" + json.Title[i].ID;
			sp1_t.style.fontSize = tagCloud(json.Title[i].Count);
			var a_t = document.createElement("a");
			a_t.href = "javascript:void(0);";
			a_t.appendChild(document.createTextNode(json.Title[i].Title));
			sp1_t.appendChild(a_t);
			/* クリックイベント */
			addListener(sp1_t, "click", showDetail, false);
			/* カウント・カテゴリ */
			var sp2_t = document.createElement("span");
			sp2_t.style.fontSize = "x-small";
			sp2_t.appendChild(document.createTextNode(
				"[" + json.Title[i].Count + "][title]"
			));
			/* IDを設定 */
			//li_t.id = "list_t_" + json.Title[i].ID;
			/* テキストを設定 */
			li_t.appendChild(sp1_t);
			li_t.appendChild(sp2_t);

			ul_t.appendChild(li_t);
		}
		$('search').appendChild(ul_t);
	}
	
	//ARTIST
	if(jartist != 0){
		var ul_a = document.createElement('ul');
		for(var j = 0; j < jartist; j++){
			var li_a = document.createElement('li');
			/* 名前 */
			var sp1_a = document.createElement("span");
			sp1_a.id = "a_" + json.Artist[j].ArtistID;
			sp1_a.style.fontSize = tagCloud(json.Artist[j].Count);
			var a_a = document.createElement("a");
			a_a.href = "javascript:void(0);";
			a_a.appendChild(document.createTextNode(json.Artist[j].Artist));
			sp1_a.appendChild(a_a);
			/* クリックイベント */
			addListener(sp1_a, "click", showDetail, false);
			/* カウント・カテゴリ */
			var sp2_a = document.createElement("span");
			sp2_a.style.fontSize = "x-small";
			sp2_a.appendChild(document.createTextNode("[" + json.Artist[j].Count + "][artist]"));
			/* IDを設定 */
			//li_a.id = "list_a_" + json.Artist[j].ID;
			/* テキストを設定 */
			li_a.appendChild(sp1_a);
			li_a.appendChild(sp2_a);

			ul_a.appendChild(li_a);
			
		}
		$('search').appendChild(ul_a);
	}

	//MUSIC
	if(jmusic != 0){
		var ul_m = document.createElement('ul');
		for(var k = 0; k < jmusic; k++){
			var li_m = document.createElement('li');
			/* 名前 */
			var sp1_m = document.createElement("span");
			sp1_m.id = "m_" + json.Music[k].ID;
			sp1_m.name = json.Music[k].Count != 1 ? json.Music[k].Music : "";
			sp1_m.style.fontSize = tagCloud(json.Music[k].Count);
			var a_m = document.createElement("a");
			a_m.href = "javascript:void(0);";
			a_m.appendChild(document.createTextNode(json.Music[k].Music));
			sp1_m.appendChild(a_m);
			/* クリックイベント */
			addListener(sp1_m, "click", showDetail, false);
			/* カウント・カテゴリ */
			var sp2_m = document.createElement("span");
			sp2_m.style.fontSize = "x-small";
			sp2_m.appendChild(document.createTextNode(
				"[" + json.Music[k].Count + "][music]"
			));
			/* IDを設定 */
			//li_m.id = "list_m_" + json.Music[k].ID;
			/* テキストを設定 */
			li_m.appendChild(sp1_m);
			li_m.appendChild(sp2_m);

			ul_m.appendChild(li_m);
		}
		$('search').appendChild(ul_m);
	}
	
	//NEXT
	var show_next = false;
	var _opt = pss_opt.title + pss_opt.artist + pss_opt.music;
	if(_opt != 0){
		//各オプションの最大表示数
		var _show = display / (pss_opt.title + pss_opt.artist + pss_opt.music);
		if((jtitle == _show) || (jartist == _show) || (jmusic == _show)) show_next = true;
	}
	if(show_next){
		var next = document.createElement('div');
		next.id = "next";
		next.style.marginTop = 10 + "px";
		//next.className = "pss_next";
		var next_img = document.createElement('img');
		next_img.src = pss_img.root + "pss_next.gif";
		next.appendChild(next_img);
		addListener(next, 'click', doNextPssPage, false);
		$('search').appendChild(next);
	}
	
	//NOT FOUND
	if(jtitle + jartist + jmusic == 0){
		var nf = document.createElement('div');
		nf.appendChild(document.createTextNode("Not Found..."));
		var nf_img = document.createElement('img');
		nf_img.src = pss_img.root + "orz_04.gif";
		nf.appendChild(nf_img);
		$('search').appendChild(nf);
	}
}

//登録数表示
function updatePhase2(res){
	eval("var json = " + res.responseText);
	var counter = {};
	for(var i = 0; i < json.length; i++){
		var ketaflg = false
		counter.c = json[i].Count;
		counter.elem = document.createElement("span");
		counter.elem.style.fontSize = 12 + "px";
		if(counter.c){
			//JSONで定義(深い意味なし)
			var keta = {
				"man" : eval(parseInt(counter.c / 10000) % 10),
				"sen" : eval(parseInt(counter.c / 1000)  % 10),
				"hya" : eval(parseInt(counter.c / 100)   % 10),
				"juu" : eval(parseInt(counter.c / 10)    % 10),
				"iti" : eval(parseInt(counter.c)         % 10)
			};
			//登録数
			for(var key in keta){
				if(keta[key] != 0 && ketaflg == false) ketaflg = true;
				if(keta[key] == 0 && ketaflg == false) continue;
				counter.img = document.createElement("img");
				counter.img.style.verticalAlign = "middle";
				counter.img.src = pss_img.counter_root + parseInt(keta[key]) + ".gif";
				counter.elem.appendChild(counter.img);
			}
			//テキスト
			counter.elem.appendChild(document.createTextNode(json[i].Unit));
			//セパレート
			if(i % 2 == 0){
				var sepa3 = document.createElement("img");
				sepa3.src = pss_img.root + "pss_pause.gif";
				sepa3.style.verticalAlign = "middle";
				$('pss_option').appendChild(sepa3);
			}
		}
		$('pss_option').appendChild(counter.elem);
	}
	var sepa4 = document.createElement("img");
	sepa4.src = pss_img.root + "pss_pause.gif";
	sepa4.style.verticalAlign = "middle";
	$('pss_option').appendChild(sepa4);
}

//詳細結果(タイトル)
function updatePhase3(res){
	eval("var json = " + res.responseText);
	var insert_id = json.Option + "_" + json.AppendID;

	//詳細領域(全体)
	var detail = document.createElement("div");
	detail.className = "pss_detail";
	detail.id = "d_" + insert_id;
	
	//ヘッダ
	var detail_header = document.createElement("div");
	//ヘッダ・見出し
	var detail_header_title = document.createElement("span");
	detail_header_title.className = "pss_detail_header";
	detail_header_title.appendChild(document.createTextNode(kw_detail));
	detail_header.appendChild(detail_header_title);
	//ヘッダ・クローズ
	var detail_close = document.createElement("img");
	detail_close.id = "pss_detail_close";
	detail_close.src = pss_img.root + "pss_close.gif";
	addListener(detail_close, 'click', function(e){rme(detail.id);}, false);
	detail_header.appendChild(detail_close);
	detail.appendChild(detail_header);
	
	//詳細(インデックス)
	var detail_idx = document.createElement("div");
	detail_idx.id = "detail_idx";
	var ttt = json.Detail;
	for(var i = 0; i < json.Detail.length; i++){
		var p = document.createElement('p');
		var text = json.Detail[i].Idx ? 
			json.Detail[i].Idx + "." + json.Detail[i].Music + "/" + json.Detail[i].Artist : "No Register.";
		p.appendChild(document.createTextNode(text));
		detail_idx.appendChild(p);
	}
	//詳細(画像)
	var detail_img = document.createElement("div");
	detail_img.id = "detail_img";
	//画像
	var detail_img_img = document.createElement("img");
	detail_img_img.src = pss_img.album + json.Detail[0].Img;
	detail_img.appendChild(detail_img_img);
	detail.appendChild(detail_img);
	detail.appendChild(detail_idx);
	//ヘッダ・情報
	var detail_header_info = document.createElement('p');
	detail_header_info.style.marginTop = 10 + "px";
	detail_header_info.style.fontSize = "x-small";
	detail_header_info.style.clear = "both";
	detail_header_info.appendChild(document.createTextNode(json.Detail[0].Category + " - " + json.Detail[0].Hozon));
	detail.appendChild(detail_header_info);
	//Yahoo検索
	var ysearch = document.createElement('a');
	ysearch.id = "ys_link";
	ysearch.href = "javascript:void(0);";
	ysearch.appendChild(document.createTextNode("「" + kw_detail + "」をYahoo!検索"));
	addListener(ysearch, "click", initYahooSearch, false);
	detail.appendChild(ysearch);
	$(insert_id).parentNode.appendChild(detail);
}

//詳細(アーティスト)
function updatePhase4(res){
	eval("var json = " + res.responseText);
	var insert_id = json.Option + "_" + json.AppendID;

	//詳細領域(全体)
	var detail = document.createElement("div");
	detail.className = "pss_detail";
	detail.id = "d_" + insert_id;

	//ヘッダ
	var detail_header = document.createElement("div");
	//ヘッダ・見出し
	var detail_header_title = document.createElement("span");
	detail_header_title.className = "pss_detail_header";
	detail_header_title.appendChild(document.createTextNode(kw_detail));
	detail_header.appendChild(detail_header_title);
	//ヘッダ・クローズ
	var detail_close = document.createElement("img");
	detail_close.id = "pss_detail_close";
	detail_close.src = pss_img.root + "pss_close.gif";
	addListener(detail_close, 'click', function(e){rme(detail.id);}, false);
	detail_header.appendChild(detail_close);
	detail.appendChild(detail_header);
	
	//詳細(リスト) (曲名検索と同じ)
	if(json.Detail.length != 0){
		var ul = document.createElement('ul');
		for(var i = 0; i <json.Detail.length ; i++){
			var li = document.createElement('li');
			/* 名前 */
			var sp1 = document.createElement("span");
			//曲名検索と区別するために別のIDを振る
			sp1.id = "a_m_" + json.Detail[i].ID;
			sp1.name = json.Detail[i].Count != 1 ? json.Detail[i].Music : "";
			sp1.style.fontSize = tagCloud(json.Detail[i].Count);
			var a = document.createElement("a");
			a.href = "javascript:void(0);"
			a.appendChild(document.createTextNode(json.Detail[i].Music));
			sp1.appendChild(a);
			/* クリックイベント */
			addListener(sp1, "click", showDetail, false);
			/* カウント・カテゴリ */
			var sp2 = document.createElement("span");
			sp2.style.fontSize = "x-small";
			sp2.appendChild(document.createTextNode(
				"[" + json.Detail[i].Count + "][music]"
			));
			/* テキストを設定 */
			li.appendChild(sp1);
			li.appendChild(sp2);

			ul.appendChild(li);
		}
		$(detail).appendChild(ul);
	}
	
	$(insert_id).parentNode.appendChild(detail);
	
	//ダミー(clear)
	var dummy = document.createElement("div");
	dummy.style.clear = "both";
	$(insert_id).parentNode.appendChild(dummy);
}

//詳細(曲名)
function updatePhase5(res){
	eval("var json = " + res.responseText);
	var insert_id = json.Option + "_" + json.AppendID;

	//詳細領域(全体)
	var detail = document.createElement("div");
	detail.className = "pss_detail";
	detail.id = "d_" + insert_id;
	
	//ヘッダ
	var detail_header = document.createElement("div");
	//ヘッダ・見出し
	var detail_header_title = document.createElement("span");
	detail_header_title.className = "pss_detail_header";
	detail_header_title.appendChild(document.createTextNode(json.Detail[0].Title));
	detail_header.appendChild(detail_header_title);
	//ヘッダ・クローズ
	var detail_close = document.createElement("img");
	detail_close.id = "pss_detail_close";
	detail_close.src = pss_img.root + "pss_close.gif";
	addListener(detail_close, 'click', function(e){rme(detail.id);}, false);
	detail_header.appendChild(detail_close);
	detail.appendChild(detail_header);
	
	//詳細(インデックス)
	var detail_idx = document.createElement("div");
	detail_idx.id = "detail_idx";
	var ttt = json.Detail;
	for(var i = 0; i < json.Detail.length; i++){
		var p = document.createElement('p');
		var text = json.Detail[i].Idx ? 
			json.Detail[i].Idx + "." + json.Detail[i].Music + "/" + json.Detail[i].Artist : "No Register.";
		p.appendChild(document.createTextNode(text));
		detail_idx.appendChild(p);
	}
	//詳細(画像)
	var detail_img = document.createElement("div");
	detail_img.id = "detail_img";
	//画像
	var detail_img_img = document.createElement("img");
	detail_img_img.src = pss_img.album + json.Detail[0].Img;
	//detail_img_link.appendChild(detail_img_img);
	detail_img.appendChild(detail_img_img);
	detail.appendChild(detail_img);
	detail.appendChild(detail_idx);
	//ヘッダ・情報
	var detail_header_info = document.createElement('p');
	detail_header_info.style.marginTop = 10 + "px";
	detail_header_info.style.fontSize = "x-small";
	detail_header_info.style.clear = "both";
	detail_header_info.appendChild(document.createTextNode(json.Detail[0].Category + " - " + json.Detail[0].Hozon));
	detail.appendChild(detail_header_info);
	$(insert_id).parentNode.appendChild(detail);
	//Yahoo検索
	var ysearch = document.createElement('a');
	ysearch.id = "ys_link";
	ysearch.href = "javascript:void(0);";
	ysearch.appendChild(document.createTextNode("「" + json.Detail[0].Title + "」をYahoo!検索"));
	addListener(ysearch, "click", initYahooSearch, false);
	detail.appendChild(ysearch);
	$(insert_id).parentNode.appendChild(detail);
}

//詳細(曲名が重複とき)
function updatePhase6(res){
	eval("var json = " + res.responseText);
	var insert_id = json.Option + "_" + json.AppendID;

	//詳細領域(全体)
	var detail = document.createElement("div");
	detail.className = "pss_detail";
	detail.id = "d_" + insert_id;

	//ヘッダ
	var detail_header = document.createElement("div");
	//ヘッダ・見出し
	var detail_header_title = document.createElement("span");
	detail_header_title.className = "pss_detail_header";
	detail_header_title.appendChild(document.createTextNode(kw_detail));
	detail_header.appendChild(detail_header_title);
	//ヘッダ・クローズ
	var detail_close = document.createElement("img");
	detail_close.id = "pss_detail_close";
	detail_close.src = pss_img.root + "pss_close.gif";
	addListener(detail_close, 'click', function(e){rme(detail.id);}, false);
	detail_header.appendChild(detail_close);
	detail.appendChild(detail_header);
	//詳細(リスト)
	if(json.Detail.length != 0){
		var ul = document.createElement('ul');
		for(var i = 0; i <json.Detail.length ; i++){
			var li = document.createElement('li');
			/* 名前 */
			var sp1 = document.createElement("span");
			//曲名検索・アーティスト検索と区別するために別のIDを振る
			sp1.id = "m_m_" + json.Detail[i].ID;
			//sp1.name = json.Detail[i].Music;
			sp1.style.fontSize = tagCloud(json.Detail[i].Count);
			var a = document.createElement("a");
			a.href = "javascript:void(0);"
			a.appendChild(document.createTextNode(json.Detail[i].Music));
			sp1.appendChild(a);
			/* クリックイベント */
			addListener(sp1, "click", showDetail, false);
			/* カウント・カテゴリ */
			var sp2 = document.createElement("span");
			sp2.style.fontSize = "x-small";
			sp2.appendChild(document.createTextNode(
				"[" + json.Detail[i].Count + "][music]"
			));
			/* テキストを設定 */
			li.appendChild(sp1);
			li.appendChild(sp2);

			ul.appendChild(li);
		}
		$(detail).appendChild(ul);
	}
	
	$(insert_id).parentNode.appendChild(detail);
	
	//ダミー(clear)
	var dummy = document.createElement("div");
	dummy.style.clear = "both";
	$(insert_id).parentNode.appendChild(dummy);
}

//Yahoo検索結果
function updatePhase7(res){
	eval("var json = " + res.responseText);

	//loadingを消す
	loadSetting($('ysearch'));

	//NOT FOUND
	if(!json.ResultSet){
		var nf = document.createElement('div');
		nf.appendChild(document.createTextNode("Not Found..."));
		var nf_img = document.createElement('img');
		nf_img.src = pss_img.root + "orz_04.gif";
		nf.appendChild(nf_img);
		$('ysearch').appendChild(nf);
		return false;
	}

	//見出し
	if(ypage == 0){
		var entry = "Result for '"+ ys_kw + "'@Yahoo! SEARCH"; //1ページ目
		var result_header = document.createElement("p");
		result_header.className = "pss_result_header";
		result_header.appendChild(document.createTextNode(entry));
		$('ysearch').appendChild(result_header);
	}
	//検索結果表示
	for(var i = 0; i < json.ResultSet.Result.length; i++){
		//親ブロック
		var ys_container = document.createElement("div");
		ys_container.id = "ys_container";
		//画像ブロック
		var ys_img_container = document.createElement("div");
		ys_img_container.id = "ys_img_container";
		//画像リンク
		var ys_img_link = document.createElement("a");
		ys_img_link.href = json.ResultSet.Result[i].Url;
		ys_img_link.target = "_blank";
		ys_img_link.alt = json.ResultSet.Result[i].Summary;
		//画像スナップ
		var ys_img_snap = document.createElement("img");
		ys_img_snap.src = ys_snap + json.ResultSet.Result[i].Url;
		ys_img_snap.border = 0 + "px";
		ys_img_link.appendChild(ys_img_snap);
		ys_img_container.appendChild(ys_img_link);
		//テキストブロック
		var ys_text_container = document.createElement("div");
		ys_text_container.id = "ys_text_container";
		//テキストタイトル
		var ys_text_title = document.createElement("a");
		ys_text_title.href = json.ResultSet.Result[i].Url;
		ys_text_title.target = "_blank";
		ys_text_title.appendChild(document.createTextNode(json.ResultSet.Result[i].Title));
		ys_text_container.appendChild(ys_text_title);
		//テキストサマリ
		var ys_text_summary = document.createElement("p");
		ys_text_summary.appendChild(document.createTextNode(json.ResultSet.Result[i].Summary));
		ys_text_container.appendChild(ys_text_summary);
		//その他
		var ys_text_extra = document.createElement("div");
		//テキストソースリンク
		var ys_text_srcurl = document.createElement("span");
		ys_text_srcurl.appendChild(document.createTextNode(json.ResultSet.Result[i].Url));
		ys_text_extra.appendChild(ys_text_srcurl);
		//区切り
		var ys_text_sepa1 = document.createElement("span");
		ys_text_sepa1.appendChild(document.createTextNode(" - "));
		ys_text_extra.appendChild(ys_text_sepa1);
		//キャッシュリンク
		try{
			var ys_text_cache = document.createElement("a");
			ys_text_cache.href = json.ResultSet.Result[i].Cache.Url;
			ys_text_cache.target = "_blank";
			ys_text_cache.appendChild(document.createTextNode("キャッシュ"));
		}catch(err){
			var ys_text_cache = document.createElement("span");
			ys_text_cache.appendChild(document.createTextNode("キャッシュ"));
		}
		ys_text_extra.appendChild(ys_text_cache);
		//区切り
		var ys_text_sepa2 = document.createElement("span");
		ys_text_sepa2.appendChild(document.createTextNode(" - "));
		ys_text_extra.appendChild(ys_text_sepa2);
		//キャッシュサイズ
		try{
			var ys_text_size = document.createElement("span");
			var size_kb = parseInt(json.ResultSet.Result[i].Cache.Size / 1024);
			ys_text_size.appendChild(document.createTextNode(size_kb + "k"));
			ys_text_extra.appendChild(ys_text_size);
		}catch(err){
			var ys_text_size = document.createElement("span");
			ys_text_size.appendChild(document.createTextNode("0k"));
		}
		ys_text_container.appendChild(ys_text_extra);
		//ダミー(clear)
		var dummy = document.createElement("div");
		dummy.style.clear = "both";
		ys_container.appendChild(ys_img_container);
		ys_container.appendChild(ys_text_container);
		ys_container.appendChild(dummy);
		$('ysearch').appendChild(ys_container);
	}
	
	//NEXT
	if(json.ResultSet.Result.length == ys_result){
		var next = document.createElement('div');
		next.id = "ys_next";
		next.style.marginTop = 10 + "px";
		var next_img = document.createElement('img');
		next_img.src = pss_img.root + "pss_next.gif";
		next.appendChild(next_img);
		addListener(next, 'click', doNextYsPage, false);
		$('ysearch').appendChild(next);
	}
}