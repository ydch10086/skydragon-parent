// 获取初始时间
function nowDate(){
	var myDate = new Date();
	var year = myDate.getFullYear();    //获取完整的年份
	var month = myDate.getMonth()+1;       //获取当前月份
	var date = myDate.getDate();        //获取当前日
	var nowDate = year+ "-" + month +"-"+ date;
	return nowDate
}

//日期比较方法	
function dateCompare(date1, date2) {
	data1 = date1.replace(/-/g, "/");
	data2 = date2.replace(/-/g, "/");
	var date1 = new Date(date1).getTime();
	var date2 = new Date(date2).getTime();
	return parseInt((date2 - date1) / (1000 * 60 * 60 * 24)) + 1;
}
function queryAll() {
	if ($("input[name='scanStartTime']").val() != ""
			&& $("input[name='scanEndTime']").val() != "") {
		if (dateCompare($("input[name='scanStartTime']").val(), $(
				"input[name='scanEndTime']").val()) < 0) {
			$(".loadDiv").hide();
			alert("开始时间不能大于结束时间");
			return false;
		} /*else if(dateCompare($("input[name='scanStartTime']").val(),$("input[name='scanEndTime']").val(),2)!=$(".selday").val()){
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
	var reqParams = "";
	if ($(".selType").is(':checked')) {
		var billNo = $.trim($("input[name='billNo']").val());
		if(!billNo){
			$(".loadDiv").hide();
			alert("请输入单号");
			return false;
		}
		reqParams = {
			'billNo' : $("input[name='billNo']").val(),
			'pageSize' : $(".pageSize").val(),
			'pageNum' : $(".pageNum").val()
		};
	} else {
		var pageNum = $("input[name='billNo']").val();
		$("input[name='billNo']").val("");
		reqParams = $('#subform').serialize();
		$("input[name='billNo']").val(pageNum);
	}
	$
			.ajax({
				type : "POST",
				async : false,
				url : "queryArrivePack",
				data : reqParams,
				dataType : "text",
				success : function(data) {
					var pageEntity = JSON.parse(data);
					var dataList = pageEntity["dataList"];
					var htm = "";
					if (dataList.length > 0) {

						for (var i = 0; i < dataList.length; i++) {
							var num = i + 1
							htm += "<tr><td>" + num + "</td><td>"
									+ dataList[i].billNo + "</td><td>"
									+ dataList[i].siteName + "</td>";
							htm += "<td>" + dataList[i].createBy + "</td><td>"
									+ dataList[i].scanTime + "</td><td>"
									+ dataList[i].prevSite + "</td><td>"
									+ dataList[i].sourceName + "</td>";
							htm += "<td>" + dataList[i].deviceCode
									+ "</td></tr>";
						}
						$("#tbodylist").html(htm);
						$(".listTable tr th").each(function(index){
							$(this).width($("#tbodylist tr td").eq(index).width());
						});
					} else {
						$("#tbodylist")
								.html(
										'<tr><td colspan ="9"><center style="color:red">未查询到数据</center></td></tr>');
					}
					var pageNumCount = pageEntity.total;// 当前记录总数
					if (pageNumCount < 5) {
						$(".page").hide();
					} else {
						$(".page").show();
						var pageNum = $(".pageNum").val();// 当前页
						var pageSize = $(".pageSize").val();// 当前页显示个数
						var startNum = (pageNum - 1) * pageSize + 1;// 起始记录
						var endNum = pageNum * pageSize;// 结束记录
						if (endNum > pageNumCount) {
							endNum = pageNumCount
						}
						$(".pageinfo").html(
								"显示第" + startNum + "至" + endNum + "项记录，共"
										+ pageEntity.total + "项");
						// 得到总页数
						var pageCount;
						if (pageNumCount / pageSize == 0) {
							pageCount = pageNumCount / pageSize;
						} else {
							pageCount = Math.ceil(pageNumCount / pageSize);
						}
						$(".pageCount").val(pageCount);
						var pageNumhtml = "";
						for (var i = 1; i <= pageCount; i++) {
							if (pageNum == i) {
								pageNumhtml += "<option selected='selected' value='"
										+ i + "'>" + i + "</option>";
							} else {
								pageNumhtml += "<option value='" + i + "'>" + i
										+ "</option>";
							}
						}
						$(".pageNum").html(pageNumhtml);
						// 翻页按钮颜色改变
						if (pageCount == 1) {
							$(".prePage").add(".nextPage").css("color", "#AAA");
						} else if (pageNum == 1) {
							$(".prePage").css("color", "#AAA");
							$(".nextPage").css("color", "#00F");
						} else if (pageNum == pageCount) {
							$(".prePage").css("color", "#00F");
							$(".nextPage").css("color", "#AAA");
						} else {
							$(".prePage").add(".nextPage").css("color", "#00F");
						}
					}
					$(".loadDiv").hide();
				}
			});
}

$(window).resize(function(){
	$(".list").height($("body").height() -$(".condition").height()-$(".page").height()- 103);// 数据高度自适应
});
$(function() {
	//赋值当前时间
	$("input[name='scanStartTime']").val(getStartDate());
	$("input[name='scanEndTime']").val(getEndDate());
	
	$(".list").height($("body").height() -$(".condition").height()-$(".page").height()- 103);// 数据高度自适应

	$(".subbtn").click(function() {
		$(".loadDiv").show();
		$(".pageNum").val(1);
		queryAll();
	});// 提交按钮
	$(".cleanbtn").click(function() {// 清除按钮
		var pageNum = $(".pageNum").val();
		var pageSize = $(".pageSize").val();
		$('#subform')[0].reset();
		$(".pageNum").val(pageNum);
		$(".pageSize").val(pageSize);
		$(".dayNum").css("border-color", "#fff");
		$(".dayNum").eq(0).css("border-color", "#BABABA");
		$(".selday").val(1);
		$("input[name='siteId']").val("");
		$("input[name='createById']").val("");
		$("input[name='prevSiteId']").val("");
		$("input[name='createBy']").val("");
		$("input[name='scanStartTime']").val(getStartDate());
		$("input[name='scanEndTime']").val(getEndDate());
	});
	$(".dayNum").click(function() {// 天数选择
		$(".dayNum").css("border-color", "#fff");
		$(this).css("border-color", "#BABABA");
		$(".selday").val($(this).index());
		var dayValue = $(this).index();
		if(dayValue==1 || dayValue==2 || dayValue==3 ){
			$("#scanStartTimeId").val(GetDateStr(dayValue-1));
			$("#scanEndTimeId").val(getStartDate());
		}
	});
	$(".prePage").click(function() {// 上一页
		if ($(".pageNum").val() > 1) {
			$(".pageNum").val(parseInt($(".pageNum").val()) - 1);
			queryAll();
		}
	});
	$(".nextPage").click(function() {// 下一页
		if ($(".pageNum").val() < $(".pageCount").val()) {
			$(".pageNum").val(parseInt($(".pageNum").val()) + 1);
			queryAll();
		}
	});
	$(".pageNum").change(function() {// 页数改变
		queryAll();
	});
	$(".pageSize").change(function() {// 条数改变
		$(".pageNum").val(1);
		queryAll();
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