/*
 *
 * NOTE: The client side of hack.chat is currently in development,
 * a new, more modern but still minimal version will be released
 * soon. As a result of this, the current code has been deprecated
 * and will not actively be updated.
 *
*/

// initialize markdown engine
var markdownOptions = {
	html: false,
	xhtmlOut: false,
	breaks: true,
	langPrefix: '',
	linkify: true,
	linkTarget: '_blank" rel="noreferrer',
	typographer:  true,
	quotes: `""''`,

	doHighlight: true,
	highlight: function (str, lang) {
		if (!markdownOptions.doHighlight || !window.hljs) { return ''; }

		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (__) {}
		}

		try {
			return hljs.highlightAuto(str).value;
		} catch (__) {}

		return '';
	}
};

var md = new Remarkable('full', markdownOptions);

// image handler
var allowImages = true;
var imgHostWhitelist = [
	'i.imgur.com',
	'imgur.com',
	'postimg.cc', 'i.postimg.cc','postimages.org',    //Postimages
	'i.loli.net', 's2.loli.net',					// sm.ms
	's1.ax1x.com', 's2.ax1x.com', 'z3.ax1x.com', 's4.ax1x.com',     // imgchr.com
	'mrpig.eu.org',
	'share.lyka.pro',    //?lobby里的图片分享链接
	'i.gyazo.com',    //AfK_Bot的图片链接
	'img.thz.cool',    //Maggie的图床
]

function getDomain(link) {
	var a = document.createElement('a');
	a.href = link;
	return a.hostname;
}

function isWhiteListed(link) {
	return imgHostWhitelist.indexOf(getDomain(link)) !== -1;
}

md.renderer.rules.image = function (tokens, idx, options) {
	var src = Remarkable.utils.escapeHtml(tokens[idx].src);

	if (isWhiteListed(src) && allowImages) {
		var imgSrc = ' src="' + Remarkable.utils.escapeHtml(tokens[idx].src) + '"';
		var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
		var alt = ' alt="' + (tokens[idx].alt ? Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(Remarkable.utils.unescapeMd(tokens[idx].alt))) : '') + '"';
		var suffix = options.xhtmlOut ? ' /' : '';
		var scrollOnload = isAtBottom() ? ' onload="window.scrollTo(0, document.body.scrollHeight)"' : '';
		return '<a href="' + src + '" target="_blank" rel="noreferrer"><img' + scrollOnload + imgSrc + alt + title + suffix + '></a>';
	}

  return '<a href="' + src + '" target="_blank" rel="noreferrer">' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(src)) + '</a>';
};

md.renderer.rules.link_open = function (tokens, idx, options) {
	var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
  var target = options.linkTarget ? (' target="' + options.linkTarget + '"') : '';
  return '<a rel="noreferrer" onclick="return verifyLink(this)" href="' + Remarkable.utils.escapeHtml(tokens[idx].href) + '"' + title + target + '>';
};

md.renderer.rules.text = function(tokens, idx) {
	tokens[idx].content = Remarkable.utils.escapeHtml(tokens[idx].content);

	if (tokens[idx].content.indexOf('?') !== -1) {
		tokens[idx].content = tokens[idx].content.replace(/(^|\s)(\?)\S+?(?=[,.!?:)]?\s|$)/gm, function(match) {
			var channelLink = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(match.trim()));
			var whiteSpace = '';
			if (match[0] !== '?') {
				whiteSpace = match[0];
			}
			return whiteSpace + '<a href="' + channelLink + '" target="_blank">' + channelLink + '</a>';
		});
	}

  return tokens[idx].content;
};

md.use(remarkableKatex);

function verifyLink(link) {
	var linkHref = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(link.href));
	if (linkHref !== link.innerHTML) {
		return confirm('注意，请确定这是您要打开的链接：' + linkHref);
	}

	return true;
}

var verifyNickname = function (nick) {
	return /^[a-zA-Z0-9_]{1,24}$/.test(nick);
}

