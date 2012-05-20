/* イベント周り＋ブラウザ */

//ブラウザ判別
function setUserAgentInfo(){
	var browseAgent = navigator.userAgent.toLowerCase();
	if(browseAgent.indexOf("opera") != -1){
		btype = 4;
	}else if(browseAgent.indexOf("msie") !=-1 && document.all){
		btype = 1;
	}else if(browseAgent.indexOf("safari") != -1){
		btype = 3;
	}else if(browseAgent.indexOf("mozilla") != -1){
		btype = 2;
	}
}

//イベントリスナ登録
function addListener(elem, eventType, func, cap){
	if(elem.addEventListener){ //IE6以外
		elem.addEventListener(eventType, func, cap);
	}else if(elem.attachEvent){ //IE6
		elem.attachEvent('on' + eventType, func);
	}else{
		alert('使用しているブラウザは対応してません');
		return false;
	}
}

//イベントリスナ解除	
function removeListener(elem, eventType, func, cap){
	if(elem.removeEventListener){
		elem.removeEventListener(eventType, func, cap);
	}else if(elem.detachEvent){
		elem.detachEvent('on' + eventType, func);
	}
}

//バブリングとデフォルトイベントアクションの停止
function stopDefaultAndPropagation(e){
	//バブリング停止
	if(e.stopPropagation){
		e.stopPropagation();
	}
	if(window.event){
		window.event.cancelBubble = true;
	}
	//デフォルトイベントアクションを停止する
	if(e.preventDefault){
		e.preventDefault();
	}
	if(window.event){
		window.event.returnValue = false;
	}
}

/* Ajax */
//AjaxUpdate
function ajaxUpdate(url, param, callback, mymethod){
	var myAjax = new Ajax.Request(
		url,
		{
			method : 'post',
			parameters : param,
			onComplete: callback ? callback : null
		}
	);
}


/* 要素・フラグ操作 */

//要素初期化
function initElement(elem){
	$(elem).innerHTML = '';
}

//要素削除
function rme(id){
	$(id).parentNode.removeChild($(id));
}

//ローディング処理
function loadSetting(elem){
	var cn = $('pss_loading'); //childnode
	if(cn){
		cn.parentNode.removeChild(cn);
	}else{
		var load = document.createElement('div');
		load.id = "pss_loading";
		load.style.textAlign = "center";
		load.style.marginTop = 16;
		var img = document.createElement('img');
		img.src = pss_img.loading;
		load.appendChild(img);
		elem.appendChild(load);
	}
}

//タグクラウド修飾
function tagCloud(s){
	var fsize;
	if(s >= 1 && s <=2)         fsize = "x-small";
	else if(s >= 3 && s <= 5)   fsize = "small";
	else if(s >= 6 && s <= 10)  fsize = "medium";
	else if(s >= 11 && s <= 30) fsize = "large";
	else if(s >= 31 && s <= 50) fsize = "x-large";
	else if(s >= 51)            fsize = "xx-large";
	else                        fsize = "xx-small";
	return fsize;
}
