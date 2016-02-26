var fs = require("fs"),
	util = require("util"),
	moment = require("moment"),
	Byline = require("line-by-line"),
	mysql = require("mysql");

var filenameRegExp = new RegExp("gifshow_update_users_\\d{4}\\.\\d{2}\\.\\d{2}")

var argv = process.splice(2)[0]
if(argv && argv == "new") {
	filenameRegExp = new RegExp("gifshow_update_users_new_\\d{4}\\.\\d{2}\\.\\d{2}")
}

var files = fs.readdirSync("../../bda_data/结果/Gif快手结果/monthly/").filter(function(filename){
	return filename.match(filenameRegExp);
});

var config = {
	database:"bdadata",
	// database:"internetcompanies",
	user:"root",
	password:"12345678",
	host:"192.168.98.237",
	connectionLimit:10
};

connection = mysql.createConnection(config);

connection.connect();

var sql = [], count = 0;

function importFile() {
	var file = files.pop();
	if(!file) {
		console.log("=====done====");
		connection.end();
		return;
	}
	console.log(file);
	var reader = new Byline("../../bda_data/结果/Gif快手结果/monthly/"+file);
	var captureTime = moment(file.match(/\d{4}\.\d{2}\.\d{2}/)[0], "YYYY.MM.DD").format("YYYY-MM-DD");
	reader.on("line", function(line){
		var vals = line.split(",");
		if(vals.length != 9) {
			console.log("length not 9");
			return;
		}
		var gender = "未知";
		if(vals[2] == "F") {
			gender = "女";
		} else if(vals[2] == "M") {
			gender = "男";
		}
		vals[7] = vals[7] || -1;
		var record = [
			vals[0],
			"\"\"",
			"\""+gender+"\"",
			vals[3],
			vals[4],
			vals[5],
			vals[6],
			vals[7],
			"\""+vals[8]+"\"",
			"\""+captureTime+"\""
		];
		sql.push(util.format("(%s)", record.join()));
		if(sql.length >= 5000) {
			count += 5000;
			insert(sql);
			console.log("%s/1000000", count);
			sql = [];
		}
	});
	reader.on("error", function(error){
		console.log(error);
	});
	reader.on("end", function(){
		console.log("=====end=====");
		insert(sql, "done");
	});
}

function buildSql(sql) {
	return util.format("insert into `gifshowuser_update` (GifshowID,NickName,Gender,FollowerNo,LikeNo,PhotoNo,FollowNo,UserAccountLevel,UserAccountLevelName,CaptureTime) values %s", 
		sql.join());
}

function insert(sql, flag) {
	connection.query(buildSql(sql), function(err){
		if(err){
			console.log(err);
		}
		if(flag) {
			console.log("=====done=====");
			connection.end();
		}
	});
}

importFile();