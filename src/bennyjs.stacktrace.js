// deps:[bennyjs.util,jQuery]
/*	Debug面板

	var view = bennyjs.StackTrace.init();
	view.add(val,val,...)
*/

;(function() {

    var tools = com.bennyrice.tools;
    var bj = com.bennyrice.utils;

	// 构造器
	function bjStackTrace() {
		console.log('BennyStackTrace inited')
	};

	// 属性
	var sp = bjStackTrace.prototype;
	sp.panel; //窗口
	sp.drag; //拖动杆
	sp.info; //信息
	sp.show; //显示
	sp.hide; //隐藏
	sp.clear; //清空信息
	sp.css = {
		panelCss: {
			// 主容器
			selector: '#panel',
			style: {
				'cursor': 'default',
				'font-family': 'Helvetica, Arial, sans-serif',
				'color': '#666666',
				'font-size': '12px',
				'background-color': '#ffffff',
				'position': 'fixed',
				'z-index': 99,
				'padding': '25px 3px',
				'padding-bottom': '5px',
				'top': '0px',
				'left': '0px',
				'line-height': '18px',
				'overflow': 'hidden',
				'min-width': '300px',
				width: '300px',
				height: '250px',
				"border": "1px solid #AAAAAA"
			}
		},
		dragdivCss: {
			// 拖动条主体
			selector: '#drag,.small',
			style: {
				color: "#fff",
				'text-align': 'center',
				'line-height': '24px',
				'position': 'absolute',
				'width': '100%',
				'height': '25px',
				'font-weight': 'bold',
				'background-color': '#D74937',
				'user-select': 'none',
				'cursor': 'move',
				'display': 'inline-block'
			}
		},
		smallBtnCss: {
			// 拖动条上的小按钮
			selector: '#drag .small',
			style: {
				"position": "absolute",
				"width": '24px',
				"cursor": "pointer",
				"border-left": "1px solid #fff",
				right: 0,
				top: 0
			}
		},
		infoCss: {
			// 输出面板容器
			selector: ".info",
			style: {
				'position': 'static',
				'width': '100%',
				'min-width': '300px',
				'height': '100%',
				'min-height': '100px',
				'max-height': '400px',
				'overflow': 'auto',
				'text-align': 'left',
				'margin-bottom': '5px'
			}
		},
		eachCss: {
			// 每一条信息的整体table
			selector: ".infobox",
			style: {
				'margin': '5px auto',
				width: '100%'
			}
		},
		funnameCss: {
			// 目标信息函数名
			selector: ".funname",
			style: {
				'background-color': '#488CFA',
				width: '23%',
				padding: '0 3px',
				border: '1px solid #3079ed',
				'border-right': 'none',
				color: '#fff'

			}
		},
		resultCss: {
			// 目标信息结果
			selector: ".result",
			style: {
				'background-color': '#488CFA',
				padding: '3px 3px 2px 3px',
				border: '1px solid #3079ed',
				color: '#fff'
			}
		},
		calledCss: {
			// 层级连接
			selector: "#called",
			style: {
				'font-family': 'Arial, sans-serif',
				'background-color': '#F5F5F5',
				'font-size': '12px',
				padding: '0 2px',
				border: '1px solid #CCCCCC',
				color: '#DB5C40',
				'text-shadow': '0 1px 0px #fff',
				'-moz-text-shadow': '0 1px 0px #fff',
				'-ms-text-shadow': '0 1px 0px #fff',
				'-o-text-shadow': '0 1px 0px #fff'
			}
		},
		sbtnCss: {
			// 缩放按钮
			selector: "#scale",
			style: {
				"position": "absolute",
				"width": "100%",
				"height": "10px",
				color: '#ccc',
				"bottom": 0,
				"right": 0,
				"z-index": 99,
				'text-align': 'right',
				background: "#4A8BF5",
				cursor: "nw-resize",
				'user-select': 'none'
			}
		},
		typeCss: {
			selector: '.type',
			style: {
				'border-radius': '3px',
				'-webkit-border-radius': '3px',
				'-moz-border-radius': '3px',
				'-o-border-radius': '2px',
				'-ms-border-radius': '3px',
				'padding': '0 2px 0 3px',
				'margin-right': '2px',
				'font-weight': '400',
				'border': '1px solid #3079ed',
				'background-color': '#ea5b4b'
			}
		},
		stringCss: {
			selector: '.string',
			style: {
				'background-color': '#dbad41'
			}
		},
		arrayCss: {
			selector: '.array',
			style: {
				'background-color': '#b45eff'
			}
		},
		functionCss: {
			selector: '.function',
			style: {
				'background-color': '#54b21e'
			}
		}
	}

	// 初始化
	sp.init = function() {
		console.log("面板初始化")

		// 生成CSS样式
		var w = 300,
			h = 300,
			minw = 300,
			minh = 100;
		bj.addStyle(this.css.panelCss);
        bj.addStyle(this.css.dragdivCss);
        bj.addStyle(this.css.smallBtnCss);
        bj.addStyle(this.css.eachCss);
        bj.addStyle(this.css.infoCss);
        bj.addStyle(this.css.funnameCss);
        bj.addStyle(this.css.resultCss);
        bj.addStyle(this.css.calledCss);
        bj.addStyle(this.css.sbtnCss);
        bj.addStyle(this.css.typeCss);
        bj.addStyle(this.css.stringCss);
        bj.addStyle(this.css.arrayCss);
        bj.addStyle(this.css.functionCss);


		///////////////////创建UI///////////////////		
		// 主界面容器
		var panel = $(document.createElement("div"));
		this.panel = panel;
		this.panel.attr('id', 'panel');

		// 拖动按钮
		var drag = $(document.createElement("div"));
		this.drag = drag;

		this.drag.attr('id', 'drag')
		this.drag.css({
			"top": 0,
			"left": 0,
			'background-image': 'url("http://bennyrice.com/site/line/img/logo.jpg")',
			'background-repeat': 'no-repeat',
			'background-position': '4px 0',
			'-webkit-box-shadow': '0 1px 5px rgba(0,0,0,.3)',
			'-moz-box-shadow': '0 1px 5px rgba(0,0,0,.3)',
			'-ms-box-shadow': '0 1px 5px rgba(0,0,0,.3)',
			'-o-box-shadow': '0 1px 5px rgba(0,0,0,.3)'
		})
		this.drag.html('BENNY STACK-TRACE');

		// 最小化、最大化按钮
		var minbtn = $(document.createElement("div"));
		this.minbtn = minbtn;
		this.minbtn.attr('class', 'small');
		this.minbtn.html("-");
		this.minbtn.data('target', this.info);

		// 清空数据按钮
		var cbtn = $(document.createElement("div"));
		this.cbtn = cbtn;
		this.cbtn.attr('class', 'small');
		this.cbtn.css("right", 25);
		this.cbtn.html("c");

		// 数据区域
		var info = $(document.createElement("div"));
		this.info = info;
		this.info.attr('class', 'info');

		// 缩放按钮
		var sbtn = $(document.createElement("div"));
		this.sbtn = sbtn;
		this.sbtn.attr('id', 'scale');
		this.sbtn.html('<b style="display:block;margin:-3px 2px 0 0;">≡</b>');

		// 创建结构
		this.panel.append(this.drag);
		this.drag.append(this.cbtn);
		this.drag.append(this.minbtn);
		this.panel.append(this.info);
		this.panel.append(this.sbtn);



		///////////////////用户交互///////////////////	
		// 桌面端控制
		var ifscale = false,
			lock = false;
		// 缩放
		var resizePanel = function(e) {
			var neww = e.pageX - panel.offset().left;
			var newy = e.pageY - panel.offset().top;
			var rw = neww < minw ? minw : neww;
			var ry = newy < minh ? minh : newy
			panel.css("width", rw);
			panel.css("height", ry);
		}
		this.sbtn.on("mousedown", function(e) {
			ifscale = true;
			info[0].style.maxHeight = '100%';
			resizePanel(e);
			$(document).on("mousemove", function(e) {
				if (ifscale && !lock) {
					resizePanel(e);
				}
			});
			$(document).on("mouseup", function(e) {
				ifscale = false;
			});
			return false;
		});

		this.drag.on("mousedown", function(e) {
			// 获取鼠标按下时与窗体的位置修正
			var mousex = e.pageX;
			var mousey = e.pageY;
			var oldx = parseFloat(panel.css("left")) - mousex;
			var oldy = parseFloat(panel.css("top")) - mousey;
			$(document).on("mousemove", function(e) {
				var mousex = e.pageX;
				var mousey = e.pageY;
				panel.css("left", mousex + oldx);
				panel.css("top", mousey + oldy);
			});
			drag.on("mouseup", function(e) {
				$(document).off("mousemove");
			});
			return false;
		});

		this.minbtn.on("click", function(e) {
			if (minbtn.html() == "-") {
				lock = true;
				minbtn.html("+");
				panel.css("height", "auto");
				sbtn.css("height", 3);
				info[0].style.maxHeight = '400px';
			} else {
				lock = false;
				minbtn.html("-");
				panel.css("height", info.height);
				sbtn.css("height", 10);
			}
			info.toggle("fast");
			panel.css("width", w);
		});

		this.cbtn[0].onclick = function(e) {
			var pd = window.confirm("Benny: Would u want to clear all the info?");
			if (pd) bjStackTrace.instance.clear();
		}

		// 拖动窗体——移动端控制
		this.drag[0].ontouchstart=function(e){
			var touch = e.touches[0];
			var mousex = touch.clientX;
			var mousey = touch.clientY;
			var oldx = parseFloat(panel.css("left")) - mousex;
			var oldy = parseFloat(panel.css("top")) - mousey;
			//var ShowDataDIV=DebugView.app.ShowDataDIV;
			//var oldx=e.layerX;
			//var oldy=e.layerY;
			drag[0].ontouchmove=function(e){
				e.preventDefault();
				//var ShowDataDIV=DebugView.app.ShowDataDIV;
				//var newy=e.layerY;
				//var scroll=ShowDataDIV.scrollTop();
				//ShowDataDIV.scrollTop(scroll+(oldy-newy));  
				//oldy=e.layerY;
				var mousex = e.pageX;
				var mousey = e.pageY;
				panel.css("left", mousex + oldx);
				panel.css("top", mousey + oldy);
			}
			drag[0].ontouchend=function(e){
				drag[0].ontouchmove=null;
			}
		}
		
		// 调整窗体大小——移动控制
		this.sbtn[0].ontouchstart = function(e) {
			ifscale = true;
			var touch = e.touches[0];
			info[0].style.maxHeight = '100%';
			
			var neww = touch.pageX - panel.offset().left;
			var newy = touch.pageY - panel.offset().top;
			var rw = neww < minw ? minw : neww;
			var ry = newy < minh ? minh : newy
			panel.css("width", rw);
			panel.css("height", ry);
			
			sbtn[0].ontouchmove = function(e) {
				if (ifscale && !lock) {
					var neww = touch.pageX - panel.offset().left;
					var newy = touch.pageY - panel.offset().top;
					var rw = neww < minw ? minw : neww;
					var ry = newy < minh ? minh : newy
					panel.css("width", rw);
					panel.css("height", ry);
				}
			};
			sbtn[0].ontouchend = function(e) {
				ifscale = false;
			};
			return false;
		};
		
		$('body').append(this.panel);
	}

	// public: 显示debug窗口
	sp.show = function() {
		if (this.panel) this.panel.show();
	}

	// public: 隐藏debug窗口
	sp.hide = function() {
		if (this.panel) this.panel.hide();
	}

	// public: 清空信息内容
	sp.clear = function() {
		if (this.panel) this.info.html('');
	}

	// public: 添加trace内容
	sp.add = function() {
		// 浏览器输出
        trace.apply(sp.add, arguments)

		// 面板输出
		if (this.panel == undefined || this.info == null) return;

		/*  <div>目标数据
		 *		<table>
		 *			<tr>
		 *				<td>调用函数名</td><td>输出结果</td>
		 *			</tr>
		 *			<tr>
		 *				<td>父级调用函数</td>
		 *			</tr>
		 *		</table>
		 *	</div>
		 */
		// 获取输出内容的数组--->类似于[bennyjs([Object,Object],bFun(),aFun())]
		var data_arr = arguments.callee.data();

		// 我们输出的内容
		// 创建一个数据包裹box
		var box = $(document.createElement('table'));
		box.attr('class', 'infobox');
		box.attr('border', "0");
		box.attr('cellspacing', "0");
		box.attr('cellpadding', "0");

		var tit = $(document.createElement('tr'));
		var str = data_arr.shift().toString(); //Anonymous(...)
		var index = str.indexOf('(');

		// 目标
		var r = $(document.createElement("td"));
		r.attr('class', 'result');
		var result = str.slice(index + 1, str.length - 1);
		result = result.replace(/Array :/mg, '<b class="type array" title="数组">Array :</b>');
		result = result.replace(/Function :/mg, '<b class="type function" title="函数">Function :</b>');
		result = result.replace(/String :/mg, '<b class="type string" title="字符串">String :</b>');
		result = result.replace(/Object :/mg, '<b class="type object" title="对象">Object :</b>');
		r.html(result);



		// 从直接父级获取调用的函数名，这时的data_arr已经被去除了第一个元素
		if (data_arr.length > 0) {
			str = data_arr.shift().toString();
			index = str.indexOf('(');
			var funname = $(document.createElement("td"));
			funname.attr('class', 'funname');
			//funname.html(str.slice(0,index)+":");
			funname.html(str + ":");

			if (data_arr.length > 0) {
				var len = data_arr.length;
				var tree = $(document.createElement("tr"));
				tit.data('target', tree);

				var called = $(document.createElement("td"));
				called.attr('id', 'called');
				called.attr('colspan', "2");
				called.css('border-top', 'none');
				tree.append(called);
				for (var i = 0; i < len; i++) {
					var str = (i == 0) ? "&nbsp;&nbsp;└ called by > " + data_arr[i] : "&nbsp;> " + data_arr[i]
					called.append(str);
				}
			}
		} else {
			funname = $(document.createElement("td"));
			funname.attr('class', 'funname');
			funname.html('无调用函数');
			funname.css(this.css.calledCss.style);
			funname.css('color', '#CCC');
		}
		tit.append([funname, r]);
		box.append(tit);
		if (tree) box.append(tree);
		if (tit.data('target') != undefined) {
			tit.css('cursor', 'pointer');
			var target = tit.data('target');
			tit.on('click', function(e) {
				target.toggle("fast");
			});
		}
		this.info.append(box);
		return bjStackTrace.instance;
	}
	
	// 设置面板的坐标
	sp.setTransform = function(x,y){
		if(y==null||y==undefined){
			y = 0;
		}
		this.panel.css('left',x);
		this.panel.css('top',y);	
	}

	// static: 单例
	bjStackTrace.instance = null;
	bjStackTrace.init = function() {
		if (bjStackTrace.instance != null) return bjStackTrace.instance;
		bjStackTrace.instance = new bjStackTrace();
		bjStackTrace.instance.init();
		return bjStackTrace.instance;
	}

	tools.StackTrace = bjStackTrace;
	return bjStackTrace;
}());
