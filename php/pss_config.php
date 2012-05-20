<?php
Class DB {
	function DBConnect(){ //DB接続
		$this->con = mysql_connect("localhost","mysql","mysql");
		mysql_select_db("searchsys");
		mysql_query("SET NAMES utf8");
	}

	function executeSQL($sql){
		$this->result = mysql_query($sql);
	}
	
	function executeNumRows(){
		$num = mysql_num_rows($this->result);
		return $num;
	}
	
	function executeFetch(){
		$row = mysql_fetch_array($this->result);
		return $row;
	}

	function DBClose(){ //DBクローズ
		@mysql_close($this->con);
	}
	
	function getSQLState(){ //SQL実行結果を返す(成功：true、失敗：false)
		return $this->result;
	}
}

Class SQLBuild {
	
	var $select = 1;
	var $delete = 2;
	var $insert = 3;
	var $update = 4;
	//var $command = $select;
	
	function SQLBuild($cmd){
		$this->clear();
		$this->command = $cmd;
	}
	
	function clear(){
		$this->cols = array();
		$this->selectcols = array();
		$this->whereclause = null;
		$this->orderbyclause = null;
		$this->limitclause = null;
	}
	
	function escapeStr($str){
		//MySQL
		//return mysql_escape_string($str);
		//return mysql_real_escape_string($str);
		//magic_quotes_gpc が有効な場合は、まず最初に stripslashes()を適用
		return mysql_real_escape_string(stripslashes($str));
	}
	
	function makeSQL(){
		if(!$this->table) die('cannot set table!');
		if($this->command == $this->select){
			if(!$this->selectcols){ //all
				$sql = 'SELECT * FROM '.$this->table;
			}else{
				$sql = 'SELECT '.implode(',', $this->selectcols).' FROM '.$this->table;
			}
			if($this->whereclause){
				$sql .= ' WHERE '.$this->whereclause;
			}
			if($this->groupbyclause){
				$sql .= ' GROUP BY '.$this->groupbyclause;
			}
			if($this->orderbyclause){
				$sql .= ' ORDER BY '.$this->orderbyclause;
			}
			if($this->limitclause){
				$sql .= ' LIMIT '.$this->limitclause;
			}
		}else if($this->command == $this->delete){
			$sql = 'DELETE FROM '.$this->table;
			if($this->whereclause){
				$sql .= ' WHERE '.$this->whereclause;
			}
		}else if($this->command == $this->insert){
			$sql = 'INSERT INTO '.$this->table. '(';
			foreach($this->cols as $key => $value){
				$col .= $key.',';
				$val .= $value.',';
			}
			$col = substr($col, 0, -1);
			$val = substr($val, 0, -1);
			$sql .= $col.') VALUES('.$val.')';
		}else if($this->command == $this->update){
			$sql = 'UPDATE '.$this->table.' SET ';
			foreach($this->cols as $key => $value){
				$sql .= $key.'='.$value.',';
			}
			$sql = substr($sql, 0, -1);
			if($this->whereclause){
				$sql .= ' WHERE '.$this->whereclause;
			}
		}else{
			die('cannot set command!');
		}
		return $sql;
	}
	
	//table
	function setTable($tbl){
		if(is_array($tbl)){
			$this->table = implode(',', $tbl);
		}else{
			$this->table = $tbl;
		}
	}

	//select
	function addSelectCols($elem){
		if($elem){
			if(is_array($elem)){
				foreach($elem as $ck => $cv){
					if(is_string($ck)){
						array_push($this->selectcols, $cv." ".$ck);
					}else if(is_int($ck)){
						array_push($this->selectcols, $cv);
					}
					//array_push($this->selectcols, $c);
				}
			}else{
				array_push($this->selectcols, $elem);
			}
		}
	}
	
	//insert,update
	function setStr($col, $val){
		$this->cols[$col] = "'".$this->escapeStr($val)."'";
	}
	
	function setLtr($col, $val){
		$this->cols[$col] = $val;
	}
	
	function setAry($colval){
		if(is_array($colval)){ //配列であるか
			foreach($colval as $col => $val){
				$this->cols[$col] = "'".$this->escapeStr($val)."'";
			}
			//$this->cols[$col] = substr($this->cols[$col], 0, -1);
		}
	}
	
	function setInt(){
		$this->cols[$col] = (int)$val;
	}
	
	//where(and)
	function setWhere($col, $val, $sub = false){
		if($this->whereclause) $this->whereclause .= ' AND ';
		if($sub){
			$this->whereclause .= $col.' = '.$val;
		}else if(is_string($val)){
			$this->whereclause .= $col.' = \''.$val.'\'';
		}else if(is_int($val)){
			$this->whereclause .= $col.' = '.$val;
		}else if(is_array($col) && $val == null){
			$this->whereclause .= implode('=', $col);
		}
	}

	//where(or)
	function setWhereOr($col, $val){
		if($this->whereclause) $this->whereclause .= ' OR ';
		if(is_string($val)){
			$this->whereclause .= $col.' = \''.$val.'\'';
		}else if(is_int($val)){
			$this->whereclause .= $col.' = '.$val;
		}else if(is_array($col) && $val == null){
			$this->whereclause .= implode('=', $col);
		}
	}
	
	//where(or)+array
	function setWhereOrArray($col, $val){
		if($this->whereclause) $this->whereclause .= ' AND ';
		$this->whereclause .= '(';
		$num = count($val) - 1;
		$i = 0;
		foreach($val as $v){
			$this->whereclause .= $col.' = \''.$v.'\'';
			if($i != $num) $this->whereclause .= ' OR ';
			$i++;
		}
		$this->whereclause .= ')';
	}
	
	function setWherelike($col, $val){
		if($this->whereclause) $this->whereclause .= ' AND ';
		$this->whereclause .= $col.' like \'%'.$val.'%\'';
	}

	//order by
	function setOrderby($order){
		$this->orderbyclause = $order;
	}

	//group by
	function setGroupby($group){
		$this->groupbyclause = $group;
	}
	
	//limit
	function setLimit($start, $rec){
		$this->limitclause = $start.','.$rec;
	}
}

function h($str) {
    //return htmlspecialchars($str, ENT_QUOTES); シングルクォートが&#039;になる設定
    return htmlspecialchars($str);
}

function auto2euc($val){
	return mb_convert_encoding($val, "EUC-JP", "auto");
}

function euc2utf8($val){
	return mb_convert_encoding($val, "UTF-8", "EUC-JP");
}

function to_utf8($str, $from = 'auto'){
	if(is_array($str)){
		$result = array();
		foreach($str as $key => $value){
			$result[$key] = to_utf8($value, $from);
		}
		return $result;
	}else{
		return mb_convert_encoding($str, 'utf8', $from);
	}
}


function setLink(){
	if(!file_exists(CONFIG)){
		echo CONFIG."がありません";
		return false;
	}
	$config_ini = parse_ini_file(CONFIG, true);
	$link = "";
	foreach($config_ini as $key => $val){
		if($key == "common"){
			$src_url = $val['uri_location'];
			continue;
		}
		if(!file_exists($val['unix_location'])){
			echo $val['unix_location']."は存在しません";
			return false;
		}
		$link.= ":<a href=\"".$src_url.$val['uri_location']."\">";
		$link.= $val['uri_text'];
		$link.= "</a>:";
	}
	echo $link;
}
?>
