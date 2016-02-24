var fs = require("fs"),
	util = require("util"),
	moment = require("moment"),
	LineByLineReader = require("line-by-line");

var args = process.argv.splice(2);

if(args.length != 1 || !args[0].match(/\d{4}-\d{2}/)) {
	console.log("[ERROR] Must specify month");
	return;
}

var startMonth = "2015-11";
var curMonth = args[0];
var numOfZerosToFill = moment(curMonth, "YYYY-MM").diff(moment(startMonth, "YYYY-MM"), "M");

var drivers, driversTier1, driversTier2, driversTier3, cars, carsTier1, carsTier2, carsTier3;
if(fs.existsSync("./json/drivers.json")) {
	drivers = JSON.parse(fs.readFileSync("./json/drivers.json").toString());
} else {
	drivers = {};
}
if(fs.existsSync("./json/driversTier1.json")) {
	driversTier1 = JSON.parse(fs.readFileSync("./json/driversTier1.json").toString());
} else {
	driversTier1 = {};
}
if(fs.existsSync("./json/driversTier2.json")) {
	driversTier2 = JSON.parse(fs.readFileSync("./json/driversTier2.json").toString());
} else {
	driversTier2 = {};
}
if(fs.existsSync("./json/driversTier3.json")) {
	driversTier3 = JSON.parse(fs.readFileSync("./json/driversTier3.json").toString());
} else {
	driversTier3 = {};
}
if(fs.existsSync("./json/cars.json")) {
	cars = JSON.parse(fs.readFileSync("./json/cars.json").toString());
} else {
	cars = {};
}
if(fs.existsSync("./json/carsTier1.json")) {
	carsTier1 = JSON.parse(fs.readFileSync("./json/carsTier1.json").toString());
} else {
	carsTier1 = {};
}
if(fs.existsSync("./json/carsTier2.json")) {
	carsTier2 = JSON.parse(fs.readFileSync("./json/carsTier2.json").toString());
} else {
	carsTier2 = {};
}
if(fs.existsSync("./json/carsTier3.json")) {
	carsTier3 = JSON.parse(fs.readFileSync("./json/carsTier3.json").toString());
} else {
	carsTier3 = {};
}

var files = fs.readdirSync(util.format("./%s/", curMonth));
var cityMap = {
	Tier1:{},
	Tier2:{},
	Tier3:{}
};
var totalDays = files.length;
var sumActiveCar = 0, sumActiveCarTier1 = 0, sumActiveCarTier2 = 0, sumActiveCarTier3 = 0;
var sumActiveDriver = 0, sumActiveDriverTier1 = 0, sumActiveDriverTier2 = 0, sumActiveDriverTier3 = 0;

var tier1 = {"北京":1,"上海":1,"深圳":1,"广州":1},
	tier2 = {
		"天津":1,"杭州":1,"南京":1,"济南":1,"重庆":1,"青岛":1,"大连":1,"宁波":1,
		"厦门":1,"成都":1,"武汉":1,"哈尔滨":1,"沈阳":1,"西安":1,"长春":1,"长沙":1,
		"福州":1,"郑州":1,"石家庄":1,"苏州":1,"佛山":1,"东莞":1,"无锡":1,"烟台":1,
		"太原":1,"合肥":1,"南昌":1,"南宁":1,"昆明":1,"温州":1,"淄博":1,"唐山":1};

function findCityTier(city) {
	if(tier1[city]) {
		return "Tier1";
	} else if(tier2[city]) {
		return "Tier2";
	} else {
		return "Tier3";
	}
}