var frontpage = [
	'# 小张客户端',
	'---',
	"欢迎使用小张客户端在HackChat上聊天，HackChat是一个小型的、无干扰的网络聊天室。",
	"您可以通过网址来创建、加入或分享频道。修改网址中问号后面的内容即可创建或加入频道。",
	"例如，要创建或者加入名为“your-channel”的频道，可以把网址改为："+document.URL+'?your-channel',
	"HackChat不会公布频道列表，因此可以使用秘密的频道名称进行私人讨论。",
	"---",
	"以下是预设频道：",
	"唐人街 → ?your-channel ?china ?chinese ←",
	"外国人聚集地 → ?programming ←",
	"这是一个为您随机生成的频道： ?" + Math.random().toString(36).substr(2, 8),
	"---",
	"MarkDown和LaTeX格式：",
	"把LaTeX内容写在两个美元符号之间即可使用它，效果：$\\zeta(2) = \\pi^2/6$。写在四个美元符号之间可以把它放在屏幕的中间，例如：$$\\int_0^1 \\int_0^1 \\frac{1}{1-xy} dx dy = \\frac{\\pi^2}{6}$$",
	"要发送程序代码，请按照此格式发送：\\`\\`\\`语言 代码\\`\\`\\`",
	"---",
	"HackChat的仓库：https://github.com/hack-chat",
	"HackChat根据WTFPL和MIT开源许可证发布的服务器和web客户端。",
	"**注意：小张客户端不代表HackChat。**",
	"---",
	"没有聊天记录保存在HackChat服务器上。",
	"但是某些频道内的部分用户或机器人可能会保留聊天记录。",
	"---",
	"感谢您您使用小张客户端，该客户端由[小张软件](https://www.zhangsoft.cf/)编写，开源网址：",
	"https://github.com/MrZhang365/ZhangClient",
	"https://gitee.com/MrZhang365/zhang-client",
	"---",
	"友情链接：[聊天室历史书](https://book.paperee.guru/#/chatroom-history-book/) | [非官方 hack.chat wiki](https://hcwiki.netlify.app/) | [XChat](https://xq.kzw.ink/) | [TanChat](https://tanchat.fun/) | [小张的博客](https://blog.mrzhang365.cf/) | [纸片君ee的个人主页](https://paperee.guru) | [纸片君ee的博客](https://blog.paperee.guru/) | [Blaze的个人主页](https://blaze.sqj.repl.co/) | [Maggie的个人主页](https://thz.cool/)"
].join("\n");

function getConfig(){
	var xhr = new XMLHttpRequest()
	xhr.open('GET','https://onlineservice.zhangsoft.cf/zhangclient')
	xhr.onload = () => {
		if (xhr.status === 200){
			console.log('已获取数据')
			try{
				var data = JSON.parse(xhr.responseText)
			}catch(err){
				pushMessage({nick:'!',text:'小张软件云服务似乎未知错误，我们无法从服务器上获取到正确的信息。\n如果该问题反复出现，请及时联系：Xiao_Zhang_123@outlook.com\n感谢您的理解与支持！'})
				return
			}
			imgHostWhitelist = data.whiteList
			if (data.var > 1.5){
				pushMessage({nick:'*',text:'检测到您使用的并不是最新版客户端，您可以清除浏览器缓存并刷新来使用最新版客户端'})
			}
		}else{
			pushMessage({nick:'!',text:'无法连接到小张软件云服务，因此无法获取到最新配置，但您还是可以继续使用本客户端。\n如果此问题反复出现，请联系：Xiao_Zhang_123@outlook.com\n感谢您的理解与支持！'})
		}
	}
}

function $(query) {
	return document.querySelector(query);
}

function localStorageGet(key) {
	try {
		return window.localStorage[key]
	} catch (e) { }
}

function localStorageSet(key, val) {
	try {
		window.localStorage[key] = val
	} catch (e) { }
}

var ws;
var myNick = localStorageGet('my-nick') || '';
var myChannel = window.location.search.replace(/^\?/, '');
var lastSent = [""];
var lastSentPos = 0;
var afk = false
var autoAnswer = ''
var shield = JSON.parse(localStorageGet('shield') || JSON.stringify({shield:[]})).shield
var dev = false
var logMessages = false
var logs = ''

/** Notification switch and local storage behavior **/
var notifySwitch = document.getElementById("notify-switch")
var notifySetting = localStorageGet("notify-api")
var notifyPermissionExplained = 0; // 1 = granted msg shown, -1 = denied message shown

function saveShield(){
	localStorageSet('shield',JSON.stringify({shield:shield}))
}

function logMessage(msg){
	if (!logMessages){
		return    //别给我记录
	}
    var dat = new Date
	const time = formatTime(dat)
	logs += `[${time}]${msg}\n`
}

function shieldCheck(text){
	var i = 0
	for (i in shield){
		if (text.toLowerCase().indexOf(shield[i]) !== -1){
			return true
		}
	}
	return false
}

function getNick(){
	return myNick.split('#')[0]
}

// Initial request for notifications permission
function RequestNotifyPermission() {
	try {
		var notifyPromise = Notification.requestPermission();
		if (notifyPromise) {
			notifyPromise.then(function (result) {
				console.log("通知权限：" + result);
				if (result === "granted") {
					if (notifyPermissionExplained === 0) {
						pushMessage({
							cmd: "chat",
							nick: "*",
							text: "已获取通知权限。",
							time: null
						});
						notifyPermissionExplained = 1;
					}
					return false;
				} else {
					if (notifyPermissionExplained === 0) {
						pushMessage({
							cmd: "chat",
							nick: "!",
							text: "通知权限被拒绝，当有人@你时，你将不会收到通知。",
							time: null
						});
						notifyPermissionExplained = -1;
					}
					return true;
				}
			});
		}
	} catch (error) {
		pushMessage({
			cmd: "chat",
			nick: "!",
			text: "无法创建通知。",
			time: null
		});
		console.error("无法创建通知，您的浏览器可能不支持桌面通知。")
		console.error('详细信息：\n'+error)
		return false;
	}
}

