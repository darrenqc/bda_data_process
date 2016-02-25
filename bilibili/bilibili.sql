# set variable for updateTime
SET @updateTime = '2016-01-26';
SET @uploadTime = '2016-01-01';
########### For video ###########
# # of Available Videos
SELECT videoCategory, COUNT(videoID) FROM bilibili_video WHERE updateTime = @updateTime GROUP BY videoCategory ORDER BY FIELD(videoCategory, "动画", "番剧", "音乐", "舞蹈", "游戏", "科技", "娱乐", "鬼畜", "电影", "电视剧", "时尚");

# # of New Videos 
SELECT videoCategory, SUM(IF(uploadTime >= @uploadTime, 1, 0)) FROM bilibili_video WHERE updateTime = @updateTime GROUP BY videoCategory ORDER BY FIELD(videoCategory, "动画", "番剧", "音乐", "舞蹈", "游戏", "科技", "娱乐", "鬼畜", "电影", "电视剧", "时尚");

# # of Cumulative Videos
SELECT videoCategory, COUNT(videoID) FROM bilibili_video GROUP BY videoCategory ORDER BY FIELD(videoCategory, "动画", "番剧", "音乐", "舞蹈", "游戏", "科技", "娱乐", "鬼畜", "电影", "电视剧", "时尚");

# # of Cumulative Views
SELECT videoCategory, SUM(watch) FROM bilibili_video WHERE updateTime = @updateTime GROUP BY videoCategory ORDER BY FIELD(videoCategory, "动画", "番剧", "音乐", "舞蹈", "游戏", "科技", "娱乐", "鬼畜", "电影", "电视剧", "时尚");

# # of Screen Shot Comments
SELECT videoCategory, SUM(dm) FROM bilibili_video WHERE updateTime = @updateTime GROUP BY videoCategory ORDER BY FIELD(videoCategory, "动画", "番剧", "音乐", "舞蹈", "游戏", "科技", "娱乐", "鬼畜", "电影", "电视剧", "时尚");


########### For uploaders ###########
# # of Cumulative Uploaders in the month
SELECT COUNT(1) FROM bilibili_uploader;

# # of Active Uploaders
SELECT COUNT(1) FROM bilibili_uploader WHERE updateTime = @updateTime;

# # of New Uploaders
SELECT COUNT(1) FROM bilibili_uploader WHERE ADDTIME = @updateTime;