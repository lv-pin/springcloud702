
$(function(){

	function getArgs(){
		var qs=(location.search.length>0?location.search.substring(1):"");
		args={};
		items=qs.length?qs.split("&"):[];
		item=null;
		name=null;
		value=null;
		i=0;
		len=items.length;
		for(i=0;i<len;i++){
			item=items[i].split("=");
			name=decodeURIComponent(item[0]);
			value=decodeURIComponent(item[1]);
			if(name.length){
				args[name]=value;
			}
		}
		return args;
	}

	var args=getArgs();

	var messageArr=[];
	var temp_message_data={};
	for(var item in args){
		temp_message_data.type=args[item].substring(6,args[item].indexOf(','));
		temp_message_data.link=args[item].substring(args[item].indexOf('link:')+5,args[item].indexOf('}'));
		messageArr.push(temp_message_data);
		temp_message_data={};
	}

	for(var i=0;i<messageArr.length;i++){
		if(messageArr[i].type=="apply_web"){
			$("#contents_ul").prepend('<li class="contents_lists">\
		 				<p>官网链路--WEB</p>\
						<p>4.1 B2CWEB服务器</p>\
						<p>4.1.1 故障描述：B2CWEB服务没有处于服务状态\
						<span  class="contents_lists_importent">链路：'+messageArr[i].link+'</span></p>\
						<p>4.1.2 故障处理：</p>\
						<p class="contents_lists_importent">将该检测链接在故障链路的B2CWEB服务器本机运行</p>\
						<p class="contents_lists_importent">1. 正常，则是网络问题；</p>\
						<p class="contents_lists_importent">2. 异常，请按【B2C系统维护说明】重启WEB服务</p>\
		 			</li>')
		}
		if(messageArr[i].type=="apply_app"){
			$("#contents_ul").prepend('<li class="contents_lists">\
		 				<p>官网链路--WEB</p>\
						<p>4.1 B2CWEB服务器</p>\
						<p>4.1.1 故障描述：B2CWEB服务没有处于服务状态\
						<span  class="contents_lists_importent">链路：'+messageArr[i].link+'</span></p>\
						<p>4.1.2 故障处理：</p>\
						<p class="contents_lists_importent">将该检测链接在故障链路的B2CWEB服务器本机运行</p>\
						<p class="contents_lists_importent">1. 正常，则是网络问题；</p>\
						<p class="contents_lists_importent">2. 异常，请按【B2C系统维护说明】重启WEB服务</p>\
		 			</li>')
		}
		if(messageArr[i].type=="port"){
			$(".contents_lists").each(function(){
				if($(this).attr("title")==messageArr[i].link){
					$(this).removeClass("hidden");
				}
			})
		}
	}

})
