var fs = require("fs"),
	util = require("util"),
	moment = require("moment");

var month = process.argv.splice(2)[0] || moment().subtract(1, "month").format("YYYY-MM");
var dataDir = "../../spider/result/58ganji.combine/";

var regex = new RegExp(util.format("58\\.ganji\\.bidding\\.%s-\\d{2}\\.csv", month));
var files = fs.readdirSync(dataDir).filter(function(filename){
	return regex.test(filename);
});

var resultFile = util.format("./stat/dailyListing.%s.csv", month);

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

var startOfMonth = moment(month, "YYYY-MM").startOf("month"), endOfMonth = moment(month, "YYYY-MM").endOf("month");
var dates = [], temp = startOfMonth;
while(temp.isBefore(endOfMonth)) {
	dates.push(temp.format("YYYY-MM-DD"));
	temp.add(1, "d");
}
fs.writeFileSync(resultFile, ["\ufeff"].concat(dates).join()+"\n");

function writeResult(stat) {
	var toWrite = [];
	Object.keys(stat).forEach(function(key){
		var temp = [key];
		dates.forEach(function(date){
			temp.push(stat[key][date] || "");
		});
		toWrite.push(temp.join());
	});
	fs.appendFileSync(resultFile, toWrite.join("\n"));
}

var stat = {};

["招聘","二手房","租房","二手车","本地服务"].forEach(function(category){
	["加精","置顶","普通会员贴"].forEach(function(postType){
		["58","Ganji"].forEach(function(platform){
			["tier1","tier2","tier3"].forEach(function(cityTier){
				stat[util.format("%s_%s_%s_%s", category, postType, platform, cityTier)] = {};
			})
		});
	});
});

function readFile() {
	var file = files.shift();
	if(!file) {
		writeResult(stat);
		console.log("=====done=====");
		return;
	}
	fs.readFileSync(dataDir+file).toString().split("\n").forEach(function(line, index){
		// skip titles
		if(!index) {
			return;
		}
		var vals = line.split(",");
		if(vals.length != 12) {
			return;
		}
		var date = vals[1];
		var category = vals[3];
		var platform = vals[0];
		var cityTier = findCityTier(vals[2]);
		if(date in stat[util.format("%s_%s_%s_%s", category, "加精", platform, cityTier)]) {
			stat[util.format("%s_%s_%s_%s", category, "加精", platform, cityTier)][date] += parseInt(vals[6]);
		} else {
			stat[util.format("%s_%s_%s_%s", category, "加精", platform, cityTier)][date] = parseInt(vals[6]);
		}
		if(date in stat[util.format("%s_%s_%s_%s", category, "置顶", platform, cityTier)]) {
			stat[util.format("%s_%s_%s_%s", category, "置顶", platform, cityTier)][date] += parseInt(vals[8]);
		} else {
			stat[util.format("%s_%s_%s_%s", category, "置顶", platform, cityTier)][date] = parseInt(vals[8]);
		}
		if(date in stat[util.format("%s_%s_%s_%s", category, "普通会员贴", platform, cityTier)]) {
			stat[util.format("%s_%s_%s_%s", category, "普通会员贴", platform, cityTier)][date] += parseInt(vals[10]);
		} else {
			stat[util.format("%s_%s_%s_%s", category, "普通会员贴", platform, cityTier)][date] = parseInt(vals[10]);
		}
	});
	console.log("=====Got %s=====", file);
	setTimeout(readFile, 0);
}

readFile();