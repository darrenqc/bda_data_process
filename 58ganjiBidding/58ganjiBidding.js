var fs = require("fs"),
    util = require("util"),
    mysql = require("mysql"),
    crypto = require("crypto"),
    moment = require("moment"),
    logger = require("winston"),
    childProcess = require('child_process'),
    env = process.env.NODE_ENV || "development",
    config = require("../../config.json")[env].classifieds;

// config = {
//     "database":"bdadata",
//     "user":"root",
//     "password":"xiaokang2015",
//     "host":"192.168.98.213",
//     "connectionLimit":10
// };

connection = mysql.createConnection(config);

connection.connect();

var date = moment().add(-1, "d").format("YYYY-MM-DD"), month = moment().add(-1, "d").format("YYYY-MM");
var inputDate = process.argv.splice(2)[0];
if(inputDate) {
    date = moment(inputDate, "YYYY-MM-DD").format("YYYY-MM-DD");
    month = moment(inputDate, "YYYY-MM-DD").format("YYYY-MM");
}
var resultFile = util.format("../../result/58ganji/58.ganji.bidding.%s.csv", date);
var merchantPostFile = util.format("../../result/58ganji/58.ganji.merchantpost.%s.csv", date);
if(!fs.existsSync("../../result/58ganji/")) {
    fs.mkdirSync("../../result/58ganji/");
}
fs.writeFileSync(resultFile, "\ufeff58/Ganji,抓取日期,城市,一级目录,二级目录,三级目录,精准推广信息条数,非会员精准推广信息条数,置顶推广信息条数,非会员置顶推广信息条数,会员信息条数,付费商家数量\n");
fs.writeFileSync(merchantPostFile, "\ufeff平台,版块,mid,商户名称,是否会员,发帖数,加精贴数,置顶贴数,日期\n");
// merchant数量结果文件 -----> "\ufeffmid,城市,是否会员,日期\n"
// merchant发帖数结果文件 -----> "\ufeff版块,mid,发帖数,日期\n"

var queryPattern = "select createdDate '抓取日期', secondary '二级目录', tertius '三级目录', city '城市', sum(if(tt=2 or tt=3,1,0)) '精准', sum(if(tt=2,1,0)) '非会员精准', sum(if(tt=8 or tt=9 or tt=4 or tt=5,1,0)) '置顶', sum(if(tt=4 or tt=8,1,0)) '非会员置顶', sum(if(tt=1 or tt=3 or tt=9,1,0)) '会员发帖数', count(distinct(mid)) '商家' from %s where createdDate = '%s' group by createdDate, secondary, tertius, city";

var tasks = [
    {platform:"gj",category:"job"},
    {platform:"gj",category:"rent"},
    {platform:"gj",category:"secondaryhouse"},
    {platform:"gj",category:"service"},
    {platform:"gj",category:"usedcar"},
    {platform:"wuba",category:"job"},
    {platform:"wuba",category:"rent"},
    {platform:"wuba",category:"secondaryhouse"},
    {platform:"wuba",category:"service"},
    {platform:"wuba",category:"usedcar"}
];

function doDaily() {
    var task = tasks.shift();
    if(!task) {
        console.log("Daily job done.");
        setTimeout(doMerchantPost, 0);
        return;
    }
    var tableName = util.format("classifiedsposts_%s_%s", task.platform, task.category);
    connection.query(util.format(queryPattern, tableName, date), function(error, rows){
        if(error) {
            console.log(error);
            return;
        }
        var toWrite = [];
        if(rows.length) {
            var platform = task.platform == "gj" ? "Ganji" : "58";
            var firstLevelCategory;
            switch(task.category) {
                case "job": firstLevelCategory = "招聘";break;
                case "rent": firstLevelCategory =   "租房";break;
                case "secondaryhouse": firstLevelCategory = "二手房";break;
                case "service": firstLevelCategory = "本地服务";break;
                case "usedcar": firstLevelCategory = "二手车";break;
                default: firstLevelCategory = "N/A";break;
            }
            rows.forEach(function(record){
                toWrite.push([platform,moment(record["抓取日期"]).format("YYYY-MM-DD"),record["城市"],firstLevelCategory,record["二级目录"],
                    record["三级目录"],record["精准"],record["非会员精准"],record["置顶"],record["非会员置顶"],record["会员发帖数"],record["商家"]].join(","));
            });
            fs.appendFileSync(resultFile, toWrite.join("\n")+"\n");
        }
        console.log("Got Daily %s-%s", task.platform, task.category);
        setTimeout(doDaily, 0);
    });
}

var merchantPostTasks = [
    {platform:"gj",category:"job"},
    // {platform:"gj",category:"rent"},
    // {platform:"gj",category:"secondaryhouse"},
    {platform:"gj",category:"service"},
    {platform:"gj",category:"usedcar"},
    {platform:"wuba",category:"job"},
    {platform:"wuba",category:"rent"},
    {platform:"wuba",category:"secondaryhouse"},
    {platform:"wuba",category:"service"},
    {platform:"wuba",category:"usedcar"}
];