// Update localStorage with value of checkbox
notifySwitch.addEventListener('change', (event) => {
	if (event.target.checked) {
		RequestNotifyPermission();
	}
	localStorageSet("notify-api", notifySwitch.checked)
})
// Check if localStorage value is set, defaults to OFF
if (notifySetting === null) {
	localStorageSet("notify-api", "false")
	notifySwitch.checked = false
}
// Configure notifySwitch checkbox element
if (notifySetting === "true" || notifySetting === true) {
	notifySwitch.checked = true
} else if (notifySetting === "false" || notifySetting === false) {
	notifySwitch.checked = false
}

/** Sound switch and local storage behavior **/
var soundSwitch = document.getElementById("sound-switch")
var notifySetting = localStorageGet("notify-sound")

// Update localStorage with value of checkbox
soundSwitch.addEventListener('change', (event) => {
	localStorageSet("notify-sound", soundSwitch.checked)
})
// Check if localStorage value is set, defaults to OFF
if (notifySetting === null) {
	localStorageSet("notify-sound", "false")
	soundSwitch.checked = false
}
// Configure soundSwitch checkbox element
if (notifySetting === "true" || notifySetting === true) {
	soundSwitch.checked = true
} else if (notifySetting === "false" || notifySetting === false) {
	soundSwitch.checked = false
}

// Create a new notification after checking if permission has been granted
function spawnNotification(title, body) {
	// Let's check if the browser supports notifications
	if (!("Notification" in window)) {
		console.error("该浏览器不支持桌面通知。");
	} else if (Notification.permission === "granted") { // Check if notification permissions are already given
		// If it's okay let's create a notification
		var options = {
			body: body,
			icon: "/favicon-96x96.png"
		};
		var n = new Notification(title, options);
	}
	// Otherwise, we need to ask the user for permission
	else if (Notification.permission !== "denied") {
		if (RequestNotifyPermission()) {
			var options = {
				body: body,
				icon: "/favicon-96x96.png"
			};
			var n = new Notification(title, options);
		}
	} else if (Notification.permission == "denied") {
		// At last, if the user has denied notifications, and you
		// want to be respectful, there is no need to bother them any more.
	}
}

function notify(args) {
	// Spawn notification if enabled
	if (notifySwitch.checked) {
		spawnNotification("?" + myChannel + "  —  " + args.nick, args.text)
	}

	// Play sound if enabled
	if (soundSwitch.checked) {
		var soundPromise = document.getElementById("notify-sound").play();
		if (soundPromise) {
			soundPromise.catch(function (error) {
				console.error("无法播放提示音\n错误信息：\n" + error);
			});
		}
	}
}

function join(channel) {
	ws = new WebSocket('wss://hack.chat/chat-ws');
	var wasConnected = false;

	ws.onopen = function () {
		var shouldConnect = true;
		if (!wasConnected) {
			if (location.hash) {
				myNick = location.hash.substr(1);
			} else {
				var newNick = prompt('请输入昵称：', myNick);
				if (newNick !== null) {
					myNick = newNick;
				} else {
					// The user cancelled the prompt in some manner
					shouldConnect = false;
				}
			}
		}

		if (myNick && shouldConnect) {
			localStorageSet('my-nick', myNick);
			send({ cmd: 'join', channel: channel, nick: myNick });
		}

		wasConnected = true;
	}

	ws.onclose = function () {
		if (wasConnected) {
			pushMessage({ nick: '!', text: "与服务器的连接被断开，正在重新连接..." });
		}

		window.setTimeout(function () {
			join(channel);
		}, 2000);
	}

	ws.onerror = function () {
		pushMessage({ nick:'!', text:`\
# :(
### 连接聊天室服务器时遇到问题，抱歉造成不便。
#### 可能的原因：
- 您的网络出现了问题
- 小张客户端出现了未知的错误
- HackChat服务器异常崩溃

#### 请尝试：
- 更换网络环境后再试
- 将此错误报告给：Xiao_Zhang_123@outlook.com ，然后换用HackChat[默认客户端](https://hack.chat/)
- 前往 [XChat](https://xq.kzw.ink/) 或 [TanChat](https://tanchat.fun/) 聊天

##### 抱歉对您造成不便，敬请谅解。` })
	}

	ws.onmessage = function (message) {
		var args = JSON.parse(message.data);
		var cmd = args.cmd;
		var command = COMMANDS[cmd];
		if (dev){
			pushMessage({nick:'*',text:message.data})
		}
		if (command) {
			command.call(null, args);
		}
	}
}

