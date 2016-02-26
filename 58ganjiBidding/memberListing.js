var fs = require("fs"),
	util = require("util"),
	moment = require("moment"),
	ByLine = require("line-by-line");

var month = process.argv.splice(2)[0] || moment().subtract(1, "month").format("YYYY-MM");
var dataDir = "../../spider/result/58ganji.combine/";
var resultFile = util.format("./stat/memberListing.%s.csv", month);

var regex = new RegExp(util.format("58\\.ganji\\.merchantpost\\.%s-\\d{2}\\.csv", month));
var files = fs.readdirSync(dataDir).filter(function(filename){
	return regex.test(filename);
});

function writeResult(stat) {
	var toWrite = [];
	Object.keys(stat).forEach(function(key){
		toWrite.push(util.format("%s,%s", key, stat[key]));
	});
	fs.writeFileSync(resultFile, toWrite.join("\n"));
}

var stat = {};

["招聘","本地服务","二手房","租房","二手车"].forEach(function(category){
	["加精","置顶"].forEach(function(postType){
		var platforms;
		if(category == "招聘" || category == "本地服务" || category == "二手车") {
			platforms = ["58","Ganji"];
		} else {
			platforms = ["58"];
		}
		platforms.forEach(function(platform){
			["memberPost","nonMemberPost","memberNo","nonMemberNo"].forEach(function(index){
				stat[util.format("%s_%s_%s_%s", category, postType, platform, index)] = 0;
			});
		});
	});
});

var map = {};

["招聘","本地服务","二手房","租房","二手车"].forEach(function(category){
	map[category] = {};
	var platforms;
	if(category == "招聘" || category == "本地服务" || category == "二手车") {
		platforms = ["58","Ganji"];
	} else {
		platforms = ["58"];
	}
	platforms.forEach(function(platform){
		map[category][platform] = {};
	});
});

function fillStat(map, stat) {
	Object.keys(map).forEach(function(category){
		Object.keys(map[category]).forEach(function(platform){
			var precisionMemberPost = 0, precisionNonMemberPost = 0,
				precisionMemberNo = 0, precisionNonMemberNo = 0;
			var topMemberPost = 0, topNonMemberPost = 0,
				topMemberNo = 0, topNonMemberNo = 0;
			console.log("%s-%s", category, platform, Object.keys(map[category][platform]).length);
			Object.keys(map[category][platform]).forEach(function(mid){
				var merchant = map[category][platform][mid];
				if(merchant.isMember && merchant.precision) {
					++precisionMemberNo;
					precisionMemberPost += merchant.precision;
				}
				if(merchant.isMember && merchant.top) {
					++topMemberNo;
					topMemberPost += merchant.top;
				}
				if(!merchant.isMember && merchant.precision) {
					++precisionNonMemberNo;
					precisionNonMemberPost += merchant.precision;
				}
				if(!merchant.isMember && merchant.top) {
					++topNonMemberNo;
					topNonMemberPost += merchant.top;
				}
			});
			stat[util.format("%s_加精_%s_memberPost", category, platform)] = precisionMemberPost;
			stat[util.format("%s_加精_%s_nonMemberPost", category, platform)] = precisionNonMemberPost;
			stat[util.format("%s_加精_%s_memberNo", category, platform)] = precisionMemberNo;
			stat[util.format("%s_加精_%s_nonMemberNo", category, platform)] = precisionNonMemberNo;
			stat[util.format("%s_置顶_%s_memberPost", category, platform)] = topMemberPost;
			stat[util.format("%s_置顶_%s_nonMemberPost", category, platform)] = topNonMemberPost;
			stat[util.format("%s_置顶_%s_memberNo", category, platform)] = topMemberNo;
			stat[util.format("%s_置顶_%s_nonMemberNo", category, platform)] = topNonMemberNo;
		});
	});
}

function readFile() {
	var file = files.shift();
	if(!file) {
		fillStat(map, stat);
		writeResult(stat);
		console.log("=====done=====");
		return;
	}
	var reader = new ByLine(dataDir+file);
	reader.on("line", function(line){
		var vals = line.split(",");
		if(vals.length != 9 || vals[1] == "版块") {
			return;
		}
		var category = vals[1], platform = vals[0], mid = vals[2], isMember = vals[4] == "true" ? true : false,
			precision = parseInt(vals[6]), top = parseInt(vals[7]);
		if(mid in map[category][platform]) {
			map[category][platform][mid].precision += precision;
			map[category][platform][mid].top += top;
		} else {
			map[category][platform][mid] = {
				isMember:isMember,
				precision:precision,
				top:top
			};
		}
	});
	reader.on("error", function(error){
		console.log(error);
	});
	reader.on("end", function(){
		console.log("=====Got %s=====", file);
		setTimeout(readFile, 0);
	});
}

readFile();