function calculateMetrics() {
	var result = [];
	/* # of Days Captured */
	result.push(totalDays);
	result.push("");
	/* Cars */
	result.push("");
	result.push("");
	/* Number of cummulative cars */
	result.push(Object.keys(cars).length);
	result.push("");
	result.push(Object.keys(carsTier1).length);
	result.push(Object.keys(carsTier2).length);
	result.push(Object.keys(carsTier3).length);
	result.push("");
	/* # of active cars in the month */
	var countCar = 0;
	Object.keys(cars).forEach(function(car){
		if(cars[car][numOfZerosToFill]) {
			++countCar;
		}
	});
	result.push(countCar);
	result.push("");
	var countCarTier1 = 0;
	Object.keys(carsTier1).forEach(function(car){
		if(carsTier1[car][numOfZerosToFill]) {
			++countCarTier1;
		}
	});
	result.push(countCarTier1);
	var countCarTier2 = 0;
	Object.keys(carsTier2).forEach(function(car){
		if(carsTier2[car][numOfZerosToFill]) {
			++countCarTier2;
		}
	});
	result.push(countCarTier2);
	var countCarTier3 = 0;
	Object.keys(carsTier3).forEach(function(car){
		if(carsTier3[car][numOfZerosToFill]) {
			++countCarTier3;
		}
	});
	result.push(countCarTier3);
	result.push("");
	/* Average $ of Daily Active Cars */
	result.push((sumActiveCar/totalDays).toFixed(2));
	result.push("");
	result.push((sumActiveCarTier1/totalDays).toFixed(2));
	result.push((sumActiveCarTier2/totalDays).toFixed(2));
	result.push((sumActiveCarTier3/totalDays).toFixed(2));
	result.push("");
	/* Daily Activity Level */
	result.push("");
	result.push("");
	result.push("");
	result.push("");
	result.push("");
	result.push("");
	/* Drivers */
	result.push("");
	result.push("");
	/* Number of cummulative drivers */
	result.push(Object.keys(drivers).length);
	result.push("");
	result.push(Object.keys(driversTier1).length);
	result.push(Object.keys(driversTier2).length);
	result.push(Object.keys(driversTier3).length);
	result.push("");
	/* # of active drivers in the month */
	var countDriver = 0;
	Object.keys(drivers).forEach(function(driver){
		if(drivers[driver][numOfZerosToFill]) {
			++countDriver;
		}
	});
	result.push(countDriver);
	result.push("");
	var countDriverTier1 = 0;
	Object.keys(driversTier1).forEach(function(driver){
		if(driversTier1[driver][numOfZerosToFill]) {
			++countDriverTier1;
		}
	});
	result.push(countDriverTier1);
	var countDriverTier2 = 0;
	Object.keys(driversTier2).forEach(function(driver){
		if(driversTier2[driver][numOfZerosToFill]) {
			++countDriverTier2;
		}
	});
	result.push(countDriverTier2);
	var countDriverTier3 = 0;
	Object.keys(driversTier3).forEach(function(driver){
		if(driversTier3[driver][numOfZerosToFill]) {
			++countDriverTier3;
		}
	});
	result.push(countDriverTier3);
	result.push("");
	/* Average # of Daily Active Drivers */
	result.push((sumActiveDriver/totalDays).toFixed(2));
	result.push("");
	result.push((sumActiveDriverTier1/totalDays).toFixed(2));
	result.push((sumActiveDriverTier2/totalDays).toFixed(2));
	result.push((sumActiveDriverTier3/totalDays).toFixed(2));
	result.push("");
	/* # of drivers per car */
	result.push((countDriver/countCar).toFixed(2));
	result.push("");
	result.push((countDriverTier1/countCarTier1).toFixed(2));
	result.push((countDriverTier2/countCarTier2).toFixed(2));
	result.push((countDriverTier3/countCarTier3).toFixed(2));
	fs.writeFileSync(util.format("./result/basic.%s.csv", curMonth), result.join("\n"));
	console.log("# of Tier1 Cities captured: %s", Object.keys(cityMap.Tier1).length);
	console.log("# of Tier2 Cities captured: %s", Object.keys(cityMap.Tier2).length);
	console.log("# of Tier3 Cities captured: %s", Object.keys(cityMap.Tier3).length);
	console.log("===> Basic metrics done <===");
	/* Retention */
	var months = [];
	var tempMonth = startMonth;
	while(moment(tempMonth, "YYYY-MM").isBefore(moment(curMonth, "YYYY-MM"))) {
		months.push(tempMonth);
		tempMonth = moment(tempMonth, "YYYY-MM").add(1, "month").format("YYYY-MM");
	}
	var carRetentionResult = [], driverRetentionResult = [];
	months.forEach(function(month, monthIndex){
		carRetentionResult.push(calculateRentention(month, monthIndex, months.length, cars));
		driverRetentionResult.push(calculateRentention(month, monthIndex, months.length, drivers));
	});
	fs.writeFileSync(util.format("./result/retention.%s.csv", curMonth), carRetentionResult.concat([""]).concat(driverRetentionResult).join("\n"));
	console.log("===> Retention done <===");
}

function calculateRentention(month, monthIndex, maxIndex, map) {
	var result = [month];
	var toCompareIndex = monthIndex + 1;
	while(toCompareIndex <= maxIndex) {
		var numInMonth = 0, numInComparedMonth = 0;
		Object.keys(map).forEach(function(key){
			var array = map[key];
			if(array[monthIndex]) {
				++numInMonth;
				if(array[toCompareIndex]) {
					++numInComparedMonth;
				}
			}
		});
		result.push((numInComparedMonth/numInMonth).toFixed(4));
		++toCompareIndex;
	}
	return result.join();
}

function writeJSON() {
	fs.writeFileSync("./json/drivers.json", JSON.stringify(drivers));
	fs.writeFileSync("./json/driversTier1.json", JSON.stringify(driversTier1));
	fs.writeFileSync("./json/driversTier2.json", JSON.stringify(driversTier2));
	fs.writeFileSync("./json/driversTier3.json", JSON.stringify(driversTier3));
	fs.writeFileSync("./json/cars.json", JSON.stringify(cars));
	fs.writeFileSync("./json/carsTier1.json", JSON.stringify(carsTier1));
	fs.writeFileSync("./json/carsTier2.json", JSON.stringify(carsTier2));
	fs.writeFileSync("./json/carsTier3.json", JSON.stringify(carsTier3));
}