var COMMANDS = {
	chat: function (args) {
		if (ignoredUsers.indexOf(args.nick) >= 0) {
			return;
		}
		logMessage(`[${args.trip || ''}]${args.nick}：${args.text}`)
		if (shieldCheck(args.text)){
			console.log(`原信息：\n[${args.trip || ''}]${args.nick}：${args.text}`)
			args.text = '【已屏蔽】'
		}
		pushMessage(args);
	},

	info: function (args) {
		if (args.type !== 'whisper' && args.type !== 'invite'){
            logMessage(`[提示]${args.text}`)
		}
		if (!args.text.startsWith('New beta available at: https://beta.hack.chat/ or https://beta.hack.chat/?')){
			args.nick = '*';
			if (args.type === 'whisper' && typeof args.from === 'string'){
				var whisperList = args.text.split(' ')
				var whisperText = whisperList.slice(2).join(' ')
				if (shieldCheck(whisperText)){
					console.log(`原信息：\n[${args.trip || ''}]${args.text}`)
					args.text = `${whisperList[0]} ${whisperList[1]} 【已屏蔽】`
				}
			}
			
			if (args.text == 'You have been denied access to that channel and have been moved somewhere else. Retry later or wait for a mod to move you.'){
				pushMessage({nick:'*',text:'【客户端信息】抱歉，您要加入的聊天室已经被锁定了，您已经被移动到了其他的地方。请可以尝试加入其他的聊天室。'})
				myChannel = '聊天室被锁定'
			}
			var infoList = args.text.split(' ')
			if (infoList[1] === 'is' && infoList[2] === 'now'){
				if (infoList[0] === getNick()){
					var nickList = myNick.split('#')
					nickList[0] = infoList[3]
					myNick = nickList.join('#')
					localStorageSet('my-nick',myNick)
				}
				args.text = `${infoList[0]} 更名为 ${infoList[3]}`
			}else if (infoList[0] === 'Banned'){
				infoList[0] = '已封禁'
				args.text = infoList.join(' ')
			}else if (infoList[0] === 'Kicked'){
				infoList[0] = '已踢出'
				args.text = infoList.join(' ')
			}
			pushMessage(args);
		}
	},

	emote: function (args) {
		logMessage(`[${args.trip || ''}]${args.text}`)
		if (shieldCheck(args.text)){
			console.log(`原信息：\n[${args.trip || ''}] @${args.nick} ${args.text}`)
			args.text = args.text.split(' ')[0] + ' 【已屏蔽】'
		}
		args.nick = '*';
		pushMessage(args);
	},

	warn: function (args) {
		args.nick = '!';
		pushMessage(args);
		logMessage(`[错误]${args.text}`)
	},

	onlineSet: function (args) {
		var nicks = args.nicks;

		usersClear();

		nicks.forEach(function (nick) {
			userAdd(nick);
		});
		pushMessage({ nick: '*', text: "在线的用户：" + nicks.join("，") })
		logMessage(`已加入聊天室 ?${myChannel}。在线的用户：${nicks.join("，")}`)
		pushMessage({nick:'*',text:'感谢您使用小张客户端，如果您愿意，您可以[资助我们](https://blog.mrzhang365.cf/images/WeChatPay.jpg)'})
		if (myChannel == 'programming'){
			pushMessage({nick:'*',text:'【客户端信息】您现在在外国人的聚集地，请不要说中文，否则可能会被辱骂或踢出聊天室。\n您也可以前往 ?your-channel 说中文。'})
		}else if (myChannel == 'your-channel' || myChannel == 'china' || myChannel == 'chinese'){
			pushMessage({nick:'*',text:'【客户端信息】您现在在中国人的聚集地，您可以在这里说中文。\n备注：这里偶尔会有外国人到访。'})
		}else if (myChannel == 'purgatory'){
			pushMessage({nick:'*',text:'您现在在“炼狱”，无法进行聊天。\n您可以前往 ?your-channel 聊天'})
		}
		if (localStorageGet('color') && localStorageGet('color') !== 'reset'){
			send({cmd:'changecolor',color:localStorageGet('color')})
		}
	},

	onlineAdd: function (args) {
		var nick = args.nick;

		userAdd(nick);

		if ($('#joined-left').checked) {
			pushMessage({ nick: '*', text: nick + " 加入了聊天室",trip:args.trip || '' });
			if (args.trip === 'bw7Gkq' || args.trip === 'c01PWj'){
				pushMessage({nick:'*',text:'【客户端信息】这位是小张客户端的制作者'})
			}
		}
		logMessage(`[${args.trip || ''}]${args.nick} 加入了聊天室`)
	},

	onlineRemove: function (args) {
		var nick = args.nick;

		userRemove(nick);

		if ($('#joined-left').checked) {
			pushMessage({ nick: '*', text: nick + " 离开了聊天室" });
		}
		logMessage(`${args.nick} 离开了聊天室`)
	},

	captcha: function (args) {
		var messageEl = document.createElement('div');
		messageEl.classList.add('info');


		var nickSpanEl = document.createElement('span');
		nickSpanEl.classList.add('nick');
		messageEl.appendChild(nickSpanEl);

		var nickLinkEl = document.createElement('a');
		nickLinkEl.textContent = '#';
		nickSpanEl.appendChild(nickLinkEl);

		var textEl = document.createElement('pre');
		textEl.style.fontSize = '4px';
		textEl.classList.add('text');
		textEl.innerHTML = args.text;

		messageEl.appendChild(textEl);
		$('#messages').appendChild(messageEl);

		window.scrollTo(0, document.body.scrollHeight);
		pushMessage({nick:'*',text:'【客户端信息】您要加入的聊天室已开启验证码，如果您看不清上面的验证码，请尝试：\n1. 打开Windows记事本\n2. 将上面的内容全部复制到记事本中\n3. 在本网页底部的输入框中输入您在记事本中看到的内容，然后按下回车\n\n如果验证码正确，那么您将会加入聊天室，否则会断开连接。'})
	}
}

