var fs = require("fs"),
	util = require("util"),
	moment = require("moment"),
	Byline = require("line-by-line"),
	mysql = require("mysql");

var filenameRegExp = new RegExp("meipai_update_users_\\d{4}\\.\\d{2}\\.\\d{2}")

var argv = process.splice(2)[0]
if(argv && argv == "new") {
	filenameRegExp = new RegExp("meipai_update_users_new_\\d{4}\\.\\d{2}\\.\\d{2}")
}

var files = fs.readdirSync("../../bda_data/结果/美拍/").filter(function(filename){
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
	var reader = new Byline("../../bda_data/结果/美拍/"+file);
	var captureTime = moment(file.match(/\d{4}\.\d{2}\.\d{2}/)[0], "YYYY.MM.DD").format("YYYY-MM-DD");
	reader.on("line", function(line){
		var vals = line.split("\t");
		if(vals.length != 14) {
			console.log("length not 14");
			return;
		}
		var gender = "未知";
		if(vals[5] == "f") {
			gender = "女";
		} else if(vals[5] == "m") {
			gender = "男";
		}
		// var birthday = "0000-00-00";
		// if(vals[6].match(/\d{4}-\d{2}-\d{2}/)) {
		// 	birthday = moment(vals[6], "YYYY-MM-DD").format("YYYY-MM-DD");
		// }
		var entryTime = moment(vals[13], "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD");
		var record = [
			vals[0],
			"\"\"",
			vals[2],
			vals[3],
			vals[4],
			"\""+gender+"\"",
			"\"0000-00-00\"",
			vals[7] == "false" ? "0" : "1",
			vals[8],
			vals[9],
			vals[10],
			vals[11],
			vals[12],
			"\""+entryTime+"\"",
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
	return util.format("insert into `meipaiuser_update` (MeipaiID,NickName,Country,Province,City,Gender,Birthday,IsVerified,FollowerNo,FollowNo,RepostNo,VideoNo,LikeNo,EntryTime,CaptureTime) values %s", 
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