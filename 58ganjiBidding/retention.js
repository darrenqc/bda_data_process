 var fs = require("fs"),
	util = require("util"),
	moment = require("moment"),
	ByLine = require("line-by-line");

var dataDir = "../../spider/result/58ganji.combine/";
var resultFile = util.format("./stat/retention.%s.csv", moment().format("YYYY-MM-DD"));

var arg = process.argv.splice(2)[0] || "2016-01";
var startMonth = moment("2015-09", "YYYY-MM"), endMonth = moment(arg, "YYYY-MM");
var temp = startMonth;
var months = [];
while(!temp.isAfter(endMonth)) {
	months.push(temp.format("YYYY-MM"));
	temp.add(1, "month");
}

var tasks = [
	{platform:"58",category:"overall"},
	{platform:"58",category:"招聘"},
	{platform:"58",category:"本地服务"},
	{platform:"58",category:"二手房"},
	{platform:"58",category:"租房"},
	{platform:"58",category:"二手车"},
	{platform:"Ganji",category:"overall"},
	{platform:"Ganji",category:"招聘"},
	{platform:"Ganji",category:"本地服务"},
	{platform:"Ganji",category:"二手车"}
];

var newMerchant = {}, currentMerchant = {}, regexps = [];
tasks.forEach(function(task){
	newMerchant[util.format("%s_%s", task.platform, task.category)] = {};
	currentMerchant[util.format("%s_%s", task.platform, task.category)] = {};
});
months.forEach(function(month){
	Object.keys(newMerchant).forEach(function(key){
		newMerchant[key][month] = {};
	});
	Object.keys(currentMerchant).forEach(function(key){
		currentMerchant[key][month] = {};
	});
	regexps.push(new RegExp(util.format("58\\.ganji\\.merchantpost\\.%s-\\d{2}\\.csv", month)));
});

var files = fs.readdirSync(dataDir).filter(function(filename){
	for(var i = 0; i < regexps.length; ++i) {
		if(regexps[i].test(filename)) {
			return true;
		}
	}
});

function doTask() {
	var task = tasks.shift();
	if(!task) {
		console.log("=====Job done=====");
		return;
	}
	var key = util.format("%s_%s", task.platform, task.category);
	fs.appendFileSync(resultFile, key+"\n");
	months.forEach(function(month, index){
		var toWrite = [month];
		var merchantsOfThisMonth = Object.keys(newMerchant[key][month]).length;
		for(var i = index+1; i < months.length; i++) {
			var merchantsRemained = 0;
			Object.keys(newMerchant[key][month]).forEach(function(merchantId){
				if(merchantId in currentMerchant[key][months[i]]) {
					++merchantsRemained;
				}
			});
			toWrite.push((merchantsRemained/merchantsOfThisMonth*100).toFixed(2));
		}
		fs.appendFileSync(resultFile, toWrite.join()+"\n");
	});
	console.log("=====Got %s=====", key);
	setTimeout(doTask, 0);
}

function readFile() {
	var file = files.shift();
	if(!file) {
		console.log("=====All files loaded=====");
		// var c = "58_招聘";
		// Object.keys(currentMerchant[c]).forEach(function(month){
		// 	console.log(Object.keys(currentMerchant[c][month]).length);
		// });
		// Object.keys(newMerchant[c]).forEach(function(month){
		// 	console.log(Object.keys(newMerchant[c][month]).length);
		// });
		setTimeout(doTask, 0);
		return;
	}
	var currentMonth = file.match(/\d{4}-\d{2}/)[0];
	var currentMonthIndex = months.indexOf(currentMonth);
	var reader = new ByLine(dataDir+file);
	reader.on("line", function(line){
		var vals = line.split(",");
		if(vals.length != 9 || vals[1] == "版块") {
			return;
		}
		var platform = vals[0];
		var category = vals[1];
		var merchantId = vals[2];
		var key = util.format("%s_%s", platform, category);
		var overallKey = util.format("%s_overall", platform);
		currentMerchant[key][currentMonth][merchantId] = null;
		currentMerchant[overallKey][currentMonth][merchantId] = null;
		if(currentMonthIndex == 0) {
			newMerchant[key][currentMonth][merchantId] = null;
			newMerchant[overallKey][currentMonth][merchantId] = null;
		} else {
			var shouldAddToNewMerchant = true;
			for(var i = 0; i < currentMonthIndex; ++i) {
				if(merchantId in newMerchant[key][months[i]]) {
					shouldAddToNewMerchant = false;
					break;
				}
			}
			if(shouldAddToNewMerchant) {
				newMerchant[key][currentMonth][merchantId] = null;
			}
			shouldAddToNewMerchant = true;
			for(var i = 0; i < currentMonthIndex; ++i) {
				if(merchantId in newMerchant[overallKey][months[i]]) {
					shouldAddToNewMerchant = false;
					break;
				}
			}
			if(shouldAddToNewMerchant) {
				newMerchant[overallKey][currentMonth][merchantId] = null;
			}
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

readFile()