function pushMessage(args) {
	// Message container
	var messageEl = document.createElement('div');

	if (
		typeof (myNick) === 'string' && (
			args.text.match(new RegExp('@' + getNick() + '\\b', "gi")) ||
			((args.type === "whisper" || args.type === "invite") && args.from)
		)
	) {
		notify(args);
	}
	if (afk && args.nick == getNick() && args.text !== '【自动回复】'+autoAnswer){
		$('#afk').onchange({target:{checked : false}})
		$('#afk').checked = false
	}
	if (args.cmd == 'chat' && args.text.match(new RegExp('@' + getNick() + '\\b', "gi")) && afk && args.text.indexOf('【自动回复】' === -1)){
		send({cmd:'chat',text:'【自动回复】'+autoAnswer})
	}
	messageEl.classList.add('message');

	if (verifyNickname(getNick()) && args.nick == getNick()) {
		messageEl.classList.add('me');
	} else if (args.nick == '!') {
		messageEl.classList.add('warn');
	} else if (args.nick == '*') {
		messageEl.classList.add('info');
	} else if (args.admin) {
		messageEl.classList.add('admin');
	} else if (args.mod) {
		messageEl.classList.add('mod');
	}

	// Nickname
	var nickSpanEl = document.createElement('span');
	nickSpanEl.classList.add('nick');
	messageEl.appendChild(nickSpanEl);

	if (args.trip) {
		var tripEl = document.createElement('span');

		if (args.mod || args.admin) {
			tripEl.textContent = String.fromCodePoint(11088) + " " + args.trip + " ";
		} else {
			tripEl.textContent = args.trip + " ";
		}

		tripEl.classList.add('trip');
		nickSpanEl.appendChild(tripEl);
	}

	if (args.nick) {
		var nickLinkEl = document.createElement('a');
		nickLinkEl.textContent = args.nick;

		if (args.color && /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(args.color)) {
			nickLinkEl.setAttribute('style', 'color:#' + args.color + ' !important');
			if (args.nick == getNick()){
				localStorageSet('color',args.color)
			}
		}else{
			if (args.nick == getNick()){
				localStorageSet('color','reset')
			}
		}

		nickLinkEl.onclick = function () {
			insertAtCursor("@" + args.nick + " ");
			$('#chatinput').focus();
		}
		nickLinkEl.oncontextmenu = function(e) {
			e.preventDefault();
			insertAtCursor(buildReplyText({nick:args.nick,trip:args.trip || ''},args.text))
			$('#chatinput').focus()
		}

		var date = new Date(args.time || Date.now());
		nickLinkEl.title = date.toLocaleString();
		nickSpanEl.appendChild(nickLinkEl);
	}

	// Text
	var textEl = document.createElement('p');
	textEl.classList.add('text');
	textEl.innerHTML = md.render(args.text);

	messageEl.appendChild(textEl);

	// Scroll to bottom
	var atBottom = isAtBottom();
	$('#messages').appendChild(messageEl);
	if (atBottom) {
		window.scrollTo(0, document.body.scrollHeight);
	}

	unread += 1;
	updateTitle();
}

function insertAtCursor(text) {
	var input = $('#chatinput');
	var start = input.selectionStart || 0;
	var before = input.value.substr(0, start);
	var after = input.value.substr(start);

	before += text;
	input.value = before + after;
	input.selectionStart = input.selectionEnd = before.length;

	updateInputSize();
}

