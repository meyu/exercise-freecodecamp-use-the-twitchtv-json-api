var time2Update = 10; //欲多久定期更新頻道狀態(秒)
$(document).ready(function() {
	getChannels();
	setInterval(function() {
		getChannels();
	}, time2Update * 1000);
	setSideNav();
	setModal();
});

//////////////////////////////////////////////
// 資料結繫
//////////////////////////////////////////////
var urlAPI = "https://api.twitch.tv/kraken/";
var clientID = "prfmhk4lu5x7jvvo3nvpow5sptsls0";
var channelON = []; //儲存在線頻道用
var channelOFF = []; //儲存離線頻道用
var d4Channels = [
	"freecodecamp",
	"nintendo",
	"nintendouk",
	"nintendofr",
	"squareenix",
	"konami",
	"ubisoft",
	"capcomfighters",
	"capcomunity",
	"microsoftstudios",
	"easportsfifa",
	"bandainamcous",
	"riotgamesjp",
	"gamesdonequick",
	"nalcs1",
	"nintendopals",
	"mario_lab",
	"zeldadungeon",
	"finalfantasyxiv",
	"clintstevens",
	"aurateur",
	"aimbotcalvin",
	"goldglove",
	"disguisedtoasths",
	"jcobplay",
	"ESL_SC2",
	"OgamingSC2",
	"cretetion",
	"RobotCaleb",
	"demoForError"
];

//結繋在線頻道，採用 Twitch Get Stream by User 方案 (https://dev.twitch.tv/docs/v5/reference/streams/#get-stream-by-user)
function bindOnlineChannel(channel) {
	$.getJSON(urlAPI + "streams/" + channel + "?client_id=" + clientID, function(
		data
	) {
		if (data.stream !== null) {
			// 在線者，若頁面上未顯示，則進行排版
			var isThere = checkStatus(channel, true);
			if (!isThere[0]) {
				channelON.push(channel);
				var c = data.stream.channel;
				// 後續上線者置後
				$("#online_sec").append(
					cardHTML(c.name, c.display_name, c.status, c.logo, c.url, true)
				);
			}
		} else {
			// 離線者，進行離線排版
			bindOfflineChannel(channel);
		}
	});
}

//結繋離線頻道，採用 Twitch Get Channel by ID 方案 (https://dev.twitch.tv/docs/v5/reference/channels/#get-channel-by-id)
function bindOfflineChannel(channel) {
	var isThere = checkStatus(channel, false);
	// 若頁面上未顯示，再進行排版
	if (!isThere[1]) {
		channelOFF.push(channel);
		$.getJSON(urlAPI + "channels/" + channel + "?client_id=" + clientID, function(
			c
		) {
			// 後續離線者置前
			$(
				cardHTML(c.name, c.display_name, c.status, c.logo, c.url, false)
			).insertAfter("#offline_sec");
		}).fail(function() {
			// 不存在或停用之頻道
			$(cardHTML(channel, channel, "channel doesn't exist", "", "", false)).insertAfter("#offline_sec");
		});
	}
}
// 結繫頻道搜尋，採用 Twitch Search Channels 方案 (https://dev.twitch.tv/docs/v5/reference/search/#search-channels)
var queryLimit = 15; //限制結果數量
function searchChannel(inputKeyword) {
	$.getJSON(
		urlAPI +
			"search/channels?query=" +
			inputKeyword +
			"&client_id=" +
			clientID +
			"&limit=" +
			queryLimit,
		function(data) {
			var html = "";
			$("#search_Result").empty();
			$.each(data.channels, function(i, c) {
				html += cartHTML(
					c.name,
					c.display_name,
					c.status,
					c.logo,
					c.url,
					c.followers,
					d4Channels.includes(c.name)
				);
			});
			$("#cart_sec").html(html);
		}
	);
}

//////////////////////////////////////////////
// 資料操作
//////////////////////////////////////////////

// 頻道取得。由於API一次僅能取得一個頻道，故需逐筆進行
function getChannels() {
	$.each(d4Channels, function(i, val) {
		bindOnlineChannel(val);
	});
}

