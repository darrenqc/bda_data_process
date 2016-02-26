var fs = require("fs"),
	util = require("util"),
	moment = require("moment"),
	ByLine = require("line-by-line");

var month = process.argv.splice(2)[0] || moment().subtract(1, "month").format("YYYY-MM");
var dataDir = "../../spider/result/58ganji.combine/";
var resultFile = util.format("./stat/tierBasedMerchant.%s.csv", month);

var tier1 = {"北京":1,"上海":1,"深圳":1,"广州":1},
	tier2 = {"郑州":1,"西安":1,"成都":1,"南京":1,"沈阳":1,"武汉":1,"重庆":1,"济南":1,"天津":1,"石家庄":1,"苏州":1,"合肥":1,"长春":1},
	tier3 = {"绵阳":1,"泉州":1,"唐山":1,"宜昌":1,"东莞":1,"温州":1,"佛山":1,"厦门":1,"无锡":1,"柳州":1,"襄阳":1,"株洲":1,"常州":1};

function findCityTier(city) {
	if(tier1[city]) {
		return "tier1";
	} else if(tier2[city]) {
		return "tier2";
	} else if(tier3[city]) {
		return "tier3";
	} else {
		console.log("wrong city tier: %s", city);
		return "wrong";
	}
}

var tasks = [
	{cateogry:"job",platform:"wuba"},
	{cateogry:"job",platform:"gj"},
	{cateogry:"secondaryhouse",platform:"wuba"},
	{cateogry:"rent",platform:"wuba"},
	{cateogry:"usedcar",platform:"wuba"},
	{cateogry:"usedcar",platform:"gj"},
	{cateogry:"service",platform:"wuba"},
	{cateogry:"service",platform:"gj"}
];

var stat = {
	wuba_all_all:0,
	wuba_all_tier1:0,
	wuba_all_tier2:0,
	wuba_all_tier3:0,
	wuba_all_memberall:0,
	wuba_all_membertier1:0,
	wuba_all_membertier2:0,
	wuba_all_membertier3:0,
	gj_all_all:0,
	gj_all_tier1:0,
	gj_all_tier2:0,
	gj_all_tier3:0,
	gj_all_memberall:0,
	gj_all_membertier1:0,
	gj_all_membertier2:0,
	gj_all_membertier3:0,
};

tasks.forEach(function(task){
	["all","tier1","tier2","tier3","memberall","membertier1","membertier2","membertier3"].forEach(function(tier){
		stat[util.format("%s_%s_%s", task.platform, task.cateogry, tier)] = 0;
	});
});

var wubaAllMap = {all:{},tier1:{},tier2:{},tier3:{}}, gjAllMap = {all:{},tier1:{},tier2:{},tier3:{}};

function writeResult(stat) {
	var toWrite = [];
	Object.keys(stat).forEach(function(key){
		toWrite.push(util.format("%s,%s", key, stat[key]));
	});
	fs.writeFileSync(resultFile, toWrite.join("\n"));
}

function go() {
	var task = tasks.shift();
	if(!task) {
		["all","tier1","tier2","tier3"].forEach(function(tier){
			stat[util.format("wuba_all_%s", tier)] = Object.keys(wubaAllMap[tier]).length;
			stat[util.format("gj_all_%s", tier)] = Object.keys(gjAllMap[tier]).length;
			var wubaMemberCount = 0;
			Object.keys(wubaAllMap[tier]).forEach(function(merchant){
				if(wubaAllMap[tier][merchant]) {
					++wubaMemberCount;
				}
			});
			stat[util.format("%s_%s_%s", "wuba", "all", "member"+tier)] = wubaMemberCount;
			var gjMemberCount = 0;
			Object.keys(gjAllMap[tier]).forEach(function(merchant){
				if(gjAllMap[tier][merchant]) {
					++gjMemberCount;
				}
			});
			stat[util.format("%s_%s_%s", "gj", "all", "member"+tier)] = gjMemberCount;
		});
		writeResult(stat);
		console.log("=====done=====");
		return;
	}
	var file = util.format("%s.%s.merchant.%s.csv", task.platform, task.cateogry, month);
	var map = {
		all:{},
		tier1:{},
		tier2:{},
		tier3:{}
	};
	var reader = new ByLine(dataDir+file);
	reader.on("line", function(line){
		var vals = line.split(",");
		if(vals.length != 5) {
			return;
		}
		var cityTier = findCityTier(vals[1]);
		var isMember = vals[2] == "true" ? true : false;
		if(task.platform == "wuba") {
			wubaAllMap.all[vals[0]] = wubaAllMap.all[vals[0]] || isMember;
			wubaAllMap[cityTier][vals[0]] = wubaAllMap[cityTier][vals[0]] || isMember;
		} else {
			gjAllMap.all[vals[0]] = gjAllMap.all[vals[0]] || isMember;
			gjAllMap[cityTier][vals[0]] = gjAllMap[cityTier][vals[0]] || isMember;
		}
		map.all[vals[0]] = map.all[vals[0]] || isMember;
		map[cityTier][vals[0]] = map[cityTier][vals[0]] || isMember;
	});
	reader.on("error", function(error){
		console.log(error);
	});
	reader.on("end", function(){
		["all","tier1","tier2","tier3"].forEach(function(tier){
			stat[util.format("%s_%s_%s", task.platform, task.cateogry, tier)] = Object.keys(map[tier]).length;
			var memberCount = 0;
			Object.keys(map[tier]).forEach(function(merchant){
				if(map[tier][merchant]) {
					++memberCount;
				}
			});
			stat[util.format("%s_%s_%s", task.platform, task.cateogry, "member"+tier)] = memberCount;
		});
		setTimeout(go, 0);
		console.log("Got %s", file);
	});
}

go();