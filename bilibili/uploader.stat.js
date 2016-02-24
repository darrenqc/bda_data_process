"use strict"

const fs = require("fs"),
	util = require("util"),
	moment = require("moment"),
	Byline = require("line-by-line");

let argv = process.argv.splice(2)[0];
if(!argv || !argv.match(/\d{4}-\d{2}-\d{2}/)) {
	console.log("bad input, job quits");
	return;
}

let endOfLastMonth = moment(argv, "YYYY-MM-DD").startOf("month").subtract(1, "day");
let startOfNextMonth = moment(argv, "YYYY-MM-DD").endOf("month").add(1, "day");

let activeFile = util.format("../../../data/bilibili/bilibili.active.uploader.%s.csv", argv);
let hotFile = util.format("../../../data/bilibili/bilibili.hot.uploader.%s.csv", argv);

let resultFile = util.format("./stat/uploader.%s.csv", argv);

let toWrite = [];

function doActive() {
	let videoMap = {};
	let newVideos = 0;
	let views = 0;
	let reader = new Byline(activeFile);
	reader.on("error", function(error){
		console.log(error);
	});
	reader.on("line", function(line){
		let vals = line.split(",");
		if(vals.length != 9) {
			console.log(line);
			return;
		}
		if(vals[2] == "分类") {
			return;
		}
		let videoId = vals[3];
		let watch = parseInt(vals[5]) || 0;
		let uploadtime = moment(vals[8], "YYYY-MM-DD");
		if(!videoMap[videoId]) {
			videoMap[videoId] = null;
			if(uploadtime.isAfter(endOfLastMonth) && uploadtime.isBefore(startOfNextMonth)) {
				newVideos += 1;
			}
			views += watch;
		}
	});
	reader.on("end", function(){
		console.log("====> Got %s <====", activeFile);
		toWrite.push(Object.keys(videoMap).length);
		toWrite.push("");
		toWrite.push(newVideos);
		toWrite.push("");
		toWrite.push("");
		toWrite.push("");
		toWrite.push(views);
		toWrite.push("");
		toWrite.push("");
		toWrite.push("");
		toWrite.push("");
		toWrite.push("");
		setTimeout(doHot, 0);
	});
}

function doHot() {
	let videoMap = {};
	let newVideos = 0;
	let views = 0;
	let reader = new Byline(hotFile);
	reader.on("error", function(error){
		console.log(error);
	});
	reader.on("line", function(line){
		let vals = line.split(",");
		if(vals.length != 9) {
			console.log(line);
			return;
		}
		if(vals[2] == "分类") {
			return;
		}
		let videoId = vals[3];
		let watch = parseInt(vals[5]) || 0;
		let uploadtime = moment(vals[8], "YYYY-MM-DD");
		if(!videoMap[videoId]) {
			videoMap[videoId] = null;
			if(uploadtime.isAfter(endOfLastMonth) && uploadtime.isBefore(startOfNextMonth)) {
				newVideos += 1;
			}
			views += watch;
		}
	});
	reader.on("end", function(){
		console.log("====> Got %s <====", hotFile);
		toWrite.push(Object.keys(videoMap).length);
		toWrite.push("");
		toWrite.push(newVideos);
		toWrite.push("");
		toWrite.push("");
		toWrite.push("");
		toWrite.push(views);
		fs.writeFileSync(resultFile, toWrite.join("\n"));
		console.log("====> Job done <====");
	});
}

doActive();