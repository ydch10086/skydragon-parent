$(function(){
	//赋值当前时间
	$("input[name='scanStartTime']").val(getStartDate());
	$("input[name='scanEndTime']").val(getStartDate());
	
	$(".list").height($("body").height()-$(".condition").height()-$(".page").height()- 103);//数据高度自适应
	$(".subbtn").click(function(){
		$(".loadDiv").show();
		$(".pageNum").val(1);
		queryWeighScan();
	});//提交按钮
	$(".cleanbtn").click(function(){//清除按钮
		var pageNum=$(".pageNum").val();
		var pageSize=$(".pageSize").val();
		$('#subform')[0].reset();
		$(".siteHiddenTextClass").val("");
		$(".preSiteHiddenTextClass").val("");
		$(".createdByHiddenTextClass").val("");
		$(".createdByTextClass").val("");
		//赋值当前时间
		$("input[name='scanStartTime']").val(getStartDate());
		$("input[name='scanEndTime']").val(getStartDate());
		$(".pageNum").val(pageNum);
		$(".pageSize").val(pageSize);
		$(".dayNum").css("border-color","#fff");
		$(".dayNum").eq(0).css("border-color","#BABABA");
		$(".selday").val(1);
	});
	$(".dayNum").click(function() {// 天数选择
		$(".dayNum").css("border-color", "#fff");
		$(this).css("border-color", "#BABABA");
		$(".selday").val($(this).index());
		var dayValue = $(this).index();
		if(dayValue==1 || dayValue==2 || dayValue==3 ){
			$("input[name='scanStartTime']").val(setDayVal(dayValue-1).format('YYYY-MM-DD'));
			$("input[name='scanEndTime']").val(getStartDate());
		}
	});
	$(".prePage").click(function(){//上一页
		if($(".pageNum").val()>1){
			$(".pageNum").val(parseInt($(".pageNum").val())-1);
			queryWeighScan();
		}
	});
	$(".nextPage").click(function(){//下一页
		if($(".pageNum").val()<parseInt($(".pageCount").val())){
			$(".pageNum").val(parseInt($(".pageNum").val())+1);
			queryWeighScan();
		}
	});
	$(".pageNum").change(function(){//页数改变
		queryWeighScan();
	});
	$(".pageSize").change(function(){//条数改变
		$(".pageNum").val(1);
		queryWeighScan();
	});
	$ ("#dataPage .disbtn").click (function () {// 隐藏显示查询条件
		if ($ (this).attr ("src") == $("#ctx").val()+"/image/addimg.png"){
			$(".condition").css("overflow-x","auto");
			$(".condition").animate({height:'171.5px'});
			$ (this).attr ("src",  $("#ctx").val()+"/image/removeimg.png");
			$ ("#dataPage .list").height ($ ("body").height () - $ (".page").height () - 275);// 数据高度自适应
		} else{
			$(".condition").css("overflow-x","hidden");
			$(".condition").animate({height:'35px'});
			$ (this).attr ("src",  $("#ctx").val()+"/image/addimg.png");
			$ ("#dataPage .list").height ($ ("body").height () - $ (".page").height () - 138);// 数据高度自适应
		}
	});
});