//格式化时间
function formatTime(dat){
    //获取年月日，时间
    var year = dat.getFullYear();
    var mon = (dat.getMonth()+1) < 10 ? "0"+(dat.getMonth()+1) : dat.getMonth()+1;
    var data = dat.getDate()  < 10 ? "0"+(dat.getDate()) : dat.getDate();
    var hour = dat.getHours()  < 10 ? "0"+(dat.getHours()) : dat.getHours();
    var min =  dat.getMinutes()  < 10 ? "0"+(dat.getMinutes()) : dat.getMinutes();
    var seon = dat.getSeconds() < 10 ? "0"+(dat.getSeconds()) : dat.getSeconds();
				
    var newDate = year +"-"+ mon +"-"+ data +" "+ hour +":"+ min +":"+ seon;
    return newDate;
}

function buildReplyText(user,text){
	var replyText = `>`
	var i = 0
	const textList = text.split('\n')
	if (user.trip){
		replyText += `[${user.trip}] ${user.nick}：\n`
	}else{
		replyText += `${user.nick}：\n`
	}
	for (i = 0;i < 6;i+=1){
		if (!textList[i]){
			break
		}
		replyText += '>' + textList[i] + '\n'
	}
	if (i < textList.length){
		replyText += '>……\n\n'
	}else{
		replyText += '\n'
	}
	if (user.nick !== getNick()){
		replyText += `@${user.nick} `
	}
	return replyText
}

function send(data) {
	if (ws && ws.readyState == ws.OPEN) {
		ws.send(JSON.stringify(data));
	}
}

var windowActive = true;
var unread = 0;

window.onfocus = function () {
	windowActive = true;

	updateTitle();
}

window.onblur = function () {
	windowActive = false;
}

window.onscroll = function () {
	if (isAtBottom()) {
		updateTitle();
	}
}

function isAtBottom() {
	return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 1);
}

function updateTitle() {
	if (windowActive && isAtBottom()) {
		unread = 0;
	}

	var title;
	if (myChannel) {
		title = "?" + myChannel + ' - 小张客户端';
	} else {
		title = "hack.chat - 小张客户端";
	}

	if (unread > 0) {
		title = '(' + unread + ') ' + title;
	}

	document.title = title;
}

$('#footer').onclick = function () {
	$('#chatinput').focus();
}

$('#chatinput').onkeydown = function (e) {
	if (e.keyCode == 13 /* ENTER */ && !e.shiftKey) {
		e.preventDefault();

		// Submit message
		if (e.target.value != '') {
			var text = e.target.value;
			e.target.value = '';

			send({ cmd: 'chat', text: text });

			lastSent[0] = text;
			lastSent.unshift("");
			lastSentPos = 0;

			updateInputSize();
		}
	} else if (e.keyCode == 38 /* UP */) {
		// Restore previous sent messages
		if (e.target.selectionStart === 0 && lastSentPos < lastSent.length - 1) {
			e.preventDefault();

			if (lastSentPos == 0) {
				lastSent[0] = e.target.value;
			}

			lastSentPos += 1;
			e.target.value = lastSent[lastSentPos];
			e.target.selectionStart = e.target.selectionEnd = e.target.value.length;

			updateInputSize();
		}
	} else if (e.keyCode == 40 /* DOWN */) {
		if (e.target.selectionStart === e.target.value.length && lastSentPos > 0) {
			e.preventDefault();

			lastSentPos -= 1;
			e.target.value = lastSent[lastSentPos];
			e.target.selectionStart = e.target.selectionEnd = 0;

			updateInputSize();
		}
	} else if (e.keyCode == 27 /* ESC */) {
		e.preventDefault();

		// Clear input field
		e.target.value = "";
		lastSentPos = 0;
		lastSent[lastSentPos] = "";

		updateInputSize();
	} else if (e.keyCode == 9 /* TAB */) {
		// Tab complete nicknames starting with @

		if (e.ctrlKey) {
			// Skip autocompletion and tab insertion if user is pressing ctrl
			// ctrl-tab is used by browsers to cycle through tabs
			return;
		}
		e.preventDefault();

		var pos = e.target.selectionStart || 0;
		var text = e.target.value;
		var index = text.lastIndexOf('@', pos);

		var autocompletedNick = false;

		if (index >= 0) {
			var stub = text.substring(index + 1, pos).toLowerCase();
			// Search for nick beginning with stub
			var nicks = onlineUsers.filter(function (nick) {
				return nick.toLowerCase().indexOf(stub) == 0
			});

			if (nicks.length > 0) {
				autocompletedNick = true;
				if (nicks.length == 1) {
					insertAtCursor(nicks[0].substr(stub.length) + " ");
				}
			}
		}

		// Since we did not insert a nick, we insert a tab character
		if (!autocompletedNick) {
			insertAtCursor('\t');
		}
	}
}

function updateInputSize() {
	var atBottom = isAtBottom();

	var input = $('#chatinput');
	input.style.height = 0;
	input.style.height = input.scrollHeight + 'px';
	document.body.style.marginBottom = $('#footer').offsetHeight + 'px';

	if (atBottom) {
		window.scrollTo(0, document.body.scrollHeight);
	}
}

