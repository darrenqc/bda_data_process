"use strict"

const fs = require("fs"),
	util = require("util");

let argv = process.argv.splice(2)[0];
if(!argv || !argv.match(/\d{4}-\d{2}-\d{2}/)) {
	console.log("bad input, job quits");
	return;
}

let topRankFile = util.format("../../../data/bilibili/bilibili.top.%s.csv", argv);

let resultFile = util.format("./stat/topRank.%s.csv", argv);

let videos = {
	"全站榜":{
		"动画":{"videocount":0,"viewcount":0},
		"番剧":{"videocount":0,"viewcount":0},
		"音乐":{"videocount":0,"viewcount":0},
		"舞蹈":{"videocount":0,"viewcount":0},
		"游戏":{"videocount":0,"viewcount":0},
		"科技":{"videocount":0,"viewcount":0},
		"娱乐":{"videocount":0,"viewcount":0},
		"鬼畜":{"videocount":0,"viewcount":0},
		"电影":{"videocount":0,"viewcount":0},
		"电视剧":{"videocount":0,"viewcount":0},
		"时尚":{"videocount":0,"viewcount":0}
	},
	"原创榜":{
		"动画":{"videocount":0,"viewcount":0},
		"番剧":{"videocount":0,"viewcount":0},
		"音乐":{"videocount":0,"viewcount":0},
		"舞蹈":{"videocount":0,"viewcount":0},
		"游戏":{"videocount":0,"viewcount":0},
		"科技":{"videocount":0,"viewcount":0},
		"娱乐":{"videocount":0,"viewcount":0},
		"鬼畜":{"videocount":0,"viewcount":0},
		"电影":{"videocount":0,"viewcount":0},
		"电视剧":{"videocount":0,"viewcount":0},
		"时尚":{"videocount":0,"viewcount":0}
	},
	"新人榜":{
		"动画":{"videocount":0,"viewcount":0},
		"番剧":{"videocount":0,"viewcount":0},
		"音乐":{"videocount":0,"viewcount":0},
		"舞蹈":{"videocount":0,"viewcount":0},
		"游戏":{"videocount":0,"viewcount":0},
		"科技":{"videocount":0,"viewcount":0},
		"娱乐":{"videocount":0,"viewcount":0},
		"鬼畜":{"videocount":0,"viewcount":0},
		"电影":{"videocount":0,"viewcount":0},
		"电视剧":{"videocount":0,"viewcount":0},
		"时尚":{"videocount":0,"viewcount":0}
	},
	"新番榜":{
		"动画":{"videocount":0,"viewcount":0},
		"番剧":{"videocount":0,"viewcount":0},
		"音乐":{"videocount":0,"viewcount":0},
		"舞蹈":{"videocount":0,"viewcount":0},
		"游戏":{"videocount":0,"viewcount":0},
		"科技":{"videocount":0,"viewcount":0},
		"娱乐":{"videocount":0,"viewcount":0},
		"鬼畜":{"videocount":0,"viewcount":0},
		"电影":{"videocount":0,"viewcount":0},
		"电视剧":{"videocount":0,"viewcount":0},
		"时尚":{"videocount":0,"viewcount":0}
	}
}

let uploaderMap = {
	"全站榜":{},
	"原创榜":{},
	"新人榜":{},
	"新番榜":{}
};

let sumMap = {
	"全站榜":{"coins":0,"collect":0,"dm":0},
	"原创榜":{"coins":0,"collect":0,"dm":0},
	"新人榜":{"coins":0,"collect":0,"dm":0},
	"新番榜":{"coins":0,"collect":0,"dm":0}
}