function fillZero(map) {
	Object.keys(map).forEach(function(key){
		if(map[key].length < numOfZerosToFill) {
			console.log("wrong length");
		}
		if(map[key].length < numOfZerosToFill + 1) {
			map[key].push(0);
		}
	});
}

function readFile() {
	var file = files.shift();
	if(!file) {
		console.log("==== Read file done ====");
		fillZero(cars);
		fillZero(carsTier1);
		fillZero(carsTier2);
		fillZero(carsTier3);
		fillZero(drivers);
		fillZero(driversTier1);
		fillZero(driversTier2);
		fillZero(driversTier3);
		writeJSON();
		calculateMetrics();
		return;
	}
	var carMap = {}, driverMap = {};
	var captureDate = file.match(/\d{4}-\d{2}-\d{2}/)[0];
	var lr = new LineByLineReader(util.format("./%s/%s", curMonth, file));
	lr.on("error", function(error){
		console.log(error);
	});
	lr.on("line", function(line){
		var vals = line.split(",");
		if(vals.length != 9) {
			console.log(line);
			return;
		}
		var city = vals[1];
		var cityTier = findCityTier(city);
		var driverId = vals[4];
		var carId = vals[5];
		cityMap[cityTier][city] = 1;
		if(!carMap[carId]) {
			++sumActiveCar;
			switch(cityTier) {
				case "Tier1":++sumActiveCarTier1;break;
				case "Tier2":++sumActiveCarTier2;break;
				case "Tier3":++sumActiveCarTier3;break;
				default:break;
			}
			carMap[carId] = 1;
		}
		if(!driverMap[driverId]) {
			++sumActiveDriver;
			switch(cityTier) {
				case "Tier1":++sumActiveDriverTier1;break;
				case "Tier2":++sumActiveDriverTier2;break;
				case "Tier3":++sumActiveDriverTier3;break;
				default:break;
			}
			driverMap[driverId] = 1;
		}
		if(drivers[driverId] && drivers[driverId].length == numOfZerosToFill) {
			drivers[driverId].push(1);
		} else if(!drivers[driverId]) {
			drivers[driverId] = [];
			for(var i = 0; i < numOfZerosToFill; ++i) {
				drivers[driverId].push(0);
			}
			drivers[driverId].push(1);
		}
		if(cars[carId] && cars[carId].length == numOfZerosToFill) {
			cars[carId].push(1);
		} else if(!cars[carId]) {
			cars[carId] = [];
			for(var i = 0; i < numOfZerosToFill; ++i) {
				cars[carId].push(0);
			}
			cars[carId].push(1);
		}
		switch(cityTier) {
			case "Tier1":
				if(driversTier1[driverId] && driversTier1[driverId].length == numOfZerosToFill) {
					driversTier1[driverId].push(1);
				} else if(!driversTier1[driverId]) {
					driversTier1[driverId] = [];
					for(var i = 0; i < numOfZerosToFill; ++i) {
						driversTier1[driverId].push(0);
					}
					driversTier1[driverId].push(1);
				}
				if(carsTier1[carId] && carsTier1[carId].length == numOfZerosToFill) {
					carsTier1[carId].push(1);
				} else if(!carsTier1[carId]) {
					carsTier1[carId] = [];
					for(var i = 0; i < numOfZerosToFill; ++i) {
						carsTier1[carId].push(0);
					}
					carsTier1[carId].push(1);
				}
				break;
			case "Tier2":
				if(driversTier2[driverId] && driversTier2[driverId].length == numOfZerosToFill) {
					driversTier2[driverId].push(1);
				} else if(!driversTier2[driverId]) {
					driversTier2[driverId] = [];
					for(var i = 0; i < numOfZerosToFill; ++i) {
						driversTier2[driverId].push(0);
					}
					driversTier2[driverId].push(1);
				}
				if(carsTier2[carId] && carsTier2[carId].length == numOfZerosToFill) {
					carsTier2[carId].push(1);
				} else if(!carsTier2[carId]) {
					carsTier2[carId] = [];
					for(var i = 0; i < numOfZerosToFill; ++i) {
						carsTier2[carId].push(0);
					}
					carsTier2[carId].push(1);
				}
				break;
			case "Tier3":
				if(driversTier3[driverId] && driversTier3[driverId].length == numOfZerosToFill) {
					driversTier3[driverId].push(1);
				} else if(!driversTier3[driverId]) {
					driversTier3[driverId] = [];
					for(var i = 0; i < numOfZerosToFill; ++i) {
						driversTier3[driverId].push(0);
					}
					driversTier3[driverId].push(1);
				}
				if(carsTier3[carId] && carsTier3[carId].length == numOfZerosToFill) {
					carsTier3[carId].push(1);
				} else if(!carsTier3[carId]) {
					carsTier3[carId] = [];
					for(var i = 0; i < numOfZerosToFill; ++i) {
						carsTier3[carId].push(0);
					}
					carsTier3[carId].push(1);
				}
				break;
			default:
				break;
		}
	});
	lr.on("end", function(){
		console.log("==> Got %s <===", file);
		setTimeout(readFile, 0);
	});
}

readFile();