function queryWeighScan(){
	if($("input[name='scanStartTime']").val()!="" && $("input[name='scanEndTime']").val()!=""){
		if(dateCompare($("input[name='scanStartTime']").val(),$("input[name='scanEndTime']").val(),1)<0){
			$(".loadDiv").hide();
			alert("开始时间不能大于结束时间");
			return false;
		}/*else if(dateCompare($("input[name='scanStartTime']").val(),$("input[name='scanEndTime']").val(),2)!=$(".selday").val()){
			alert("选择的扫描时间与查询天数不匹配");
			return false;
		}*/
		t = dateDiff($("input[name='scanEndTime']").val(),$("input[name='scanStartTime']").val());
		if(t>2){
			$(".loadDiv").hide();
			alert("只能查询三天内的数据");
			return false;
		}
	}
	var reqParams="";
	if($(".selType").is(':checked')){
		var ewbNo = $.trim($("input[name='billNo']").val());
		if(!ewbNo){
			$(".loadDiv").hide();
			alert("请输入单号");
			return false;
		}
		reqParams={
			'ewbNO' : ewbNo,
			'pageSize' : $(".pageSize").val(),
			'pageNum' : $(".pageNum").val()};
	}else{
		var pageNum=$("input[name='billNo']").val();
		$("input[name='billNo']").val("");
		
		reqParams = {
				'createdBy' : $("input[name='createdBy']").val(),
				'scanStartTime' : $("input[name='scanStartTime']").val(),
				'scanEndTime' : $("input[name='scanEndTime']").val(),
				'prevSite' : $("input[name='prevSite']").val(),
				'siteName' : $("input[name='siteId']").val(),
				'pageSize' : $(".pageSize").val(),
				'pageNum' : $(".pageNum").val()};
		$("input[name='billNo']").val(pageNum);
	}
	$.ajax({
		type : "POST",
		async : false,
		url : "queryWeighScan",
		data : reqParams ,
		dataType : "text",
		success : function(data) {
			var pageEntity = JSON.parse(data);
			if(pageEntity.error == false){
				var dataList = pageEntity["dataList"];
				var htm="";
				if(dataList.length > 0){
					for (var i = 0; i < dataList.length; i++) {
						var num = i+1;
						htm+="<tr><td>"+num+"</td><td>"+dataList[i].ewbNO+"</td><td>"+dataList[i].siteName+"</td>";
						htm+="<td>"+dataList[i].createdBy+"</td><td>"+dataList[i].scanTime+"</td><td>"+dataList[i].goodsWeigh+"</td>";
						htm+="<td>"+dataList[i].centerWeight+"</td><td>"+dataList[i].scanSourceName+"</td><td>"+dataList[i].deviceCode+"</td></tr>";
					}
					$("#tbody_weighScanDisplayId").html(htm);
					$(".listTable tr th").each(function(index){
						$(this).width($("#tbody_weighScanDisplayId tr td").eq(index).width());
					});
				}else{
					$("#tbody_weighScanDisplayId").html('<tr><td colspan ="9"><center style="color:red">未查询到数据</center></td></tr>');
				}
				
				var pageNumCount = pageEntity.total;//当前记录总数
				if(pageNumCount<1){
					$(".page").hide();
				}else{
					$(".page").show();
					var pageNum=$(".pageNum").val();//当前页
					var pageSize=$(".pageSize").val();//当前页显示个数
					var startNum=(pageNum-1)*pageSize+1;//起始记录
					var endNum=pageNum*pageSize;//结束记录
					if(endNum>pageNumCount){endNum=pageNumCount}
					$(".pageinfo").html("显示第"+startNum+"至"+endNum+"项记录，共"+pageEntity.total+"项");
					// 得到总页数
					var pageCount;
					if (pageNumCount / pageSize == 0) {
						pageCount = pageNumCount / pageSize;
					} else {
						pageCount = Math.ceil(pageNumCount / pageSize);
					}
					$(".pageCount").val(pageCount);
					var pageNumhtml="";
					for (var i = 1; i <=pageCount; i++) {
						if(pageNum==i){
							pageNumhtml+="<option selected='selected' value='"+i+"'>"+i+"</option>";
						}else{
							pageNumhtml+="<option value='"+i+"'>"+i+"</option>";
						}
					}
					$(".pageNum").html(pageNumhtml);
					//翻页按钮颜色改变
					if(pageCount==1){
						$(".prePage").add(".nextPage").css("color","#AAA");
					}else if(pageNum==1){
						$(".prePage").css("color","#AAA");
						$(".nextPage").css("color","#00F");
					}else if(pageNum==pageCount){
						$(".prePage").css("color","#00F");
						$(".nextPage").css("color","#AAA");
					}else{
						$(".prePage").add(".nextPage").css("color","#00F");
					}
				}
				$(".loadDiv").hide();
			}else{
				$(".loadDiv").hide();
				alert(pageEntity.errorMsg);
			}
			
		}
	});
}
