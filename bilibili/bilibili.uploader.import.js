var mysql = require("mysql"),
	util = require("util"),
	moment = require("moment"),
	logger = require("winston"),
	Byline = require("line-by-line"),
	fs = require("fs");

logger.cli();

var firstMonth = moment("2015-12", "YYYY-MM");

var args = process.argv.splice(2);
if(!args.length || !args[0].match(/\d{4}-\d{2}-\d{2}/)) {
	logger.error("must specify a legal date");
	return;
}
var updateTime = args[0];
var dataFile = util.format("/home/darren/data/bilibili/bilibili.video.detail.%s.csv", args[0]);
logger.info(dataFile);
var showUpArrayLength = moment(updateTime, "YYYY-MM-DD").diff(firstMonth, "month") + 1;

var insertPattern = "insert into bilibili_uploader (uploaderID,showUpArray,updateTime,addTime) values %s";
var updateShowPattern = "update bilibili_uploader set showUpArray = concat(showUpArray, '1'), updateTime = '%s' where uploaderID in (%s)";
var updateNoShowPattern = "update bilibili_uploader set showUpArray = concat(showUpArray, '0') where uploaderID in (%s)";

config = {
	database:"bdadata",
	user:"root",
	password:"12345678",
	host:"192.168.98.237"
}
connection = mysql.createConnection(config);
connection.connect();

var processedUploaders = {};
var existingUploaders = {};
var noNeedToModifyUploaders = {};

var insertSqls = [];
var updateShowSqls = [];
var updateNoShowSqls = [];

var sqls = [];

connection.query("select uploaderID, showUpArray from bilibili_uploader limit 1000000", function(error, records){
	if(error) {
		logger.error("Failed to select uploaderID from bilibili_uploader: %s", error);
		connection.end();
		return;
	}
	records.forEach(function(record){
		if(record.showUpArray.length > showUpArrayLength) {
			logger.warn("Invalid uploaderID: %s, showUpArray: %s", record.uploaderID, record.showUpArray);
			return;
		} else if(record.showUpArray.length == showUpArrayLength) {
			noNeedToModifyUploaders[record.uploaderID] = null;
		} else {
			existingUploaders[record.uploaderID] = null;
		}
	});
	logger.info("existingUploaders: %s", Object.keys(existingUploaders).length);
	logger.info("noNeedToModifyUploaders: %s", Object.keys(noNeedToModifyUploaders).length);
	setTimeout(readFile, 0);
});

function readFile() {
	var reader = new Byline(dataFile);
	reader.on("error", function(error){
		logger.error(error);
	});
	reader.on("line", function(line){
		var vals = line.split(",");
		if(vals.length != 11) {
			logger.warn(line);
			return;
		}
		if(vals[1] == "二级分类") {
			return;
		}
		var uploaderID = vals[6].match(/http:\/\/space\.bilibili\.com\/(\d+)/);
		if(!uploaderID) {
	        logger.warn(line);
	        return;
	    }
	    uploaderID = uploaderID[1];
	    if(uploaderID in processedUploaders) {
	    	// logger.info("%s already processed", uploaderID);
	    	return;
	    }
	    if(uploaderID in noNeedToModifyUploaders) {
	    	logger.info("No need to modify: %s", uploaderID);
	    } else if(uploaderID in existingUploaders) {
	    	delete existingUploaders[uploaderID];
	    	updateShowSqls.push(uploaderID);
    		logger.info("Push into updateShowSqls: %s", uploaderID);
	    } else {
	    	var showUpArray = "";
			for(var i = 0; i < showUpArrayLength-1; ++i) {
			    showUpArray += "0";
			}
			showUpArray += "1";
	    	insertSqls.push("("+
	    		[uploaderID,"'"+showUpArray+"'","'"+updateTime+"'","'"+updateTime+"'"].join()
	    		+")");
	    	logger.info("Push into insertSqls: %s", uploaderID);
	    }
	    processedUploaders[uploaderID] = null;
	});
	reader.on("end", function(){
		logger.info("==== Read file done ====");
		Object.keys(existingUploaders).forEach(function(uploaderID){
			updateNoShowSqls.push(uploaderID);
			logger.info("Push into updateNoShowSqls: %s", uploaderID);
		});
		processedUploaders = null;
		existingUploaders = null;
		buildSqls();
	});
}

function buildSqls() {
	var temp = null;
	temp = insertSqls.splice(0, 5000);
	while(temp.length) {
		sqls.push(util.format(insertPattern, temp.join()));
		temp = insertSqls.splice(0, 5000);
	}
	temp = updateShowSqls.splice(0, 5000);
	while(temp.length) {
		sqls.push(util.format(updateShowPattern, updateTime, temp.join()));
		temp = updateShowSqls.splice(0, 5000);
	}
	temp = updateNoShowSqls.splice(0, 5000);
	while(temp.length) {
		sqls.push(util.format(updateNoShowPattern, temp.join()));
		temp = updateNoShowSqls.splice(0, 5000);
	}
	logger.info("Build sql done. Total sqls: %s", sqls.length);
	doDatabase();
}

function doDatabase() {
	var sql = sqls.shift();
	if(!sql) {
		connection.end();
		logger.info("==== Job done ====");
		return;
	}
	logger.info("sqls left: %s", sqls.length);
	connection.query(sql, function(error) {
		if(error) {
			logger.error(error);
			connection.end();
			return;
		}
		setTimeout(doDatabase, 0);
	});
}
