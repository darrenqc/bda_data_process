var mysql = require("mysql"),
	util = require("util"),
	moment = require("moment"),
	logger = require("winston"),
	Byline = require("line-by-line"),
	fs = require("fs");

logger.cli();

var args = process.argv.splice(2);
if(!args.length || !args[0].match(/\d{4}-\d{2}-\d{2}/)) {
	logger.error("must specify a legal date");
	return;
}
var updateTime = args[0];
var dataFile = util.format("/home/darren/data/bilibili/bilibili.video.detail.%s.csv", args[0]);
logger.info(dataFile);

var insertOrUpdatePattern = "insert into bilibili_video (videoID,videoCategory,uploader,lastWatch,watch,collect,dm,updateTime,uploadTime) values %s on duplicate key update lastWatch = if(updateTime=values(updateTime), lastWatch, watch), watch = values(watch), collect = values(collect), dm = values(dm), updateTime = values(updateTime)";

config = {
	database:"bdadata",
	user:"root",
	password:"12345678",
	host:"192.168.98.237"
}
connection = mysql.createConnection(config);
connection.connect();

var sql = [];
var count = 0;

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
	var videoID = vals[3].match(/video\/av(\d+)/)[1];
	var videoCategory = vals[0];
	var uploader = vals[6];
	var watch = parseInt(vals[7]) || 0;
	var collect = parseInt(vals[8]) || 0;
	var dm = parseInt(vals[9]) || 0;
	var uploadTime = moment(vals[10]).format("YYYY-MM-DD");
	sql.push("("+[
			videoID,
			"'"+videoCategory+"'",
			"'"+uploader+"'",
			watch,
			watch,
			collect,
			dm,
			"'"+updateTime+"'",
			"'"+uploadTime+"'"
		].join()+")");
	if(sql.length >= 5000) {
		reader.pause();
		connection.query(util.format(insertOrUpdatePattern, sql.join()), function(error){
			if(error) {
				logger.error(error);
			}
			count += 5000;
			sql = [];
			reader.resume();
			logger.info("inserted %s", count);
		});
	}
});
reader.on("end", function(){
	if(sql.length) {
		connection.query(util.format(insertOrUpdatePattern, sql.join()), function(error){
			if(error) {
				logger.error(error);
			}
			logger.info("==== Job done ====");
			connection.end();
		});
	} else {
		logger.info("==== Job done ====");
		connection.end();
	}
});