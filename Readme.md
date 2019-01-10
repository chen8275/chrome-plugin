---
title: chrome插件调用接口打印在浏览器console中
date: 2018-12-30
categories: [Javascript,Ajax,JSON]
tags: [Javascript,Ajax]
---



参考

```
https://www.cnblogs.com/liuxianan/p/chrome-plugin-develop.html#%E5%AE%98%E6%96%B9%E8%B5%84%E6%96%99
```

api-plugin

![1546049867638](http://chen-tiger.oss-cn-beijing.aliyuncs.com/18-12-29/98298080.jpg)

#### manifest.json

这是一个Chrome插件最重要也是必不可少的文件，用来配置所有和插件相关的配置，必须放在根目录。其中，`manifest_version`、`name`、`version`3个是必不可少的，`description`和`icons`是推荐的。 

```js
{
	  "name": "Log Redder",
	  "description": "把log集成到浏览器",
	  "version": "2.0",
	  "permissions": [
	    "activeTab"
	  ],
	  "background": {
	    "scripts": ["background.js"],
	    "persistent": false
	  },
	  "browser_action": {
	    "default_title": "Make log into console"
	  },
	  "manifest_version": 2
}
```

#### background.js

后台（姑且这么翻译吧），是一个常驻的页面，它的生命周期是插件中所有类型页面中最长的，它随着浏览器的打开而打开，随着浏览器的关闭而关闭，所以通常把需要一直运行的、启动就运行的、全局的代码放在background里面。

background的权限非常高，几乎可以调用所有的Chrome扩展API（除了devtools），而且它可以无限制跨域，也就是可以跨域访问任何网站而无需要求对方设置`CORS`。

> 经过测试，其实不止是background，所有的直接通过`chrome-extension://id/xx.html`这种方式打开的网页都可以无限制跨域。 

配置中，`background`可以通过`page`指定一张网页，也可以通过`scripts`直接指定一个JS，Chrome会自动为这个JS生成一个默认的网页。

示例配置： 

```js
{
    // 会一直常驻的后台JS或后台页面
    "background":
    {
        // 2种指定方式，如果指定JS，那么会自动生成一个背景页
        "page": "background.html"
        //"scripts": ["js/background.js"]
    },
}
```

background.js

```js
chrome.browserAction.onClicked.addListener(function(tab) {
    // No tabs or host permissions needed!
    // 执行脚本文件
    chrome.tabs.executeScript(null,{
      file:"content_script.js"
    });
  });
```

#### background.html

```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>background</title>
	<link rel="stylesheet" href="">
	<script type="text/javascript" src="jquery-1.8.3.js"></script>
	<script type="text/javascript" src="background.js"></script>
	<script type="text/javascript" src="content_script.js"></script>
</head>
<body>
	
</body>
</html>
```

#### background.js

所谓[content-scripts](https://developer.chrome.com/extensions/content_scripts)，其实就是Chrome插件中向页面注入脚本的一种形式（虽然名为script，其实还可以包括css的），借助`content-scripts`我们可以实现通过配置的方式轻松向指定页面注入JS和CSS（如果需要动态注入，可以参考下文），最常见的比如：广告屏蔽、页面CSS定制，等等。 

示例配置： 

```js
{
    // 需要直接注入页面的JS
    "content_scripts": 
    [
        {
            //"matches": ["http://*/*", "https://*/*"],
            // "<all_urls>" 表示匹配所有地址
            "matches": ["<all_urls>"],
            // 多个JS按顺序注入
            "js": ["js/jquery-1.8.3.js", "js/content-script.js"],
            // JS的注入可以随便一点，但是CSS的注意就要千万小心了，因为一不小心就可能影响全局样式
            "css": ["css/custom.css"],
            // 代码注入的时间，可选值： "document_start", "document_end", or "document_idle"，最后一个表示页面空闲时，默认document_idle
            "run_at": "document_start"
        }
    ],
}
```

content-scripts.js首先通过ajax来获得www.tuhu.work的返回头的requestid，然后再调用接口打印在浏览器的console中。

background.js

```js
	var url = location.href;
	alert(url);
	var xmlHttp = new XMLHttpRequest();

	xmlHttp.onreadystatechange=function(){
            if (xmlHttp.readyState ==4 && xmlHttp.status ==200){
            	
            	var requestid = xmlHttp.getResponseHeader('requestid');
            	alert("requestid:"+requestid);

            	var xmlHttp2 = new XMLHttpRequest();
            	xmlHttp2.onreadystatechange=function(){
            	if (xmlHttp2.readyState ==4 && xmlHttp2.status ==200){
            		
            		console.log(JSON.parse(xmlHttp2.responseText));
            		}
            	}
            	xmlHttp2.open("GET","https://172.16.236.161/queryByRequestid?requestid="+requestid,true);
				xmlHttp2.send(null);

            }
        }
    xmlHttp.open("GET",url,true);
    xmlHttp.send(null);

```