$('#chatinput').oninput = function () {
	updateInputSize();
}

updateInputSize();

/* sidebar */

$('#sidebar').onmouseenter = $('#sidebar').ontouchstart = function (e) {
	$('#sidebar-content').classList.remove('hidden');
	$('#sidebar').classList.add('expand');
	e.stopPropagation();
}

$('#sidebar').onmouseleave = document.ontouchstart = function (event) {
	var e = event.toElement || event.relatedTarget;
	try {
		if (e.parentNode == this || e == this) {
	     return;
	  }
	} catch (e) { return; }

	if (!$('#pin-sidebar').checked) {
		$('#sidebar-content').classList.add('hidden');
		$('#sidebar').classList.remove('expand');
	}
}

$('#clear-messages').onclick = function () {
	// Delete children elements
	var messages = $('#messages');
	messages.innerHTML = '';
}

$('#copy-logs').onclick = function () {
	navigator.clipboard.writeText(logs).then(function () {
		pushMessage({ nick: '*', text: "已将聊天记录拷贝到剪贴板上" })
	}, function () {
		pushMessage({ nick: '!', text: "抱歉，由于某些问题，我们无法拷贝聊天记录。" })
	});
}

$('#clear-logs').onclick = function(){
	logs = ''
	pushMessage({nick:'*',text:'已清除聊天记录'})
}

$('#shield-add').onclick = function () {
	var toAdd = prompt('请输入要屏蔽的内容：','').toLowerCase()
	if (!toAdd){
		pushMessage({nick:'!',text:'您输入的内容无效，请重试。'})
		return
	}
	if (shield.indexOf(toAdd) !== -1){
		pushMessage({nick:'!',text:'该内容已经被屏蔽了，无需重复操作。'})
		return
	}
	shield.push(toAdd)
	saveShield()
	pushMessage({nick:'*',text:`已为您屏蔽包含 “${toAdd}” 的内容`})
}
$('#shield-del').onclick = function () {
	var toDel = prompt('请输入要取消屏蔽的内容：','').toLowerCase()
	if (!toDel){
		pushMessage({nick:'!',text:'您输入的内容无效，请重试。'})
		return
	}
	if (shield.indexOf(toDel) === -1){
		pushMessage({nick:'!',text:'该内容没有被屏蔽，无需重复操作。'})
		return
	}
    shield = shield.filter((text) => text !== toDel)
	saveShield()
	pushMessage({nick:'*',text:`已为您取消屏蔽包含 “${toDel}” 的内容`})
}
$('#shield-clear').onclick = function () {
	if (!confirm('是否删除所有屏蔽内容？')){
		return
	}
	shield = []
	saveShield()
	pushMessage({nick:'*',text:`已为您删除所有屏蔽内容`})
}
$('#shield-list').onclick = function () {
	if (shield.length == 0){
		pushMessage({nick:'*',text:'目前没有屏蔽的内容'})
		return
	}
	var i = 0
	var toPush = '目前屏蔽了以下内容：\n'
	for (i in shield){
		toPush += '`' + shield[i] + '`\n'
	}
	pushMessage({nick:'*',text:toPush})
}

// Restore settings from localStorage

if (localStorageGet('pin-sidebar') == 'true') {
	$('#pin-sidebar').checked = true;
	$('#sidebar-content').classList.remove('hidden');
}

if (localStorageGet('log-messages') == 'true') {
	$('#log-messages').checked = true;
	logMessages = true
}

if (localStorageGet('joined-left') == 'false') {
	$('#joined-left').checked = false;
}

if (localStorageGet('parse-latex') == 'false') {
	$('#parse-latex').checked = false;
	md.inline.ruler.disable([ 'katex' ]);
	md.block.ruler.disable([ 'katex' ]);
}

$('#pin-sidebar').onchange = function (e) {
	localStorageSet('pin-sidebar', !!e.target.checked);
}

$('#joined-left').onchange = function (e) {
	localStorageSet('joined-left', !!e.target.checked);
}

$('#afk').onchange = function (e) {
	if (e.target.checked){
		autoAnswer = prompt('请设置自动回复内容：')
		if (!autoAnswer){
			pushMessage({nick:'!',text:'自动回复内容不能为空。'})
			autoAnswer = ''
			e.target.checked = false
			afk = false
		}else{
			if (autoAnswer.indexOf('@'+getNick()) !== -1){
				pushMessage({nick:'!',text:'自动回复内容不能包含@你自己的内容！否则会刷屏！'})
				autoAnswer = ''
				e.target.checked = false
				afk = false
				return
			}
			afk = true
			send({cmd:'emote',text:'进入了挂机状态'})
		}
	}else if (afk && !e.target.checked){
		autoAnswer = ''
		afk = false
		send({cmd:'emote',text:'退出了挂机状态'})
	}
}