function doTop() {
	fs.readFileSync(topRankFile).toString().trim().split("\n").forEach(function(line, index){
		if(!index) {
			return;
		}
		let vals = line.split(",");
		if(vals.length != 11) {
			console.log(line);
			return;
		}
		console.log(line);
		let rankName = vals[0];
		let category = vals[1];
		let uploader = vals[5];
		let watch = parseInt(vals[6]) || 0;
		let collect = parseInt(vals[7]) || 0;
		let coin = parseInt(vals[8]) || 0;
		let dm = parseInt(vals[9]) || 0;
		videos[rankName][category].videocount++;
		videos[rankName][category].viewcount += watch;
		uploaderMap[rankName][uploader] = null;
		sumMap[rankName].coins += coin;
		sumMap[rankName].collect += collect;
		sumMap[rankName].dm += dm;
	});
	write();
}

function write() {
	let result = [];
	// 全站榜
	result.push("");
	result.push("");
	result.push("");
	result.push(videos["全站榜"]["动画"].videocount);
	result.push(videos["全站榜"]["番剧"].videocount);
	result.push(videos["全站榜"]["音乐"].videocount);
	result.push(videos["全站榜"]["舞蹈"].videocount);
	result.push(videos["全站榜"]["游戏"].videocount);
	result.push(videos["全站榜"]["科技"].videocount);
	result.push(videos["全站榜"]["娱乐"].videocount);
	result.push(videos["全站榜"]["鬼畜"].videocount);
	result.push(videos["全站榜"]["电影"].videocount);
	result.push(videos["全站榜"]["电视剧"].videocount);
	result.push(videos["全站榜"]["时尚"].videocount);
	result.push("");
	result.push("");
	result.push("");
	result.push(videos["全站榜"]["动画"].viewcount);
	result.push(videos["全站榜"]["番剧"].viewcount);
	result.push(videos["全站榜"]["音乐"].viewcount);
	result.push(videos["全站榜"]["舞蹈"].viewcount);
	result.push(videos["全站榜"]["游戏"].viewcount);
	result.push(videos["全站榜"]["科技"].viewcount);
	result.push(videos["全站榜"]["娱乐"].viewcount);
	result.push(videos["全站榜"]["鬼畜"].viewcount);
	result.push(videos["全站榜"]["电影"].viewcount);
	result.push(videos["全站榜"]["电视剧"].viewcount);
	result.push(videos["全站榜"]["时尚"].viewcount);
	result.push("");
	result.push(Object.keys(uploaderMap["全站榜"]).length);
	result.push("");
	result.push(sumMap["全站榜"].coins);
	result.push("");
	result.push(sumMap["全站榜"].collect);
	result.push("");
	result.push(sumMap["全站榜"].dm);
	result.push("");
	// 原创榜
	result.push("");
	result.push("");
	result.push("");
	result.push(videos["原创榜"]["动画"].videocount);
	result.push(videos["原创榜"]["番剧"].videocount);
	result.push(videos["原创榜"]["音乐"].videocount);
	result.push(videos["原创榜"]["舞蹈"].videocount);
	result.push(videos["原创榜"]["游戏"].videocount);
	result.push(videos["原创榜"]["科技"].videocount);
	result.push(videos["原创榜"]["娱乐"].videocount);
	result.push(videos["原创榜"]["鬼畜"].videocount);
	result.push(videos["原创榜"]["电影"].videocount);
	result.push(videos["原创榜"]["电视剧"].videocount);
	result.push(videos["原创榜"]["时尚"].videocount);
	result.push("");
	result.push("");
	result.push("");
	result.push(videos["原创榜"]["动画"].viewcount);
	result.push(videos["原创榜"]["番剧"].viewcount);
	result.push(videos["原创榜"]["音乐"].viewcount);
	result.push(videos["原创榜"]["舞蹈"].viewcount);
	result.push(videos["原创榜"]["游戏"].viewcount);
	result.push(videos["原创榜"]["科技"].viewcount);
	result.push(videos["原创榜"]["娱乐"].viewcount);
	result.push(videos["原创榜"]["鬼畜"].viewcount);
	result.push(videos["原创榜"]["电影"].viewcount);
	result.push(videos["原创榜"]["电视剧"].viewcount);
	result.push(videos["原创榜"]["时尚"].viewcount);
	result.push("");
	result.push(Object.keys(uploaderMap["原创榜"]).length);
	result.push("");
	result.push(sumMap["原创榜"].coins);
	result.push("");
	result.push(sumMap["原创榜"].collect);
	result.push("");
	result.push(sumMap["原创榜"].dm);
	result.push("");
	// 新人榜
	result.push("");
	result.push("");
	result.push("");
	result.push(videos["新人榜"]["动画"].videocount);
	result.push(videos["新人榜"]["番剧"].videocount);
	result.push(videos["新人榜"]["音乐"].videocount);
	result.push(videos["新人榜"]["舞蹈"].videocount);
	result.push(videos["新人榜"]["游戏"].videocount);
	result.push(videos["新人榜"]["科技"].videocount);
	result.push(videos["新人榜"]["娱乐"].videocount);
	result.push(videos["新人榜"]["鬼畜"].videocount);
	result.push(videos["新人榜"]["电影"].videocount);
	result.push(videos["新人榜"]["电视剧"].videocount);
	result.push(videos["新人榜"]["时尚"].videocount);
	result.push("");
	result.push("");
	result.push("");
	result.push(videos["新人榜"]["动画"].viewcount);
	result.push(videos["新人榜"]["番剧"].viewcount);
	result.push(videos["新人榜"]["音乐"].viewcount);
	result.push(videos["新人榜"]["舞蹈"].viewcount);
	result.push(videos["新人榜"]["游戏"].viewcount);
	result.push(videos["新人榜"]["科技"].viewcount);
	result.push(videos["新人榜"]["娱乐"].viewcount);
	result.push(videos["新人榜"]["鬼畜"].viewcount);
	result.push(videos["新人榜"]["电影"].viewcount);
	result.push(videos["新人榜"]["电视剧"].viewcount);
	result.push(videos["新人榜"]["时尚"].viewcount);
	result.push("");
	result.push(Object.keys(uploaderMap["新人榜"]).length);
	result.push("");
	result.push(sumMap["新人榜"].coins);
	result.push("");
	result.push(sumMap["新人榜"].collect);
	result.push("");
	result.push(sumMap["新人榜"].dm);
	result.push("");
	// 新番榜
	result.push("");
	result.push("");
	result.push("");
	result.push(videos["新番榜"]["动画"].videocount);
	result.push(videos["新番榜"]["番剧"].videocount);
	result.push(videos["新番榜"]["音乐"].videocount);
	result.push(videos["新番榜"]["舞蹈"].videocount);
	result.push(videos["新番榜"]["游戏"].videocount);
	result.push(videos["新番榜"]["科技"].videocount);
	result.push(videos["新番榜"]["娱乐"].videocount);
	result.push(videos["新番榜"]["鬼畜"].videocount);
	result.push(videos["新番榜"]["电影"].videocount);
	result.push(videos["新番榜"]["电视剧"].videocount);
	result.push(videos["新番榜"]["时尚"].videocount);
	result.push("");
	result.push("");
	result.push("");
	result.push(videos["新番榜"]["动画"].viewcount);
	result.push(videos["新番榜"]["番剧"].viewcount);
	result.push(videos["新番榜"]["音乐"].viewcount);
	result.push(videos["新番榜"]["舞蹈"].viewcount);
	result.push(videos["新番榜"]["游戏"].viewcount);
	result.push(videos["新番榜"]["科技"].viewcount);
	result.push(videos["新番榜"]["娱乐"].viewcount);
	result.push(videos["新番榜"]["鬼畜"].viewcount);
	result.push(videos["新番榜"]["电影"].viewcount);
	result.push(videos["新番榜"]["电视剧"].viewcount);
	result.push(videos["新番榜"]["时尚"].viewcount);
	result.push("");
	result.push(Object.keys(uploaderMap["新番榜"]).length);
	result.push("");
	result.push(sumMap["新番榜"].coins);
	result.push("");
	result.push(sumMap["新番榜"].collect);
	result.push("");
	result.push(sumMap["新番榜"].dm);
	result.push("");
	fs.writeFileSync(resultFile, result.join("\n"));
	console.log("==== Job done ====");
}

doTop();