// 頻道檢查
function checkStatus(channel, isOnline) {
	// 判斷頻道原先之在/離線狀態
	var hasOn = channelON.includes(channel);
	var hasOff = channelOFF.includes(channel);
	// 狀態有異動者，移除原先資訊
	if ((hasOn && !hasOff && !isOnline) || (!hasOn && hasOff && isOnline)) {
		rmvChannel(channel, isOnline ? "off" : "on");
	}
	// 回傳原先之狀態
	return [hasOn, hasOff];
}

// 頻道查詢
function doSearch() {
	if (keyword.val().trim().length > 0) {
		searchChannel(keyword.val());
	} else {
		$("#search_Result").html("");
	}
}

// 設定訊息顯示持續時間(秒)，採用 Materialize Toasts 方案 (http://materializecss.com/dialogs.html)
var alertSecond = 5;

// 頻道新增
function addChannel(channel) {
	d4Channels.push(channel);
	doSearch();
	getChannels();
	Materialize.toast(channel + " added", alertSecond * 1000);
}

// 頻道移除
function rmvChannel(channel, all0on0off) {
	$("#" + channel).remove();
	var msg = "";
	if (all0on0off == "all") {
		// 移除
		msg = " removed";
		d4Channels = jQuery.grep(d4Channels, function(val) {
			return val !== channel;
		});
	} else if (all0on0off == "on") {
		// 改為離線
		msg = " offlined";
		channelOFF.unshift(channel);
		channelON = jQuery.grep(channelON, function(val) {
			return val !== channel;
		});
	} else if (all0on0off == "off") {
		// 改為在線
		msg = " onlined";
		channelON.unshift(channel);
		channelOFF = jQuery.grep(channelOFF, function(val) {
			return val !== channel;
		});
	}
	Materialize.toast(channel + msg, alertSecond * 1000);
}

//////////////////////////////////////////////
// 動作觸發
//////////////////////////////////////////////

// 觸發即時輸入
var keyword = $("#search_Input");
keyword.on("input", function() {
	doSearch();
});

// 進入編輯模式
$("#editMode").click(function(event) {
	$("." + doDeleteBotton).toggle();
});

// 頁面點擊觸發
$(document).click(function(e) {
	var el = $(e.target);
	// 離開編輯模式
	if (el.attr("id") !== "editMode" && !el.hasClass(doDeleteBotton)) {
		$("." + doDeleteBotton).hide();
	}
	// 執行頻道移除
	if (el.hasClass(doDeleteBotton)) {
		rmvChannel(el.parent().parent().attr("id"), "all");
	}
	// 執行頻道新增
	if (el.hasClass(doAddeBotton)) {
		addChannel(el.parent().parent().data("channel"));
	}
});

//////////////////////////////////////////////
// 排版功能
//////////////////////////////////////////////

// 設定搜尋面版。採用 Materialize SideNav 方案 (http://materializecss.com/side-nav.html)
function setSideNav() {
	$(".pooh").sideNav({
		menuWidth: 400,
		edge: "right",
		closeOnClick: false,
		draggable: true
	});
}

// 設定 Modal 元件。採用 Materialize Bottom Sheet Modals 方案 (http://materializecss.com/modals.html)
// 客製化 Modal 觸發動作，使能顯示 trigger 所指定之 data-url 內容
function setModal() {
	$(".modal").modal({
		ready: function(modal, trigger) {
			var iframe = document.getElementById("myIframe");
			var url = trigger.data("url");
			if (url.length !== "") {
				iframe.src = url;
				showIframe(iframe);
				$("#myGist").hide();
			}
		},
		complete: function() {
			$("#myIframe").hide();
			$("#myGist").show();
		}
	});
}

// 在 iframe 完成載入後，再顯示 iframe，並隱藏 progress bar。
// 方案參考：https://www.nczonline.net/blog/2009/09/15/iframes-onload-and-documentdomain/
function showIframe(iframe) {
	$(".progress").show();
	if (iframe.attachEvent) {
		iframe.attachEvent("onload", function() {
			iframe.style.display = "block";
			$(".progress").hide();
		});
	} else {
		iframe.onload = function() {
			iframe.style.display = "block";
			$(".progress").hide();
		};
	}
}