function doMerchantPost() {
    var task = merchantPostTasks.shift();
    if(!task) {
        console.log("Merchant post job done.");
        setTimeout(doMonth, 0);
        return;
    }
    var tableName = util.format("classifiedsposts_%s_%s", task.platform, task.category);
    connection.query(util.format("select mid, mname, count(1) as 'count', sum(if(tt=2 or tt=3,1,0)) as 'precision', sum(if(tt>3,1,0)) as 'top', if(sum(if(tt=2 or tt=4 or tt=8,0,1))=0,'false','true') as 'isMember' from %s where createdDate = '%s' group by mid", tableName, date), function(error, rows){
        if(error) {
            console.log(error);
            return;
        }
        var toWrite = [];
        if(rows.length) {
            var platform = task.platform == "gj" ? "Ganji" : "58";
            var firstLevelCategory;
            switch(task.category) {
                case "job": firstLevelCategory = "招聘";break;
                case "rent": firstLevelCategory = "租房";break;
                case "secondaryhouse": firstLevelCategory = "二手房";break;
                case "service": firstLevelCategory = "本地服务";break;
                case "usedcar": firstLevelCategory = "二手车";break;
                default: firstLevelCategory = "N/A";break;
            }
            rows.forEach(function(record){
                toWrite.push([
                        platform,
                        firstLevelCategory,
                        record.mid,
                        record.mname.replace(/,/g, ""),
                        record.isMember,
                        record.count,
                        record.precision,
                        record.top,
                        date
                    ].join());
            });
            fs.appendFileSync(merchantPostFile, toWrite.join("\n")+"\n");
        }
        console.log("Got Merchant post %s-%s", task.platform, task.category);
        setTimeout(doMerchantPost, 0);
    });
}

var merchantTasks = [
    {platform:"gj",category:"job",column:"mid"},
    //// {platform:"gj",category:"rent"},
    //// {platform:"gj",category:"secondaryhouse"},
    {platform:"gj",category:"service",column:"mid"},
    {platform:"gj",category:"usedcar",column:"mid"},
    {platform:"wuba",category:"job",column:"mid"},
    {platform:"wuba",category:"rent",column:"mid"},
    {platform:"wuba",category:"secondaryhouse",column:"mid"},
    {platform:"wuba",category:"service",column:"mid"},
    {platform:"wuba",category:"usedcar",column:"mid"}
];

var hash = function(str){
    var hashFn = crypto.createHash('md5');
    hashFn.update(str);
    return hashFn.digest('hex');// to 32bit hex string
}

function doMonth() {
    var task = merchantTasks.shift();
    if(!task) {
        console.log("Monthly job done.");
        setTimeout(dumpDelete, 0);
        // connection.end(function (err) {
        //     // all connections in the pool have ended
        //     if(err) logger.error(err);
        // });
        return;
    }
    var tableName = util.format("classifiedsposts_%s_%s", task.platform, task.category);
    var resultFile = util.format("../../result/58ganji/%s.%s.merchant.%s.csv", task.platform, task.category, month);
    var cache = {};
    if(fs.existsSync(resultFile)) {
        fs.readFileSync(resultFile).toString().split("\n").forEach(function(line){
            var split = line.split(",");
            if(split.length >= 4) {
                var key = split.slice(0, 3).join();
                cache[key] = null;
            }
        });
    }
    connection.query(util.format("select distinct(%s) as mid, mname, city, if(tt=1 or tt=3 or tt=5, 'true', 'false') as isMember from %s where createdDate = '%s' and %s is not null and %s != ''", task.column, tableName, date, task.column, task.column), function(error, rows) {
        if(error) {
            console.log(error);
            return;
        }
        var toWrite = [];
        rows.forEach(function(row){
            var key = [row.mid,row.city,row.isMember].join();
            if(!(key in cache)) {
                toWrite.push(key+","+row.mname.replace(/,/g, "")+","+date);
            }
        });
        if(toWrite.length) {
            var buffer = toWrite.splice(0, 10000);
            while(buffer.length) {
                fs.appendFileSync(resultFile, buffer.join("\n")+"\n");
                buffer = toWrite.splice(0, 10000);
            }
        }
        console.log("Got Monthly %s-%s", task.platform, task.category);
        setTimeout(doMonth, 0);
    });
}

var table = [
    "classifiedsposts_gj_job",
    "classifiedsposts_gj_rent",
    "classifiedsposts_gj_secondaryhouse",
    "classifiedsposts_gj_service",
    "classifiedsposts_gj_usedcar",
    "classifiedsposts_wuba_job",
    "classifiedsposts_wuba_rent",
    "classifiedsposts_wuba_secondaryhouse",
    "classifiedsposts_wuba_service",
    "classifiedsposts_wuba_usedcar"
];
var tindex = 0;

function dumpDelete(){
    // var dumpcmd = "mysqldump -h"+config.host+" -u"+config.user+" -p"+config.password+" "+config.database
    //     +" "+table[tindex]+" -t -e --set-gtid-purged=OFF --where \"createdDate='"+ date
    //     +"'\" --max_allowed_packet=1073741824 --net_buffer_length=16384>../../result/58ganji/"+table[tindex]+"_"+date+".sql";
    var dumpcmd = "mysqldump -h"+config.host+" -u"+config.user+" -p"+config.password+" "+config.database
        +" "+table[tindex]+" -t -e --where \"createdDate='"+ date
        +"'\" --max_allowed_packet=1073741824 --net_buffer_length=16384>../../result/58ganji/"+table[tindex]+"_"+date+".sql";
    logger.info(dumpcmd);
    // tindex++;
    childProcess.exec(dumpcmd, function (error, stdout, stderr) {
        if(error) {
            logger.error(error);
            connection.end();
            logger.error("=====Job done with error=====");
            return;
        }
        logger.info("finish dump "+table[tindex]);
        var sql = "delete from "+table[tindex]+" where createdDate='"+date+"';";
        logger.info(sql);
        connection.query(sql, function(err){
            if(err) logger.error(err);
            logger.info("finish delete "+table[tindex]);
            tindex++;
            if (tindex<table.length) {              
                dumpDelete();
            } else{
                logger.info("finish dump & delete");
                connection.end(function (err) {
                    // all connections in the pool have ended
                    if(err) logger.error(err);
                });
            }
        });
        
    });
}

doDaily();
// doMonth();
