Event.observe(window, 'load', function(){
	var start = new TabMaker('tab');
	var i = 0;
	start.create(i);
});

var TabMaker = Class.create();
TabMaker.prototype = {
	initialize: function(tab) {
		this.tabLnegth = gcn(tab).length;
		this.tabName = tab;
	},
	create: function(i) {
		var menu = new TabIndex(this.tabName);
		for (i; i < this.tabLnegth; i++) {
			menu.appendTab(new Tab('Tab' + i, (i==0)));
		}
		menu.setTab();
	}
}

var Tab = Class.create();
Tab.prototype = {
	initialize: function(name, open) {
		//name: Tab0,Tab1...
		this.name = name;
		this.page = name + 'Box';
		this.open = open;
	},
	styleTab: function() {
		if (this.open){
			this.setStyle('inline', '', 'open');
		}else{
			this.setStyle('none', 'absolute', 'close');
		}
		this.open = false;
	},
	setStyle: function(display, position, className){
		var page = $(this.page).style;
		var name = $(this.name);
		page.display = display;
		//page.position = position;
		name.className = className;
	}
}

var TabIndex = Class.create();
TabIndex.prototype = {
	initialize : function(tab) {
		this.last = 0;
		this.tabs = new Array();
		this.tabName = tab;
	},
	getTabAt : function(index) {
		return this.tabs[index];
	},
	appendTab : function(tab) {
		this.tabs[this.last] = tab;
		gcn(this.tabName)[this.last].id = tab.name;
		gcn(this.tabName+'Box')[this.last].id = tab.page;
		this.last++;
		var link = document.createElement('a');
		link.innerHTML = $(tab.name).innerHTML;
		//link.href = 'javascript:void(0);'
		$(tab.name).innerHTML = '';
		$(tab.name).appendChild(link);
		$(tab.name).onclick = function(){
			tab.open = true;
			this.setTab();
		}.bind(this);
	},
	getLength : function() {
		return this.last;
	},
	each : function(func) {
		for (var i = 0; i < this.getLength(); i++) {
			func(this.getTabAt(i));
		}
	},
	setTab: function() {
		this.each(function(tab) {
				tab.styleTab();
		});
	}
};

function gcn(id){
	return document.getElementsByClassName(id);
}