// 設定新增/刪除的按鈕名稱
var doDeleteBotton = "rmvBotton";
var doAddeBotton = "addBotton";

// 頻道卡片，採用 Materialize Card 方案 (http://materializecss.com/cards.html)
// 卡片內嵌有刪除按鈕
var autoplay = "false";
var muted = "false";
var urlEmbed =
	"https://player.twitch.tv/?autoplay=" +
	autoplay +
	"&muted=" +
	muted +
	"&channel=";
function cardHTML(channel, title, content, logoURL, sourceURL, isOnline) {
	// 設定卡片大小
	var layout = isOnline ? "s12 m6 l4" : "s12 m4 l3 xl3";
	// 設定狀態標示
	var line = isOnline ? "online" : "offline";
	var color = isOnline ? "teal" : "grey";
	if (sourceURL == "") {
		line = "error";
		color = "red lighten-1";
	}
	var badge =
		'<span  data-badge-caption="" class="new badge ' + color + '">' + line + "</span>";
	// 設定影片嵌入，採用 Twitch Embedding Video and Clips 方案 (https://dev.twitch.tv/docs/v5/guides/embed-video/)
	var iframeDIV =
		'<div class="live">' +
		'<iframe class="embedChannel" src="' +
		urlEmbed +
		channel +
		'"' +
		" allowfullscreen></iframe>" +
		"</div>";
	// 設定移除按鈕
	var removeBotton = '<a class="btn-floating red ' + doDeleteBotton + '">x</a>';
	// 設定頻道文字訊息
	var contentDIV =
		'<div class="card-content">' +
		'<p class="flow-text">' +
		title +
		"</p>" +
		'<p class="grey-text truncate">' +
		content +
		"</p>" +
		"</div>";
	// 設定卡片內容、底圖、連結
	var cardDIV =
		'<div class="card" style="background-image:url(\'' +
		logoURL +
		"');\">" +
		removeBotton +
		badge +
		'<a' + (sourceURL == '' ? "" : ' target="_blank" href="' + sourceURL + '"') +
		'>' +
		contentDIV +
		"</a>" +
		"</div>";
	// 輸出
	return (
		'<div id="' +
		channel +
		'" class="col ' +
		layout +
		'">' +
		cardDIV +
		(isOnline ? iframeDIV : "") +
		"</div>"
	);
}

// 頻道搜尋結果卡片，採用 Materialize Card 方案 (http://materializecss.com/cards.html)
// 卡片內嵌有新增按鈕
function cartHTML(
	channel,
	title,
	content,
	logoURL,
	sourceURL,
	followers,
	isInList
) {
	// 設定卡片大小
	var layout = "s12";
	// 設定狀態標示
	var badge =
		'<span data-badge-caption="" class="new badge deep-purple lighten-4">' +
		followers +
		" followers</span>";
	// 設定新增按鈕，已在個人清單者鎖定之
	var addBotton =
		'<a class="btn-floating waves-effect waves-light green left ' +
		doAddeBotton +
		(isInList ? " disabled" : "") +
		'">' +
		(isInList ? "✔" : "+") +
		"</a>";
	// 設定頻道文字資訊
	var contentDIV =
		'<div class="card-content">' +
		'<p class="flow-text">' +
		title +
		"</p>" +
		'<p class="grey-text truncate" style="padding-left:25px;">' +
		content +
		"</p>" +
		"</div>";
	// 設定卡片內容、底圖、連結
	var cardDIV =
		'<div class="card" style="background-image:url(\'' +
		logoURL +
		"');\">" +
		addBotton +
		badge +
		'<a target="_blank" href="' +
		sourceURL +
		'">' +
		contentDIV +
		"</a>" +
		"</div>";
	// 輸出
	return (
		'<div data-channel="' +
		channel +
		'" class="col ' +
		layout +
		'">' +
		cardDIV +
		"</div>"
	);
}