$('#dev').onchange = function (e) {
	dev = e.target.checked
}

$('#parse-latex').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('parse-latex', enabled);
	if (enabled) {
		md.inline.ruler.enable([ 'katex' ]);
		md.block.ruler.enable([ 'katex' ]);
	} else {
		md.inline.ruler.disable([ 'katex' ]);
		md.block.ruler.disable([ 'katex' ]);
	}
}

$('#log-messages').onchange = function (e) {
	if (e.target.checked){
		localStorageSet('log-messages', !!e.target.checked);
		logMessages = e.target.checked
		logMessage('[已启用聊天信息记录功能]')
	}else{
		logMessage('[已停用聊天信息记录功能]')
		localStorageSet('log-messages', !!e.target.checked);
		logMessages = e.target.checked
	}
}

if (localStorageGet('syntax-highlight') == 'false') {
	$('#syntax-highlight').checked = false;
	markdownOptions.doHighlight = false;
}

$('#syntax-highlight').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('syntax-highlight', enabled);
	markdownOptions.doHighlight = enabled;
}

if (localStorageGet('allow-imgur') == 'false') {
	$('#allow-imgur').checked = false;
	allowImages = false;
}

$('#allow-imgur').onchange = function (e) {
	var enabled = !!e.target.checked;
	localStorageSet('allow-imgur', enabled);
	allowImages = enabled;
}

// User list
var onlineUsers = [];
var ignoredUsers = [];

function userAdd(nick) {
	var user = document.createElement('a');
	user.textContent = nick;

	user.onclick = function (e) {
		userInvite(nick)
	}

	var userLi = document.createElement('li');
	userLi.appendChild(user);
	$('#users').appendChild(userLi);
	onlineUsers.push(nick);
}

function userRemove(nick) {
	var users = $('#users');
	var children = users.children;

	for (var i = 0; i < children.length; i++) {
		var user = children[i];
		if (user.textContent == nick) {
			users.removeChild(user);
		}
	}

	var index = onlineUsers.indexOf(nick);
	if (index >= 0) {
		onlineUsers.splice(index, 1);
	}
}

function usersClear() {
	var users = $('#users');

	while (users.firstChild) {
		users.removeChild(users.firstChild);
	}

	onlineUsers.length = 0;
}

function userInvite(nick) {
	send({ cmd: 'invite', nick: nick });
}

function userIgnore(nick) {
	ignoredUsers.push(nick);
}

/* color scheme switcher */

var schemes = [
	'android',
	'android-white',
	'atelier-dune',
	'atelier-forest',
	'atelier-heath',
	'atelier-lakeside',
	'atelier-seaside',
	'banana',
	'bright',
	'bubblegum',
	'chalk',
	'default',
	'eighties',
	'fresh-green',
	'greenscreen',
	'hacker',
	'maniac',
	'mariana',
	'military',
	'mocha',
	'monokai',
	'nese',
	'ocean',
	'omega',
	'pop',
	'railscasts',
	'solarized',
	'tomorrow'
];

var highlights = [
	'agate',
	'androidstudio',
	'atom-one-dark',
	'darcula',
	'github',
	'rainbow',
	'tomorrow',
	'xcode',
	'zenburn'
]

var currentScheme = 'atelier-dune';
var currentHighlight = 'darcula';

function setScheme(scheme) {
	currentScheme = scheme;
	$('#scheme-link').href = "schemes/" + scheme + ".css";
	localStorageSet('scheme', scheme);
}

function setHighlight(scheme) {
	currentHighlight = scheme;
	$('#highlight-link').href = "vendor/hljs/styles/" + scheme + ".min.css";
	localStorageSet('highlight', scheme);
}

// Add scheme options to dropdown selector
schemes.forEach(function (scheme) {
	var option = document.createElement('option');
	option.textContent = scheme;
	option.value = scheme;
	$('#scheme-selector').appendChild(option);
});

highlights.forEach(function (scheme) {
	var option = document.createElement('option');
	option.textContent = scheme;
	option.value = scheme;
	$('#highlight-selector').appendChild(option);
});

$('#scheme-selector').onchange = function (e) {
	setScheme(e.target.value);
}

$('#highlight-selector').onchange = function (e) {
	setHighlight(e.target.value);
}

// Load sidebar configuration values from local storage if available
if (localStorageGet('scheme')) {
	setScheme(localStorageGet('scheme'));
}

if (localStorageGet('highlight')) {
	setHighlight(localStorageGet('highlight'));
}

$('#scheme-selector').value = currentScheme;
$('#highlight-selector').value = currentHighlight;

/* main */
setTimeout(function(){
	getConfig()
},500)
if (myChannel == '') {
	pushMessage({ text: frontpage });
	$('#footer').classList.add('hidden');
	$('#sidebar').classList.add('hidden');
} else {
	join(myChannel);
}
