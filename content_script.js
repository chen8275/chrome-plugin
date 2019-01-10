	var url = location.href;
	//alert(url);
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
            	xmlHttp2.open("GET","https://172.16.236.156/queryByRequestid?requestid="+requestid,true);
				xmlHttp2.send(null);

            }
        }
    xmlHttp.open("GET",url,true);
	xmlHttp.send(null);
