/**
 *  BennyJS main class
 *  @deps       []
 *  @author     BennyZhao
 */
;(function(definition) {
    if (typeof define == "function") {
        define(definition)
    } else if (typeof YUI == "function") {
        YUI.add("es5", definition)
    } else {
        definition(Function('return this')())
    }
})(function(context) {

    var pvt    = {},
        b      = {},    // 对象、数组、字符串等对象、函数...
        math   = {},    // 数学、运算
        main   = {},    // 时间等window身上的方法优化
        dom    = {},    // Node节点、Dom结构、兼容
        web    = {},    // URL跳转、网络请求
        mobile = {},    // 移动设备
        plugin = {};    // 第三方库
    
    bennyjsBasic(context);

    /*
     *   com.bennyrice.utils -> bj
     *   com.bennyrice.tools -> tl
     *   com.bennyrice.cjs   -> cj
     */
    com.pack('com.bennyrice.utils');  // 实用
    com.pack('com.bennyrice.event');  // 事件
    com.pack('com.bennyrice.time');   // 时间&循环
    com.pack('com.bennyrice.anim');   // 动效
    com.pack('com.bennyrice.tools');  // 工具&组件 
    com.pack('com.bennyrice.cjs');    // createJS

    com.bennyrice.utils.outil = b;
    com.bennyrice.utils.math = math;
    com.bennyrice.utils.main = main;
    com.bennyrice.utils.dom = dom;
    com.bennyrice.utils.web = web;
    com.bennyrice.utils.mobile = mobile;
    com.bennyrice.utils.iosUtil = mobile.iosUtil = iosUtil;
    com.bennyrice.utils.plugin = plugin;

    /*
     *   - Private 内部方法 -
     */
    // 缩放值
    pvt.getZoomFactor = function() {
        var factor = 1;
        if (document.body.getBoundingClientRect) {
            var rect = document.body.getBoundingClientRect ();
            var physicalW = rect.right - rect.left;
            var logicalW = document.body.offsetWidth;
            factor = Math.round ((physicalW / logicalW) * 100) / 100;
        }
        return factor;
    }
    // 获取document的矩阵
    pvt.getBox = function() {
        if (document.body.getBoundingClientRect) {
            var rect = document.body.getBoundingClientRect ();
            x = rect.left;
            y = rect.top;
            w = rect.right - rect.left;
            h = rect.bottom - rect.top;
            if (dom.isLow) {
                x -= document.documentElement.clientLeft;
                y -= document.documentElement.clientTop;
                var zoomFactor = pvt.getZoomFactor();
                if (zoomFactor != 1) {
                    x = Math.round (x / zoomFactor);
                    y = Math.round (y / zoomFactor);
                    w = Math.round (w / zoomFactor);
                    h = Math.round (h / zoomFactor);
                }
            }
            return {'x':x,'y':y,'w':w,'h':h};
        }
    }
    // 横向及纵向的滚动值
    pvt.scrollPos = function() {
        // all browsers, except IE before version 9
        if ('pageXOffset' in window) {  
            var scrollLeft =  window.pageXOffset;
            var scrollTop = window.pageYOffset;
        }
        // Internet Explorer before version 9
        else {     
            var zoomFactor = pvt.getZoomFactor ();
            var scrollLeft = Math.round (document.documentElement.scrollLeft / zoomFactor);
            var scrollTop = Math.round (document.documentElement.scrollTop / zoomFactor);
        }
        return {'scrollTop':scrollTop,'scrollLeft':scrollLeft};
    }

    /**
     *    将样式转换成驼峰式的dom style属性(支持带vendor的样式)
     *    -webkit-background-size >> -Webkit-Background-Size >> WebkitBackgroundSize >> webkitBackgroundSize
     *    -moz-background-size >> -Moz-Background-Size >> MozBackgroundSize
     *
     *    @demo: box-shadow -> boxShadow
     * */
    pvt.domStyle = function(str) {
        if(str===undefined) return undefined;
        var n = str.replace(/(\-[a-z])/g, function(str, m1) {
            return m1.toUpperCase()
        }).replace(/(\-)/g, '');
        return n.replace('Webkit', 'webkit').replace('Ms', 'ms');
    }


    /*
     *  - main -
     */
    

    /*
     *  - dom -
     *
     *  -moz-     大写 Moz
     *  -webkit-  大小写开头都可以 webkit
     *  -ms-      小写 ms
     *  -o-       大写 O
     */


    var doc = dom.doc = dom.document = window.document;
    var head = dom.head = document.head || document.getElementsByTagName("head")[0];
    var body = dom.body = document.body;

    dom.$ = function(id){
        if(!b.isString(id)) return;
        if(b.contains(id,'#')){
            id = b.remove(id,'#');
        }
        return doc.getElementById(id);
    }

    /**
     *    根据当前浏览器追加供应商前缀并生成dom style
     *    @demo: `transition` => `WebkitTransition`
     * */
    dom.dss = function(prop) {
        if(prop===undefined) return undefined;
        var div = document.createElement('div');
        if (b.contains(prop, '-')) prop = pvt.domStyle(prop);
        if (prop in div.style) {
            div = null;
            return prop;
        }

        var prefixes = ['Moz', 'webkit', 'O', 'ms'];
        var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

        if (prop in div.style) {
            div = null;
            return prop;
        }

        for (var i = 0; i < prefixes.length; ++i) {
            var vendorProp = prefixes[i] + prop_;
            if (vendorProp in div.style) {
                div = null;
                return vendorProp;
            }
        }
    }

    /**
     *    将驼峰式的字符串转成css样式的字符串(支持带vendor的属性)
     *    将每个大写字母转换成小写字母并在前面加一个'-'
     *
     *    @demo: boxSize -> box-size
     *    @demo: webkitBoxSize -> -webkit-box-size
     * */
    dom.css= function(str) {
        if(str===undefined) return undefined;
        var n = str.replace(/([A-Z])/g, function(str, m1) {
            return '-' + m1.toLowerCase()
        });
        return n.replace(/^(ms|webkit|moz|o)\-/, function(str, m1) {
            return '-' + m1 + '-'
        });
    }

    /**
     *  是否是低端浏览器
     */
    dom.isLow = b.isUndefined(dom.dss('animation'));

    /**
     *  检测IE的版本号
     *  @return     {int}非IE返回-1，IE返回其版本号数字
     */
    dom.checkIE = function () {
        var rv = -1; 
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
        }
        return rv;
    }
    
    // 浏览器可见页面部分宽度
    dom.winWidth = dom.ww = function() {
        return (window.innerWidth || document.documentElement.clientWidth);
    };

    // 浏览器可见页面部分高度
    dom.winHeight = dom.wh = function() {
        return (window.innerHeight || document.documentElement.clientHeight);
    };

    // document文档宽度
    dom.docWidth = dom.dw = function(){
        return pvt.getBox().w;
    }
    // document文档高度
    dom.docHeight = dom.dh = function(){
        return pvt.getBox().h;
    }

    /**
     *  创建Element
     *
     *  @param elementType          {String} tag 的名字 (e.g. 'p', 'div', etc.)。
     *  @param attributes           null 或者  一个二维数组包含属性对 (e.g. onclick='alert(123)' 传入 [['onclick', 'alert(123);']])。 
     *  @param childrenToAppend     null 或者  一个包含已创建的element的数组 或者 一个包含createEle函数调用的数组。
     *  @param innerHTML            留空 或者  此Element内部的文本内容。
     *  @note                       ** childrenToAppend 与 innerHTML 只能选择一个
     */    
    dom.createTag = function(elementType/*, attributes, childrenToAppend, innerHTML*/) {
        var i, tagCode, newElement,
            etype = elementType,
            attr = {},
            content = null,
            isIE = (dom.checkIE()==-1 ? false : true),
            args = b.slice(arguments,1,3);

        if(args.length>0){
            for(var i=0,len=args.length;i<len;i++){
                var arg = args[i];
                if(b.isPlainObject(arg)){
                    attr = arg;
                }
                if(b.isArray(arg)){
                    content = arg;
                }
                if(b.isString(arg)){
                    content = arg;
                }
            }
        }
        if(isIE){
            tagCode = '<' + etype;
        }else{
            newElement = document.createElement(etype);
        } 

        for (var p in attr) {
            if(isIE){
                tagCode += ' ' + p + '="' + attr[p] + '"';
            }else{
                newElement.setAttribute(p, attr[p]);
            }
        }

        if(isIE) newElement = document.createElement(tagCode + '>');
        if(content!=null) {
            if(b.isArray(content)){
                for(var j=0,len=content.length;j<len;j++) {
                    newElement.appendChild(content[j]);
                }
            }else{
                newElement.innerHTML = content;
            }   
        }
        return newElement;
    }

    /** 
     *  在父节点已有子节点的最后追加一个子节点
     *  @param tag      父节点
     *  @param ele      要添加的节点
     */
    dom.addTag = function(tag,ele){
        if(!b.isElement(tag) || !b.isElement(ele)) return;
        return tag.appendChild(ele);
    }
    /** 
     *  在已知节点前插入一个节点
     *  @param tag      已知节点
     *  @param ele      要插在它前面的节点
     */
    dom.beforeTag = function(tag,ele){
        if(!b.isElement(tag) || !b.isElement(ele)) return;
        var parent = tag.parentNode;
        return parent.insertBefore(ele,tag);
    }
    /** 
     *  在已知节点后插入一个节点
     *  @param tag      已知节点
     *  @param ele      要插在它后面的节点
     */
    dom.afterTag = function(tag,ele){
        if(!b.isElement(tag) || !b.isElement(ele)) return;
        var parent = tag.parentNode;
        return parent.insertBefore(ele,tag.nextSibling);
    }

    /** 
     *  在head标签内添加<tagname attr='...'>
     *  @param tagname:String          需要添加的标签名字 eg:link、script、meta...
     *  @param option:PlainObject      该标签的附加属性键值对 eg:{content:"yes",name:"apple-mobile-web-app-capable"}
     */
    dom.addHead= function(tagname, option) {
        tagname = String(tagname);
        var tag = dom.createEle(tagname,option)
        var header = dom.head;
        header.appendChild(tag);
        return tag;
    }

    /** 
     *  在head标签内动态创建一个<style id='bennystyle'>样式表或者一个外链css<link>
     *  @param url:String               外链CSS地址。此时只能传入这一个参数。
     *
     *  @param selector:String          需要选择的Element的选择器 i.e."#nav.mobile"。此时需要传入style参数
     *  @param style:PlainObject        CSS样式属性，和标准css样式表一样的写法，带'-'的属性须加引号
     */
    dom.addStyle = function(/*url|selector,style*/) {
        var css,args = b.slice(arguments),doc = dom.doc,header = dom.head;

        // 外部连接   
        if(args.length == 1){
            css = dom.createTag('link',{'rel':'stylesheet','type':'text/css',href:args[0]});
            header.appendChild(css);
        }
        // style标签样式
        else if(args.length == 2){
            if (dom.$("bennystyle")) {
                css = dom.$("bennystyle");
            } else {
                css = dom.createTag('style',{'id':'bennystyle','type':'text/css'})
                header.appendChild(css);
            }
            var selector = args[0],style = args[1],css_arr = [];
            for (var i in style) { css_arr.push(i + ':' + style[i]); }
            var css_style = css_arr.join(';');
            var css_string = selector + '{' + css_style + '}';
            // 样式表
            var sheet = css.sheet ? css.sheet : css.styleSheet;            
            // 流行浏览器及IE9
            if (sheet.insertRule) {
                for(var i=sheet.cssRules.length-1;i>0;i--){
                    var rule = sheet.cssRules[i];
                    // 将重复的内容删除
                    if(rule.selectorText.replace(', ',',')==config.selector){
                        if (sheet.removeRule) { sheet.removeRule (i); }
                        else if(sheet.deleteRule){ sheet.deleteRule (i); }
                    }
                }
                sheet.insertRule (css_string,sheet.cssRules.length);
            }
            // IE9之前
            else {  
                // 老IE会将多个选择器的字符串分开加入cssRule，因此要分开判断
                var ie_selector = css_selector.split(',');
                for(var j=sheet.rules.length-1;j>0;j--){
                    rule = sheet.rules[j];
                    // 老IE会将tag选择器变成大写的比如html变成HTML因此需要将大写的转换成小写
                    var sel_text = rule.selectorText.indexOf('/^\.|^\#/')!==-1 ? rule.selectorText : rule.selectorText.toLowerCase();
                    if(ie_selector.indexOf(sel_text)!==-1){
                        if (sheet.removeRule) { sheet.removeRule (j); }
                        else if(sheet.deleteRule){ sheet.deleteRule (j); }
                    }
                }
                if (sheet.addRule) {
                    ie_selector.forEach(function(e,i){
                        sheet.addRule (e,css_style);
                    })
                }
            }
        }
    };

    /** 
     *  read only 获取浏览窗口当前滚动的百分比
     *  @demo:
     *  $window.on("scroll", function() {
     *     console.log(bj.dom.scrollPercent())
     *  });
     */
    dom.scrollPercent = function() {
        var documentHeight = dom.docHeight();
        var windowHeight = dom.winHeight();
        var scrollTop = pvt.scrollPos().scrollTop;
        var sp = documentHeight == windowHeight ? 0 : scrollTop / (documentHeight - windowHeight);
        return sp; //gives us the scroll percent range from 0 to 1
    }

    /** read only 获取鼠标滚轮的方向

     @param event            鼠标滚轮事件实例
     @return                -1 向下滚 | 1 向上滚 | 0 获取不到值 (滚动很快时可能超过1)

     @demo:
     $(window).on("mousewheel DOMMouseScroll", function(event){

     var delta = bj.dom.wheelDetail(event);
     console.log(delta);
     // 会阻止页面原生对滚轮事件的响应，滚动页面
     event.preventDefault();
     });
     */
    dom.wheelDelta = function(event,option,timefix) {
        if (event == null) return
        var prevent = false;
        var time = 500;
        if(b.isBoolean(option)){
            prevent = option;
        }
        if(b.isNumber(timefix)){
            time = timefix;
        }
        var delta;
        if(prevent===true){
            if(dom.wheelDelta.old === 0){
                dom.wheelDelta.old = 1;
                var id = setTimeout(function(){
                    dom.wheelDelta.old = 0;
                    clearTimeout(id);
                },time)
            }else if(dom.wheelDelta.old > 0) {
                return 0;
            }
        }
        
        if (event.originalEvent) {
            delta = (event.originalEvent.wheelDelta / 120) || (-event.originalEvent.detail / 3);
        } else {
            delta = (event.wheelDelta / 120) || (-event.detail / 3);
        }
        if(delta>0)delta = 1;
        if(delta<0)delta =-1; 
        
        return delta;
    }
    dom.wheelDelta.old = 0;

    /**
     *    将输入区域的光标移动到指定文本后，或将文本框选
     *    @param input      输入区域
     *    @param pos1       框选的起始位置 若只传pos1或者pos1=pos2那么将不执行框选而是移动光标
     *    @param pos2       框选的结束位置
     * */
    dom.setI = function(input,pos1,pos2){
        if(!b.isAvail(pos2)) pos2 = pos1;
        setI(input, pos1, pos2);
        function setI(input, selectionStart, selectionEnd) {
            if ('setSelectionRange' in input) {
                input.focus();
                input.setSelectionRange(selectionStart, selectionEnd);
            }
            else if ('createTextRange' in input) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            }
        }
    }

    /**
     *  dom中Event的操作
     *
     *  @method animation        返回{AnimationEvent Object} : {start, end, iteration}
     *  var eventTypes = dom.event.animation();
     *  if (eventTypes.start !== undefined) {
     *      var foo = dom.$('foo');
     *      foo.addEventListener(eventTypes.start, onAnimStart, false);
     *      foo.addEventListener(eventTypes.end, onAnimEnd, false);
     *  } else {
     *      console.log('not supported');
     *  }
     */
    dom.event = (function(undefined) {
        'use strict';
        function camelCaseAnimationEventTypes(prefix) {
            prefix = prefix || '';

            return {
                start: prefix + 'AnimationStart',
                end: prefix + 'AnimationEnd',
                iteration: prefix + 'AnimationIteration'
            };
        }

        function lowerCaseAnimationEventTypes(prefix) {
            prefix = prefix || '';

            return {
                start: prefix + 'animationstart',
                end: prefix + 'animationend',
                iteration: prefix + 'animationiteration'
            };
        }

        function getAnimation() {
            var prefixes = ['webkit', 'Moz', 'O', ''];
            var style = document.documentElement.style;

            if (style.animationName !== undefined) {
                return lowerCaseAnimationEventTypes();
            }

            for (var i = 0,len = prefixes.length,prefix; i < len; i++) {
                prefix = prefixes[i];
                if (style[prefix + 'AnimationName'] !== undefined) {
                    if (i === 0) {
                        return camelCaseAnimationEventTypes(prefix.toLowerCase());
                    } else if (i === 1) {
                        return lowerCaseAnimationEventTypes();
                    } else if (i === 2) {
                        return lowerCaseAnimationEventTypes(prefix.toLowerCase());
                    }
                }
            }
            return {};
        }
        return {
            animation: getAnimation
        };
    } ());



    /*
     - web -
     */
    /* 网址 */
    web.url = {

        // 以http://192.168.137.189:8888/createjs/#bennyCanvas?ver=2.0 为例

        // 地址栏中完整的链接
        href: window.location.href,
        // URL的协议 -> http:
        rule: window.location.protocol,
        // 主机名称 -> 192.168.137.189 (www.google.com是一个比较常见的主机名称)
        hostname: window.location.hostname,
        // 路径名称 -> /createjs/ (如果是多层文件夹,那么会显示第一层到最终层的所有 /createjs/aa/bb/ccc/...)
        filepath: window.location.pathname,
        // 锚点名称 -> #bennyCanvas
        hash: window.location.hash,
        // ?后面的内容 ->  ?ver=2.0
        para: window.location.search,
        // 端口 -> 8888
        port: window.location.port,
        // 主机名称+端口 -> 192.168.137.189:8888
        host: window.location.host
    }

    /**
     *  打开新页面window.open替换写法~当输入的url没有带协议，默认会补上http://
     */ 
    web.getURL = function() {
        var args = b.slice(arguments);
        var url = args[0];
        var re = new RegExp("(http|ftp|https):\/\/");
        var result = url.search(re);
        if (result == -1) {
            url = 'http://' + url
        }
        args[0] = url;
        Function.prototype.apply.apply(window['open'], [window, args])
    }

    /* 当前页面替换成新的页面 */
    web.getPage = function(url) {
        window.location.href = url;
    };

    /* 刷新、重新载入当前页面 */
    web.reload = function(bool) {
        window.location.reload(bool);
    }




    /*
     *    - mobile Util -
     */

    /**
     *  获取设备是否支持触摸 
     **/
    mobile.ifTouch = (function() {
        var ifTouch = (('ontouchstart' in window) || ('ontouchstart' in document.documentElement) || window.DocumentTouch && document instanceof DocumentTouch);
        return ifTouch;
    }())

    /**
     *  为文档添加css,不支持触摸的设备为'no-touch'，支持的则在触摸时增加一个类名
     *  @param classname        触摸时的CSS类名，将在手指松开后移除这个类名。方便实现CSS控制样式
     **/
    mobile.setTouchCSS = function(classname){
        var ifTouch = mobile.ifTouch,
            activeClass = classname ? classname : 'active';
        if (!ifTouch) {
            document.documentElement.classList.add('no-touch');
        } else {
            var activeElement = null,
                clearActive = function() {
                    if (activeElement) {
                        activeElement.classList.remove(activeClass);
                        activeElement = false;
                    }
                },
                setActive = function(e) {
                    clearActive();
                    if (e.target.tagName == 'A') {
                        activeElement = e.target;
                        activeElement.classList.add(activeClass);
                    }
                };
            
            document.documentElement.classList.add('touch');
            document.body.addEventListener('touchstart', setActive, false);
            document.body.addEventListener('touchmove', clearActive, false);
        }
    }

    /** 设置舞台转向侦听

     @param fn      当舞台转向时执行的回调函数
     @param para        fn的参数
     */
    mobile.initOrientation = function(fn, para) {

        // 侦测是否支持方向变更事件，若不支持就侦听resize事件
        var supportsOrientationChange = "onorientationchange" in window,
            orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

        var checkOrientationChange = function(e) {
            var ua = navigator.userAgent;
            var deviceType = "";

            //判断设备类型

            if (ua.indexOf("iPad") > 0) {
                deviceType = "iPad";
            } else if (ua.indexOf("iPhone") > 0 || ua.indexOf("iPod") > 0) {
                deviceType = "iPhone";
            } else if (ua.indexOf("Android") > 0) {
                deviceType = "Android";
            } else {
                deviceType = "PC";
            }

            if (b.isAvail(fn)) {
                para.device = deviceType;
                fn(para);
            }
        }
        // 监听事件
        window.addEventListener(orientationEvent, checkOrientationChange, false);
        checkOrientationChange();
    }


    /* >>>>>>>>>>>>>>>>>>>>> IOS <<<<<<<<<<<<<<<<<<<<<< */

    var iosUtil = {};
    /*
     * 在IOS设备上获取是否是从主屏幕快捷图标打开了APP
     */
    iosUtil.screenOpen = (function() { return navigator.standalone;}())
    /** 
     *  是否开启大写键盘
     *
     *  @param input         页面input元素
     *  @param bool          true为开启，false为关闭
     */
    iosUtil.capslock = function(input, bool) { input.autocapitalize = bool ? 'on' : 'off'; }

    /** 
     *  禁止长按元素后弹出的操作选项列表
     *  @param target      页面元素
     */
    iosUtil.banCtrlList = function(target) {
        var css = dom.css('touch-callout');
        target.style[css] = 'none';
    }
    /** 
     *  禁止用户选择文本
     *  @param target      页面元素
     */
    iosUtil.banSelect = function(target) {
        var css = dom.css('user-select');
        target.style[css] = 'none';
    }

    /*
     *  获取当前滚动条的值
     */
    iosUtil.scroll = function() {
        return {
            scrollX: window.scrollX,
            scrollY: window.scrollY
        };
    }



    /*
        - plugin -
    */

    /**
     *  为BackboneJS添加_super方法调用父级
     *  @demo
     *  YourModel = Backbone.model.extend({
     *     set: function(arg){
     *         // your code here...
     *         // call the super class function
     *         this._super('set', arg);
     *     }
     *  });
     * */
    plugin.superBackbone = function() {
        if (window['Backbone'] != null && window['Backbone'] != undefined) {
            Backbone.Model.prototype._super = function(funcName) {
                return this.constructor.__super__[funcName].apply(this, b.rest(arguments));
            }
            Backbone.View.prototype._super = function(funcName) {
                return this.constructor.__super__[funcName].apply(this, b.rest(arguments));
            }
        }
    }

    plugin.jQueryClipRect = (function (jQuery) {
        if(!jQuery) return;
        function getStyle(elem, name) {
            return (elem.currentStyle && elem.currentStyle[name]) || elem.style[name];
        }

        function getClip(elem) {
            var cssClip = $(elem).css('clip') || '';

            if (!cssClip) {
                // Try to get the clip rect another way for IE8.
                // This is a workaround for jQuery's css('clip') returning undefined
                // when the clip is defined in an external stylesheet in IE8. -JPOEHLS
                var pieces = {
                    top: getStyle(elem, 'clipTop'),
                    right: getStyle(elem, 'clipRight'),
                    bottom: getStyle(elem, 'clipBottom'),
                    left: getStyle(elem, 'clipLeft')
                };

                if (pieces.top && pieces.right && pieces.bottom && pieces.left) {
                    cssClip = 'rect(' + pieces.top + ' ' + pieces.right + ' ' + pieces.bottom + ' ' + pieces.left + ')';
                }
            }

            // Strip commas and return.
            return cssClip.replace(/,/g, ' ');
        }

        jQuery.fx.step.clip = function (fx) {
            if (fx.pos === 0) {
                var cRE = /rect\(([0-9\.]{1,})(px|em)[,]?\s+([0-9\.]{1,})(px|em)[,]?\s+([0-9\.]{1,})(px|em)[,]?\s+([0-9\.]{1,})(px|em)\)/;

                fx.start = cRE.exec(getClip(fx.elem));
                if (typeof fx.end === 'string') {
                    fx.end = cRE.exec(fx.end.replace(/,/g, ' '));
                }
            }
            if (fx.start && fx.end) {
                var sarr = new Array(), earr = new Array(), spos = fx.start.length, epos = fx.end.length,
                    emOffset = fx.start[ss + 1] == 'em' ? (parseInt($(fx.elem).css('fontSize')) * 1.333 * parseInt(fx.start[ss])) : 1;
                for (var ss = 1; ss < spos; ss += 2) { sarr.push(parseInt(emOffset * fx.start[ss])); }
                for (var es = 1; es < epos; es += 2) { earr.push(parseInt(emOffset * fx.end[es])); }
                fx.elem.style.clip = 'rect(' +
                    parseInt((fx.pos * (earr[0] - sarr[0])) + sarr[0]) + 'px ' +
                    parseInt((fx.pos * (earr[1] - sarr[1])) + sarr[1]) + 'px ' +
                    parseInt((fx.pos * (earr[2] - sarr[2])) + sarr[2]) + 'px ' +
                    parseInt((fx.pos * (earr[3] - sarr[3])) + sarr[3]) + 'px)';
            }
        }
    })(context['jQuery']);



    /*
        - events -
    */
    com.bennyrice.event.Event = function(type, bubbles, cancelable) {
        this.initialize(type, bubbles, cancelable);
    };
    var ep = com.bennyrice.event.Event.prototype;
    ep.type = null;
    ep.target = null;
    ep.currentTarget = null;
    ep.eventPhase = 0;
    ep.bubbles = false;
    ep.cancelable = false;
    ep.timeStamp = 0;
    ep.defaultPrevented = false;
    ep.propagationStopped = false;
    ep.immediatePropagationStopped = false;
    ep.removed = false;
    ep.initialize = function(type, bubbles, cancelable) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.timeStamp = (new Date()).getTime();
    };
    ep.preventDefault = function() { this.defaultPrevented = true; };
    ep.stopPropagation = function() { this.propagationStopped = true; };
    ep.stopImmediatePropagation = function() { this.immediatePropagationStopped = this.propagationStopped = true; };
    ep.remove = function() { this.removed = true; };
    ep.clone = function() { return new Event(this.type, this.bubbles, this.cancelable); };
    ep.toString = function() { return "[Event (type="+this.type+")]"; };
    com.bennyrice.event.Event.create = function(){
        com.create.apply(this,arguments);
    }

    /**
     *  Basic()
     */
    function bennyjsBasic(context) {
        /**
         *  Some Fall Back !!
         *  Array.prototype:  forEach | indexOf | some | map | slice(shim) |
         *  Object:           keys
         */
        // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
        // Production steps of ECMA-262, Edition 5, 15.4.4.18
        // Reference: http://es5.github.com/#x15.4.4.18
        if (!Array.prototype.forEach) {
            Array.prototype.forEach = function forEach(callback, thisArg) {
                'use strict';
                var T, k;
                if (this == null) {
                    throw new TypeError("this is null or not defined");
                }
                var kValue,
                O = Object(this),
                len = O.length >>> 0; // Hack to convert O.length to a UInt32
                if ({}.toString.call(callback) !== "[object Function]") {
                    throw new TypeError(callback + " is not a function");
                }
                if (arguments.length >= 2) {
                    T = thisArg;
                }
                k = 0;
                while (k < len) {
                    if (k in O) {
                        kValue = O[k];
                        callback.call(T, kValue, k, O);
                    }
                    k++;
                }
            };
        }
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(searchElement
            /*, fromIndex */
            ) {
                'use strict';
                if (this == null) { throw new TypeError(); }
                var n, k, t = Object(this),
                len = t.length >>> 0;
                if (len === 0) { return - 1; }
                n = 0;
                if (arguments.length > 1) {
                    n = Number(arguments[1]);
                    if (n != n) { // shortcut for verifying if it's NaN
                        n = 0;
                    } else if (n != 0 && n != Infinity && n != -Infinity) {
                        n = (n > 0 || -1) * Math.floor(Math.abs(n));
                    }
                }
                if (n >= len) { return - 1; }
                for (k = n >= 0 ? n: Math.max(len - Math.abs(n), 0); k < len; k++) {
                    if (k in t && t[k] === searchElement) { return k; }
                }
                return - 1;
            };
        }
        if (!Array.prototype.some) {
            Array.prototype.some = function(fun
            /*, thisp */
            ) {
                'use strict';

                if (this == null) {
                    throw new TypeError();
                }

                var thisp, i, t = Object(this),
                len = t.length >>> 0;
                if (typeof fun !== 'function') {
                    throw new TypeError();
                }

                thisp = arguments[1];
                for (i = 0; i < len; i++) {
                    if (i in t && fun.call(thisp, t[i], i, t)) {
                        return true;
                    }
                }

                return false;
            };
        }
        // Production steps of ECMA-262, Edition 5, 15.4.4.19
        // Reference: http://es5.github.com/#x15.4.4.19
        if (!Array.prototype.map) {
            Array.prototype.map = function(callback, thisArg) {
                var T, A, k;
                if (this == null) {
                    throw new TypeError(" this is null or not defined");
                }
                var O = Object(this);
                var len = O.length >>> 0;
                if (typeof callback !== "function") {
                    throw new TypeError(callback + " is not a function");
                }
                if (thisArg) { T = thisArg; }
                A = new Array(len);
                k = 0;
                while (k < len) {
                    var kValue, mappedValue;
                    if (k in O) {
                        kValue = O[k];
                        mappedValue = callback.call(T, kValue, k, O);
                        A[k] = mappedValue;
                    }
                    k++;
                }
                return A;
            };
        }
        /**
         * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
         * on host objects like NamedNodeMap, NodeList, and HTMLCollection
         * (technically, since host objects have been implementation-dependent (at least before ES6),
         * IE hasn't needed to work this way). Also works on strings,
         * fixes IE < 9 to allow an explicit undefined for the 2nd argument
         * (as in Firefox), and prevents errors when called on other
         * DOM objects.
        */
        (function() {
            'use strict';
            var _slice = Array.prototype.slice;
            try {
                _slice.call(document.documentElement);
            } catch(e) { // Fails in IE < 9
                Array.prototype.slice = function(begin, end) {
                    var i, arrl = this.length,
                    a = [];
                    if (this.charAt) { 
                        for (i = 0; i < arrl; i++) { a.push(this.charAt(i)); }
                    } else { 
                        for (i = 0; i < this.length; i++) { a.push(this[i]); }
                    }
                    return _slice.call(a, begin, end || a.length); 
                };
            }
        } ());
        // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
        if (!Object.keys) {
            Object.keys = (function() {
                'use strict';
                var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({
                    toString: null
                }).propertyIsEnumerable('toString'),
                dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
                dontEnumsLength = dontEnums.length;

                return function(obj) {
                    if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                        throw new TypeError('Object.keys called on non-object');
                    }
                    var result = [],
                    prop,
                    i;
                    for (prop in obj) {
                        if (hasOwnProperty.call(obj, prop)) {
                            result.push(prop);
                        }
                    }
                    if (hasDontEnumBug) {
                        for (i = 0; i < dontEnumsLength; i++) {
                            if (hasOwnProperty.call(obj, dontEnums[i])) {
                                result.push(dontEnums[i]);
                            }
                        }
                    }
                    return result;
                };
            } ());
        }

        /*
         *  some underscore utils and fix
         *  http://github.com/documentcloud/underscore/
         */
        var ArrayProto = Array.prototype,
            ObjProto = Object.prototype,
            FuncProto = Function.prototype,
            breaker = {};
        var push = ArrayProto.push,
            slice = ArrayProto.slice,
            concat = ArrayProto.concat,
            unshift = ArrayProto.unshift,
            toString = ObjProto.toString,
            hasOwnProperty = ObjProto.hasOwnProperty,
            nativeSome = ArrayProto.some,
            arrIndexOf = ArrayProto.indexOf;

        b.slice = function(context){
            var args = slice.call(arguments,1);
            return slice.apply(context,args);
        }
        b.identity = function(value) {
            return value;
        };
        // obj是否本身拥有key属性（不追溯原型）
        b.has = function(obj, key) {
            return hasOwnProperty.call(obj, key);
        };
        // obj是否是Window对象
        b.isWindow = function(obj) {
            return obj != null && obj === obj.window;
        };
        // obj是否是dom元素
        b.isElement = b.isEle = function(obj) {
            return !!(obj && obj.nodeType === 1);
        };
        // obj是否是一个Object
        b.isObject = function(obj) {
            return obj === Object(obj);
        };
        // obj是否是{key:value}形式的Object
        b.isPlainObject = function(obj) {
            if (!b.isObject(obj) || b.isElement(obj) || b.isWindow(obj))  return false;
            try {
                if (obj.constructor && !has(obj, "constructor") && !has(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                return false;
            }
            return true;
        };
        // obj是否是 参数 数组 函数 字符串 数字 日期 正则
        ['Arguments', 'Array', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function(name) {
            b['is' + name] = function(obj) {
                return {}.toString.call(obj) == '[object ' + name + ']';
            };
        });

        var has           = b.has,
            isWindow      = b.isWindow,
            isElement     = b.isElement,
            isObject      = b.isObject,
            isPlainObject = b.isPlainObject,
            isArray       = b.isArray,
            isFunction    = b.isFunction,
            isString      = b.isString,
            isNumber      = b.isNumber,
            isArguments   = b.isArguments;

        // fit IE
        if (!isArguments(arguments)) {
            isArguments = function(obj) {
                return !!(obj && b.has(obj, 'callee'));
            };
        }
        // Optimize
        if (typeof(/./) !== 'function') {
            isFunction = function(obj) {
                return typeof obj === 'function';
            };
        }
        // obj是否是NaN类型
        b.isNaN = function(obj) {
            return isNumber(obj) && obj != +obj;
        };
        // obj是否是Boolean
        b.isBoolean = function(obj) {
            return obj === true || obj === false || {}.toString.call(obj) == '[object Boolean]';
        };
        // obj是否是null
        b.isNull = function(obj) {
            return obj === null;
        };
        // obj是否是undefined
        b.isUndefined = function(obj) {
            return obj === void 0;
        };
        // obj是否可用
        b.isAvail = b.isAvailable = function(obj) {
            return (isNull(obj) || isUndefined(obj) || isNaN(obj)) ? false : true
        };
        // obj是否为空
        b.isEmpty = function(obj) {
            if (obj == null) return true;
            if (isArray(obj) || isString(obj)) return obj.length === 0;
            for (var key in obj) if (has(obj, key)) return false;
            return true;
        };
        // 获取obj的类型
        b.getType = function(obj){
            var check =['isArray','isString','isPlainObject','isElement','isDate','isNumber'];
            for(var i=0,len=check.length;i<len;i++){
                var fn = check[i];
                if(b[fn](obj)){
                    return (fn.replace('is',''));
                }
            }
            return '*';
        };
        var isNaN = b.isNaN,
            isBoolean = b.isBoolean,
            isNull = b.isNull,
            isUndefined = b.isUndefined, 
            isAvail = b.isAvailable,
            getType = b.getType;

        var objMap = ['Window','Element','Object','PlainObject','Arguments','Array','Function',
                      'String','Number','Date','RegExp','NaN','Boolean','Null','Undfined'];
        /**
         *  判断child是否是obj
         *  @param child        需要判断的对象
         *  @param classname    类名
         */
        b.is = function(child,classname){
            if(b.contains(objMap,classname)){
                var method = 'is'+ classname;
                return b[method](child);
            } else {
                return child instanceof window[classname];
            }
        }
        /**
         *  对Object或者Array的每个子对象执行函数
         *  @note       在循环中,参数函数中是无法用return跳出整个loop的
         */
        var each = b.each = b.forEach = function(obj, iterator, context) {
            if (obj == null) return;
            if (isArray(obj)) {
                obj.forEach(iterator, context);
            } else {
                for (var key in obj) {
                    if (has(obj, key)) {
                        if (iterator.call(context, obj[key], key, obj) === breaker) return;
                    }
                }
            }
        };
        /**
         *  对obj或者array每个子对象执行函数
         *  @note       在循环中,参数函数中是无法用return跳出整个loop的
         *  @return     {Array} 如果迭代函数有返回，会在整个map执行后返回一个包含返回值的数组，这也是和each的区别
         */
        var map = b.map = function(obj, iterator, context) {
            var results = [];
            if (obj == null) return results;
            if (isArray(obj)) return obj.map(iterator, context);
            each(obj, function(value, index, list) {
                results[results.length] = iterator.call(context, value, index, list);
            });
            return results;
        };
        
        /**
         *  在 list 里的每一项进行查找, 返回一个符合测试 (return true) 条件的所有元素的集合.
         */
        b.filter = function(obj, iterator, context) {
            var results = [];
            if (obj == null) return results;
            if (obj.filter === ArrayProto.filter) return obj.filter(iterator, context);
            each(obj, function(value, index, list) {
                if (iterator.call(context, value, index, list)) results[results.length] = value;
            });
            return results;
        };
        /**
         *  获取obj某属性的值。如果值是函数则返回函数值
         **/
        var result = b.result = function(obj, property) {
            if (obj == null) return null;
            var value = obj[property];
            return isFunction(value) ? value.call(obj) : value;
        };

        var eq = function(a, b, aStack, bStack) {
            if (a === b) return a !== 0 || 1 / a == 1 / b;
            if (a == null || b == null) return a === b;
            var className = toString.call(a);
            if (className != toString.call(b)) return false;
            switch (className) {
                case '[object String]':
                    return a == String(b);
                case '[object Number]':
                    return a != +a ? b != +b: (a == 0 ? 1 / a == 1 / b: a == +b);
                case '[object Date]':
                case '[object Boolean]':
                    return + a == +b;
                case '[object RegExp]':
                    return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
            }
            if (typeof a != 'object' || typeof b != 'object') return false;
            var length = aStack.length;
            while (length--) {
                if (aStack[length] == a) return bStack[length] == b;
            }
            aStack.push(a);
            bStack.push(b);
            var size = 0,
                result = true;
            if (className == '[object Array]') {
                size = a.length;
                result = size == b.length;
                if (result) {
                    while (size--) {
                        if (! (result = eq(a[size], b[size], aStack, bStack))) break;
                    }
                }
            } else {
                var aCtor = a.constructor,
                    bCtor = b.constructor;
                if (aCtor !== bCtor && !(isFunction(aCtor) && (aCtor instanceof aCtor) && isFunction(bCtor) && (bCtor instanceof bCtor))) {return false;}
                for (var key in a) {
                    if (has(a, key)) {
                        size++;
                        if (! (result = has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                    }
                }
                if (result) {
                    for (key in b) {
                        if (has(b, key) && !(size--)) break;
                    }
                    result = !size;
                }
            }
            aStack.pop();
            bStack.pop();
            return result;
        };
        /**
         *  判断两个对象是否相当(非全等)
         */
        var isEqual = b.isEqual = function(a,b){
            return eq(a,b,[],[]);
        }
        // util invoke
        var flatten = function(input, shallow, output) {
            each(input, function(value) {
                if (isArray(value)) {
                    shallow ? push.apply(output, value) : flatten(value, shallow, output);
                } else {
                    output.push(value);
                }
            });
            return output;
        };
        /**
         *  将一个嵌套多层的数组 array (嵌套可以是任何层数)转换为只有一层的数组. 
         *  @param array       执行操作的数组
         *  @param shallow     默认为false ，如果为true, 数组只转换第一层.
         */
        b.flatten = function(array, shallow) {
            return flatten(array, shallow, []);
        };


        // 获取arr内指定对象的键的值的集合
        var pluck = b.pluck = function(obj, key) {
            return map(obj, function(value) {
                return value[key];
            });
        };
        // 过滤掉参数里的键，返回一个副本
        var omit = b.omit = function(obj /*,keys1,keys2,...*/ ) {
            var copy = {};
            var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
            for (var key in obj) {
                if (!b.contains(keys, key)) copy[key] = obj[key];
            }
            return copy;
        };
        // 与omit相反,获取指定键所组成的一个副本
        var pick = b.pick = function(obj/*,keys1,keys2,...*/) {
            var copy = {};
            var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
            each(keys, function(key) {
                if (key in obj) copy[key] = obj[key];
            });
            return copy;
        };
        // 返回数组除了前面n个元素之外的其余元素，n默认为1
        b.rest = function(array, n, guard) {
            return slice.call(array, (n == null) || guard ? 1 : n);
        };
        // 合并两个数组或字符串
        b.merge = function(value1,value2){
            if(isArray(value1) && isArray(value2)){
                value1 = slice.call(value1);
                push.apply(value1,value2);
                return arr1;
            }else if(isString(value1) && isString(value2)){
                return str.concat(addChar);
            }
        };
        /**
         *  如果任何 list 里的任何一个元素通过了 iterator 的测试, 将返回 true. 
         *  一旦找到了符合条件的元素, 就直接中断对list的遍历. 
         *  @note   当list为数组时, 如果存在, 将会使用原生的some方法.
         */
        var any = b.some = b.any = function(obj, iterator, context) {
            iterator || (iterator = b.identity);
            var result = false;
            if (obj == null) return result;
            each(obj,
            function(value, index, list) {
                if (result || (result = iterator.call(context, value, index, list))) return breaker;
            });
            return !!result;
        };
        /**
         *  对象是否包含target这个对象
         *  @param obj          { String | Array | Object } 要检测的集合或者字符串
         *  @param target       { String | Array | Object } 检测对象或者文本内容
         *  @param option       { Boolean } 是否使用isEqual方法来判断对象相等，默认为false不使用
         */
        b.contains = function(obj, target, option) {
            var useEqual = false;
            if (isAvail(option)) useEqual = option;
            if (obj == null) return false;
            if (isString(obj)){
                if(!isString(target)) return false;
                if (target == '') { return true;}
                else{ return obj.indexOf(target) !== -1; }
            }else{
                if(useEqual===false){
                    if (arrIndexOf && obj.indexOf === arrIndexOf) return obj.indexOf(target) != -1;
                    return any(obj, function(value) {
                        return value === target;
                    });
                }else{
                    return any(obj, function(value) {
                        return b.isEqual(value,target);
                    });
                }   
            }
        };
        /**
         *  返回 array 去重后的副本, 使用 === 做相等测试. 
         *  @param isSorted     [Option]如果您确定 array 已经排序, 给 isSorted 参数传如 true, 此函数将使用更快的算法. 
         *  @param iterator     [Option]如果要处理对象元素, 传参 iterator 来获取要对比的属性.
         */
        b.uniq = function(array, isSorted, iterator, context) {
            var initial = iterator ? b.map(array, iterator, context) : array;
            var results = [];
            var seen = [];
            each(initial, function(value, index) {
                if (isSorted ? (!index || seen[seen.length - 1] !== value) : !b.contains(seen, value)) {
                    seen.push(value);
                    results.push(array[index]);
                }
            });
            return results;
        };
        // 取数组与数组的交集
        b.intersection = function(array) {
            var rest = slice.call(arguments, 1);
            var uniqArr = b.uniq(array);
            return uniqArr.filter(function(item) {
                return rest.every(function(other) {
                    return other.indexOf(item) >= 0;
                });
            });
        };
        b.clearArr = function(arr){
            arr.length=0;
            return arr;
        }
        /**
         *  删除 Array/Object/String 中的指定内容
         *  @param list      需要执行删除动作的对象 {Array}|{PlainObject}|{String}。
         *  @param value     []/{} :   需要删除的对象在集合中对应的值(**并不是键名**)。
         *                   String:   需要删除的字符串内容。
         *  @return          list对象 (当为String时,原始对象不发生变化)
         * */
        b.remove = function(list,value) {
            if(isString(list)) {
                return list.split(value).join('');
            }
            else if(isArray(list)){
                if(list.length<1 ) return;
                list = b.uniq(list);
                for (var i = 0,len=list.length; i < len; i++) {
                    var cur = list[i];
                    if (isEqual(cur,value)) {         
                        list.splice(i, 1);
                        i--;
                    }
                }
                return list;
            }
            else if(isPlainObject(list)){
                b.filter(list,function(v,k,o){
                    if(isEqual(v,value)) {
                        delete o[k]; 
                        return true;
                    };
                })
                return list;
            }
            else{
                return null;
            }
            
        };
        /**
         *  将PlainObj转化成字符串
         *  @return {String}
         * */
        b.objToStr = function(temp) {
            if (isNull(temp)) {
                temp = 'null';
            } else if (isUndefined(temp)) {
                temp = 'undefined';
            } else if (isNaN(temp)){
                temp = 'NaN';
            } else if (isPlainObject(temp)){
                var out = [];
                for (var p in temp) {
                    if (temp['hasOwnProperty']) {
                        if (temp.hasOwnProperty(p)) {
                            out.push(p + ':' + temp[p]);
                        }
                    } else {
                        out.push(p + ':' + temp[p]);
                    }
                }
                temp = out.join(',');
            } 
            return temp;
        }
        /**
         *  更改plainObject的键名
         *  demo:{x:123,y:45} -> changeKey({x:123,y:45},'x','left') -> {left:123,y:45}
         *
         *  @param obj       目标对象
         *  @param key       要更改的键名
         *  @param k2        新的键名
         *  @return {obj}    经过修改后的对象（原始对象会被修改）
         */
        b.changeKey = function(obj, key, k2) {
            obj[k2] = obj[key];
            delete obj[key];
            return obj;
        }
        /**
         *   在char中的at位置插入字符串text
         *   @param str      执行操作的字符串
         *   @param text      待检测的字符串
         *   @param at        插入的位置
         *   @return         string (char保持不变)
         * */
        b.insertChar = function(str, text, at) {
            if (at == null || at > str.length)
                at = str.length;
            else if (at < 0)
                at = 0;
            return str.substring(0, at) + text + str.substring(at);
        }
        /**
         *   检测char中有几个text
         *   @param str      执行操作的字符串
         *   @param text      待检测的字符串
         *   @return         int
         * */
        b.countChar = function(str, text) {
            if (this.hasChar(str, text))
                return str.split(text).length - 1;
            else
                return 0;
        }
        /**
         *   去掉char左侧多余的空格
         *   @param str      执行操作的字符串
         *   @return         str(本身将会改变)
         * */
        b.leftTrim = function(str) {
            return str.replace(/^\s+/, '');
        }
        /**
         *   去掉char右侧多余的空格
         *   @param str      执行操作的字符串
         *   @return         str(本身将会改变)
         * */
        b.rightTrim = function(str) {
            return str.replace(/\s+$/, '');
        }
        /**
         *   去掉char左右两侧以及单词之间多余的空格
         *   will trim() + remove (+1) white-spaces in between
         *   @param str      执行操作的字符串
         *   @return         str(本身将会改变)
         * */
        b.allTrim = function(str) {
            return str.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
        }
        /**
         *   检测char是否是以text为开头
         *   @param str      执行操作的字符串
         *   @param text      待检测的字符串
         *   @return         true | false
         * */
        b.startChar = function(str, text) {
            if (text == '') return true;
            else if (text == null || text.length > str.length) return false;
            else return str.substring(0, text.length) == text;
        }
        /**
         *   检测char是否是以text为结尾
         *   @param str      执行操作的字符串
         *   @param text      待检测的字符串
         *   @return         true | false
         * */
        b.endChar = function(str, text) {
            if (text == '') return true;
            else if (text == null || text.length > str.length) return false;
            else return str.indexOf(text, str.length - text.length) !== -1;
        }
        /**
         *  获取函数的函数名
         *  @param fun
         *  @returns {*}
         */
        b.getFunName = function(fun) {
            if (fun.name) return fun.name;
            var definition = fun.toString().split("\n")[0];
            var exp = /^function ([^\s(]+).+/;
            if (exp.test(definition)) return definition.split("\n")[0].replace(exp, "$1") || "anonymous";
            return "anonymous";
        }
        /**
         *  {PlainObject}拷贝对象 | {Array}合并数组 | {String}合并字符串。
         *  @syntax  bj.mixin(true,obj1,obj2,...)  | bj.mixin(obj1,obj2,...)
         *  @note    当为PlainObject时可以传入第一个参数选择是否深度拷贝
         *  @returns {*}
         */
        b.mixin = function( /*deep,target,source..*/ ) {
            var deep, targetObj, sources, toClone, args = slice.call(arguments),
                isArr;
            if (isBoolean(args[0])) {
                deep = args[0];
                targetObj = args[1];
                sources = args.slice(2);
            } else {
                deep = false;
                targetObj = args[0];
                sources = args.slice(1);
            }
            if(isPlainObject(targetObj)){
                for (var i = 0, len = sources.length; i < len; i++) {
                    var source = sources[i]
                    if (isObject(source)) {
                        for (var prop in source) {
                            var src = targetObj[prop];
                            var copy = source[prop];
                            if (targetObj === copy) {
                                continue;
                            }
                            // 深度拷贝
                            if (deep && copy && (isPlainObject(copy) || (isArr = isArray(copy)))) {
                                toClone = isArr ? (src && isArray(src) ? src : []) : (src && isPlainObject(src) ? src : {})
                                targetObj[prop] = b.mixin(deep, toClone, copy)
                            } else if (copy != undefined) {
                                targetObj[prop] = copy;
                            }
                        }
                    }
                }
                return targetObj;
            }
            else if(isArray(targetObj)){
                targetObj = slice.call(targetObj);
                for (var i = 0, len = sources.length; i < len; i++) {
                    var source = sources[i];
                    push.apply(targetObj,source);
                }
                return targetObj;
            }
            else if(isString(targetObj)){
                var str = targetObj;
                for (var i = 0, len = sources.length; i < len; i++) {
                    var source = sources[i];
                    str = str.concat(source);
                }
                return str;
            }
        };
        /**
         *  克隆对象。
         *  @param obj       复制源  
         *  @param _deep     是否深度克隆
         *  @returns {*}
         */
        var clone = b.clone = function(obj,_deep) {
            var deep = isAvail(_deep) ? _deep : false;
            if (!isObject(obj)) return obj;
            return isArray(obj) ? obj.slice() : b.mixin(deep, {}, obj);
        };
        /**
         *  打印对象详细内容
         *  @param temp
         *  @returns {string}
         */
        b.printObj = function(temp) {
            var start = '',
                end = '';
            // object
            if (isArray(temp)) {
                start = 'Array:[';
                end = ']';
            } else if (isFunction(temp)) {
                start = 'Function :';
            } else if (isElement(temp)) {
                start = 'HTML'+temp.nodeName+'Element :';
                if(temp.outerHTML['replace']){
                    temp = temp.outerHTML.replace(temp.innerHTML,'...')
                }
                
            } else if (isString(temp)) {
                start = 'String :"';
                end = '"';
            } else if (isPlainObject(temp)) {
                /* 打印obj对象具体属性 */
                start = 'Object:{';
                end = '}';
                var out = [];
                for (var p in temp) {
                    if (temp['hasOwnProperty']) {
                        if (temp.hasOwnProperty(p)) {
                            out.push(p + ':' + temp[p]);
                        }
                    } else {
                        out.push(p + ':' + temp[p]);
                    }
                }
                temp = out.join(',');
            } else if (isNull(temp)) {
                temp = 'null';
            } else if (isUndefined(temp)) {
                temp = 'undefined';
            }
            return start + temp + end;
        }

        /**
         *  映射obj对象,当它的属性是函数时将这个属性的值转换成函数的结果
         **/
        var mapResult = b.mapResult = function(obj) {
            if(!isAvail(obj)) return null;
            if(isFunction(obj)) return obj();
            if(isNumber(obj)) return obj;
            var oo = b.clone(obj);
            each(oo, function(num, key,o) {
                o[key] = result(o, key);
            });
            return oo;
        }

        // 兼容的console.log方法
        b.trace = function trace( /*,args*/ ) {
            if (typeof console == "undefined") return;
            var arg = Array.prototype.splice.call(arguments, 0, arguments.length);
            // IE fix
            if (!console.log['apply']) {
                var params = [];
                for (var x = 0; x < arg.length; x++) {
                    var temp = arg[x];
                    params.push(b.printObj(temp));
                }
                params = params.length > 0 ? " " + params.join("，") + " " : "";
                console.log(params)
            // 其他浏览器
            } else {
                arg.unshift('trace: ');
                console.log.apply(console, arg);
            }
        };
        window.trace = b.trace;

        /*
            - math -
        */
        /** 
         *  强制转换成Number
         *  @param v    要转换的内容
         *  @param f    [Option]固定小数点位数
         *  @return     {Number} or {NaN}
         */
        math.toNum = function(v,f) {
            var num = parseFloat(v);
            if(f){
                num = parseFloat(num.toFixed(f));
            }
            return num;
        };

        /* 强制转换成Int */
        math.toInt = function(v) {
            return parseInt(v, 10);
        };

        /**
         * 将数值限制在一个区间内
         *
         * @param v     数值
         * @param min   最大值
         * @param max   最小值
         *
         */
        math.bound = function(v, min, max) {
            v = this.toNum(v);
            min = this.toNum(min);
            max = this.toNum(max);

            return Math.min(Math.max(v, min), max);
        }

        // v是否处于min,max区间内
        math.inRange = function(v,min,max,offset){
            if(!b.isAvail(offset)) offset = 0;
            var min_sign = min>0? 1:-1;
            var max_sign = max>0? 1:-1;
            max = (Math.abs(max)+offset)*max_sign;
            min = (Math.abs(min)+offset)*min_sign;
            if( v<=max && v>=min ){ 
                return true;
            }else{
                return false;
            }
        }

        /**
         *   目标值在给定范围内的百分比
         *
         *   @param number        当前值
         *   @param min           范围最小值
         *   @param max           范围最大值
         *   @return             一个0-1之间的小数
         *
         * */
        math.rangeToPercent = function(number, min, max) {
            return ((number*100 - min*100) / (max*100 - min*100));
        }

        /**
         *   目标百分比在给定范围内的值
         *
         *   @param percent       当前百分比 (0-1之间的小数)
         *   @param min           范围最小值
         *   @param max           范围最大值
         *   @return             百分比值对应的处于min与max之间的数
         *
         * */
        math.percentToRange = function(percent, min, max) {
            return ((max - min) * percent*100 + min*100)/100;
        }

        /**
         *  返回指定区间(闭区间)内随机一个数字
         *
         *  @param  min         区间的最小值
         *  @param  max         区间的最大值
         *  @return             随机数
         */
        math.random = function(min, max) {
            var num = (Math.random() * (max - min + 1) + min);
            if (num > max) {
                return max
            } else {
                return num
            }
        }

        /**
         *  返回0-360之间的角度
         *
         *  @param  angle       需要转换为0-360度之间的角度
         *  @return
         */
        math.to360 = function(angle) {
            angle %= 360;
            return angle < 0 ? angle + 360 : angle;
        }

        /**
         *  返回flash坐标系的角度范围（-180~180）
         *
         *  @param  angle       需要转化为flash角度范围的角度
         *  @return
         */
        math.to180 = function(angle) {
            angle %= 360; //得到-359~359的角度
            if (angle >= 0) {
                return angle > 180 ? angle - 360 : angle;
            } else {
                return angle < -180 ? angle + 360 : angle;
            }
        }

        /**
         *  弧度转角度 radians->degrees
         *
         *  @param  radian      已知弧度值
         *  @return             返回角度值
         */
        math.deg = function(radian) {
            return (radian * 180) / Math.PI;
        }

        /**
         *  角度转弧度 degrees->radians
         *
         *  @param  angle       已知角度值
         *  @return             返回弧度值
         */
        math.rad = function(angle) {
            return (angle * Math.PI) / 180;
        }

        /**
         *  计算两点间距离
         *
         *  @param  target1 (x1,y1) 点1
         *  @param  target2 (x2,y2) 点2
         *  @return                 两点间长度值
         */
        math.distance = function(x1, y1, x2, y2) {
            var dis = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
            return dis;
        }

        /**
         *  计算两点间的夹角（角度制）;
         *
         *  @param  target1 (x1,y1) 目标点
         *  @param  target2 (x2,y2) 当前点 (可以把当前点理解为按当前点为原点计算)
         *  @return                 当前点到目标点的夹角
         */
        math.btAngle = function(x1, y1, x2, y2) {
            var radian = Math.atan2((y2 - y1), (x2 - x1));
            return this.rToA(radian);
        }

        /**
         *  已知一个点的坐标,这个点与另一个点的夹角与距离,求另一个点的坐标;
         *
         *  @param  cx              第一个点的x坐标
         *  @param  cy              第一个点的y坐标
         *  @param  dis             第一个点与另一个点之间的距离
         *  @param  angle           第一个点与另一个点之间的夹角
         *  @return {x:..,y:..}     返回另一个点的坐标点
         */
        math.anotherP = function(cx, cy, dis, angle) {
            var xx = Math.cos(angle * Math.PI / 180) * dis + cx;
            var yy = Math.sin(angle * Math.PI / 180) * dis + cy;
            return {
                x: xx,
                y: yy
            };
        }

        /**
         *  旋转坐标
         *
         *  @param  rotation_v      旋转的弧度大小
         *  @param  disx            当前点相对于旋转中心的x位置
         *  @param  disy            当前点相对于旋转中心的y位置
         *  @return {x:..,y:..}     返回旋转后的坐标
         */
        math.rotator = function(rotation_v, disx, disy) {
            var x1 = Math.cos(rotation_v) * disx - Math.sin(rotation_v) * disy;
            var y1 = Math.cos(rotation_v) * disy + Math.sin(rotation_v) * disx;
            return {
                x: x1,
                y: y1
            };
        }

        /**
         *  将matrix2D转化成Array
         **/
        math.matrixToArr = function(matrix) {
            return matrix.substr(7, matrix.length - 8).split(', ');
        }

        /**
         *  获取matrix2D中的定位信息
         **/
        math.matrixPosition = function(matrix) {
            var values = geom.matrixToArr(matrix);
            var angle = 0;
            if (values) {
                var a = values[0];
                var b = values[1];
                var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            }
            angle = (angle < 0) ? angle += 360 : angle;
            var x = values[4];
            var y = values[5];
            var scaleX = values[0];
            var scaleY = values[3];
            return {
                x: x,
                y: y,
                scaleX: scaleX,
                scaleY: scaleY,
                rotate: angle
            };
        }
        /**
         *  缓动类型
         **/
        math.ease = {
            linear: 'linear',
            Quad:{
                easeIn: 'easeInQuad',
                easeOut: 'easeOutQuad',
                easeInOut: 'easeInOutQuad'
            },
            Cubic:{
                easeIn: 'easeInCubic',
                easeOut: 'easeOutCubic',
                easeInOut: 'easeInOutCubic',
                easeOutIn: 'easeOutInCubic'
            },
            Quart:{
                easeIn: 'easeInQuart',
                easeOut: 'easeOutQuart',
                easeInOut: 'easeInOutQuart',
                easeOutIn: 'easeOutInQuart'
            },
            Quint:{
                easeIn: 'easeInQuint',
                easeOut: 'easeOutQuint',
                easeInOut: 'easeInOutQuint',
                easeOutIn: 'easeOutInQuint'
            },
            Sine:{
                easeIn: 'easeInSine',
                easeOut: 'easeOutSine',
                easeInOut: 'easeInOutSine',
                easeOutIn: 'easeOutInSine'
            },
            Expo:{
                easeIn: 'easeInExpo',
                easeOut: 'easeOutExpo',
                easeInOut: 'easeInOutExpo',
                easeOutIn: 'easeOutInExpo'
            },
            Circ:{
                easeIn: 'easeInCirc',
                easeOut: 'easeOutCirc',
                easeInOut: 'easeInOutCirc',
                easeOutIn: 'easeOutInCirc'
            },
            Elastic:{
                easeIn: 'easeInElastic',
                easeOut: 'easeOutElastic',
                easeInOut: 'easeInOutElastic',
                easeOutIn: 'easeOutInElastic'
            },
            Back:{
                easeIn: 'easeInBack',
                easeOut: 'easeOutBack',
                easeInOut: 'easeInOutBack',
                easeOutIn: 'easeOutInBack'
            },
            Bounce:{
                easeIn: 'easeInBounce',
                easeOut: 'easeOutBounce',
                easeInOut: 'easeInOutBounce',
                easeOutIn: 'easeOutInBounce'
            }
        }
        /**
         *  缓动函数
         **/
        math.easeFn = {
            /*
             t - current time of tween
             b - starting value of property
             c - change needed in value
             d - total duration of tween
             */
            linear: function(t, b, c, d) {
                return c * t / d + b;
            },
            easeInQuad: function(t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOutQuad: function(t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOutQuad: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            },
            easeInCubic: function(t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOutCubic: function(t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOutCubic: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t + 2) + b;
            },
            easeOutInCubic: function(t, b, c, d) {
                if (t < d / 2) return Tweener.easingFunctions.easeOutCubic(t * 2, b, c / 2, d);
                return Tweener.easingFunctions.easeInCubic((t * 2) - d, b + c / 2, c / 2, d);
            },
            easeInQuart: function(t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOutQuart: function(t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOutQuart: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            },
            easeOutInQuart: function(t, b, c, d) {
                if (t < d / 2) return Tweener.easingFunctions.easeOutQuart(t * 2, b, c / 2, d);
                return Tweener.easingFunctions.easeInQuart((t * 2) - d, b + c / 2, c / 2, d);
            },
            easeInQuint: function(t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOutQuint: function(t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOutQuint: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            },
            easeOutInQuint: function(t, b, c, d) {
                if (t < d / 2) return Tweener.easingFunctions.easeOutQuint(t * 2, b, c / 2, d);
                return Tweener.easingFunctions.easeInQuint((t * 2) - d, b + c / 2, c / 2, d);
            },
            easeInSine: function(t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
            },
            easeOutSine: function(t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            },
            easeInOutSine: function(t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
            },
            easeOutInSine: function(t, b, c, d) {
                if (t < d / 2) return Tweener.easingFunctions.easeOutSine(t * 2, b, c / 2, d);
                return Tweener.easingFunctions.easeInSine((t * 2) - d, b + c / 2, c / 2, d);
            },
            easeInExpo: function(t, b, c, d) {
                return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
            },
            easeOutExpo: function(t, b, c, d) {
                return (t == d) ? b + c : c * 1.001 * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeInOutExpo: function(t, b, c, d) {
                if (t == 0) return b;
                if (t == d) return b + c;
                if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b - c * 0.0005;
                return c / 2 * 1.0005 * (-Math.pow(2, -10 * --t) + 2) + b;
            },
            easeOutInExpo: function(t, b, c, d) {
                if (t < d / 2) return Tweener.easingFunctions.easeOutExpo(t * 2, b, c / 2, d);
                return Tweener.easingFunctions.easeInExpo((t * 2) - d, b + c / 2, c / 2, d);
            },
            easeInCirc: function(t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOutCirc: function(t, b, c, d) {
                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOutCirc: function(t, b, c, d) {
                if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            },
            easeOutInCirc: function(t, b, c, d) {
                if (t < d / 2) return Tweener.easingFunctions.easeOutCirc(t * 2, b, c / 2, d);
                return Tweener.easingFunctions.easeInCirc((t * 2) - d, b + c / 2, c / 2, d);
            },
            easeInElastic: function(t, b, c, d, a, p) {
                var s;
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (!a || a < Math.abs(c)) {
                    a = c;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(c / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOutElastic: function(t, b, c, d, a, p) {
                var s;
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (!a || a < Math.abs(c)) {
                    a = c;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(c / a);
                return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
            },
            easeInOutElastic: function(t, b, c, d, a, p) {
                var s;
                if (t == 0) return b;
                if ((t /= d / 2) == 2) return b + c;
                if (!p) p = d * (.3 * 1.5);
                if (!a || a < Math.abs(c)) {
                    a = c;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(c / a);
                if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
            },
            easeOutInElastic: function(t, b, c, d, a, p) {
                if (t < d / 2) return Tweener.easingFunctions.easeOutElastic(t * 2, b, c / 2, d, a, p);
                return Tweener.easingFunctions.easeInElastic((t * 2) - d, b + c / 2, c / 2, d, a, p);
            },
            easeInBack: function(t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },
            easeOutBack: function(t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOutBack: function(t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            },
            easeOutInBack: function(t, b, c, d, s) {
                if (t < d / 2) return Tweener.easingFunctions.easeOutBack(t * 2, b, c / 2, d, s);
                return Tweener.easingFunctions.easeInBack((t * 2) - d, b + c / 2, c / 2, d, s);
            },
            easeInBounce: function(t, b, c, d) {
                return c - Tweener.easingFunctions.easeOutBounce(d - t, 0, c, d) + b;
            },
            easeOutBounce: function(t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            },
            easeInOutBounce: function(t, b, c, d) {
                if (t < d / 2) return Tweener.easingFunctions.easeInBounce(t * 2, 0, c, d) * .5 + b;
                else return Tweener.easingFunctions.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
            },
            easeOutInBounce: function(t, b, c, d) {
                if (t < d / 2) return Tweener.easingFunctions.easeOutBounce(t * 2, b, c / 2, d);
                return Tweener.easingFunctions.easeInBounce((t * 2) - d, b + c / 2, c / 2, d);
            }
        };
        /**
         *  返回指定缓动函数
         *  @param ease     math.easeFn内的函数名字
         **/
        math.getEase = function(ease){
            return math.easeFn[ease];
        }

        /* COM */
        context.com = function ClassObject() {};
        /**
         * 创建全局命名空间.
         *
         * @param ns [string] the namespace (e.g. 'com.foo')
         * @param root [object,optional] the global object
         * @return ns的第一个名字的对象-> com.bennyrice.xxx : com对象
         */
        // com:Function
        com.pack = function(nsstr, root) {
            var i, p, t, rootctx, name;
            nscomponents = nsstr.split('.'); // [com,bennyrice]
            // either use the specified global namespace, or the real one:
            p = rootctx = root ? root : (Function('return this')());
            for (i = 0; i < nscomponents.length; i++) {
                name = nscomponents[i];
                t = p[name];
                if (!isAvail(t)) {
                    if (name == 'com') {
                        //p[name] = function ClassObject(){};
                    } else {
                        p[name] = {};
                    }
                } else if (!isObject(t)) {
                    throw 'namespace "' + name + '" already defined but not an object';
                }
                p = p[name]; //
            }
            return rootctx[nscomponents[0]];
        }

        /**
         *  Simple JavaScript Inheritance
         *  @author John Resig http://ejohn.org/
         *
         *  创建一个类(创建的类本身会继承com,因此拥有extend功能)
         *  @param prop              原型属性和方法 | 要继承的Function类
         *  @param classname         该类的名称，缺省为Class
         *  @returns {Function}
         *
         *  @demo
         *  var Parent = com.extend({
         *     name:'',
         *     age:0,
         *     init:function(name,age){
         *          console.log('My name is',name,',and I am age old');
         *     }
         *  })
         *    
         *  var Child = Parent.extend({
         *     // override
         *     init:function(name){
         *        var father = this.name;
         *        this._super(name,24);
         *        console.log("I'm son");
         *     }
         *  })
         */
        var initializing = false; //加判断，为了让实例化之后不会直接调用init
        var fnTest = /xyz/.test(function() {
            xyz;
        }) ? /\b_super\b/ : /.*/;
        var cp = context.com.prototype = {
            attrs:{},
            set: function (key,val,type){
                var otype, attrs;
                if (key == null) return this;
                if (isPlainObject(key)) {
                    attrs = key;
                    otype = val;
                } else {
                    (attrs = {})[key] = val;
                    otype = type;
                }
                each(attrs,function(v,k,o){
                    var cur = isAvail(otype)? {'value':v,'type':otype}:{'value':v,'type':getType(v)};
                    if(k in this.attrs){
                        if(this.attrs[k].type == '*' || this.attrs[k].type == cur.type){
                            this.attrs[k]=cur;
                        }else{
                            if(this.attrs[k].type == 'String' && cur.type == 'Number'){
                                this.attrs[k] = {'value':v+'','type':'String'};
                            }else if(this.attrs[k].type == 'Number' && cur.type == 'String'){
                                var cc = parseFloat(cur.value);
                                if(!isNaN(cc)&&isNumber(cc)){
                                    this.attrs[k] = {'value':cc+'','type':'Number'};
                                }
                            }
                            console.log('Warn!!->',this.toString(),'set:参数',k,'数据类型不正确！应该是',this.attrs[k].type,'目前是',cur.type);
                            this.attrs[k]=cur;
                        }
                    }else{
                        this.attrs[k] = cur;
                    }
                },this)
            },
            get: function(value){
                var ret = isAvail(this.attrs[value]) ? this.attrs[value]['value'] : null;
                return ret;
            },
            del: function(key){
                if(!isString(key)) return;
                delete this.attrs[key];
            }
        };
        /**
         *  @protected
         *  @property _listeners
         *  @type Object
         **/
        cp._listeners = null;
        /**
         *  @protected
         *  @property _captureListeners
         *  @type Object
         **/
        cp._captureListeners = null;
        // constructor:
        /**
         *  Initialization method.
         *  @method initialize
         *  @protected
         **/
        cp.initialize = function() {};
        cp.addEventListener = function(type, listener, useCapture) {
            var listeners;
            if (useCapture) {
                listeners = this._captureListeners = this._captureListeners||{};
            } else {
                listeners = this._listeners = this._listeners||{};
            }
            var arr = listeners[type];
            if (arr) { this.removeEventListener(type, listener, useCapture); }
            arr = listeners[type]; // remove may have deleted the array
            if (!arr) { listeners[type] = [listener];  }
            else { arr.push(listener); }
            return listener;
        };
        cp.on = cp.addEventListener;
        cp.removeEventListener = function(type, listener, useCapture) {
            var listeners = useCapture ? this._captureListeners : this._listeners;
            if (!listeners) { return; }
            var arr = listeners[type];
            if (!arr) { return; }
            for (var i=0,l=arr.length; i<l; i++) {
                if (arr[i] == listener) {
                    if (l==1) { delete(listeners[type]); } // allows for faster checks.
                    else { arr.splice(i,1); }
                    break;
                }
            }
        };
        cp.off = cp.removeEventListener;
        cp.removeAllEventListeners = function(type) {
            if (!type) { this._listeners = this._captureListeners = null; }
            else {
                if (this._listeners) { delete(this._listeners[type]); }
                if (this._captureListeners) { delete(this._captureListeners[type]); }
            }
        };
        cp.dispatchEvent = function(eventObj, target) {
            if (typeof eventObj == "string") {
                // won't bubble, so skip everything if there's no listeners:
                var listeners = this._listeners;
                if (!listeners || !listeners[eventObj]) { return false; }
                eventObj = new createjs.Event(eventObj);
            }
            // TODO: deprecated. Target param is deprecated, only use case is MouseEvent/mousemove, remove.
            eventObj.target = target||this;
     
            if (!eventObj.bubbles || !this.parent) {
                this._dispatchEvent(eventObj, 2);
            } else {
                var top=this, list=[top];
                while (top.parent) { list.push(top = top.parent); }
                var i, l=list.length;
     
                // capture & atTarget
                for (i=l-1; i>=0 && !eventObj.propagationStopped; i--) {
                    list[i]._dispatchEvent(eventObj, 1+(i==0));
                }
                // bubbling
                for (i=1; i<l && !eventObj.propagationStopped; i++) {
                    list[i]._dispatchEvent(eventObj, 3);
                }
            }
            return eventObj.defaultPrevented;
        };
        cp.emit = cp.dispatchEvent;
        /**
         *  判断是否有type类型的事件
         **/
        cp.hasEventListener = function(type) {
            var listeners = this._listeners, captureListeners = this._captureListeners;
            return !!((listeners && listeners[type]) || (captureListeners && captureListeners[type]));
        };
        cp._dispatchEvent = function(eventObj, eventPhase) {
            var l, listeners = (eventPhase==1) ? this._captureListeners : this._listeners;
            if (eventObj && listeners) {
                var arr = listeners[eventObj.type];
                if (!arr||!(l=arr.length)) { return; }
                eventObj.currentTarget = this;
                eventObj.eventPhase = eventPhase;
                eventObj.removed = false;
                arr = arr.slice(); // to avoid issues with items being removed or added during the dispatch
                for (var i=0; i<l && !eventObj.immediatePropagationStopped; i++) {
                    var o = arr[i];
                    if (o.handleEvent) { o.handleEvent(eventObj); }
                    else { o(eventObj); }
                    if (eventObj.removed) {
                        this.off(eventObj.type, o, eventPhase==1);
                        eventObj.removed = false;
                    }
                }
            }
        };
        /** 
         *  为对象添加观察者的方法和属性
         *  @param target         目标对象
         *  @param extend         是否将观察者方法直接添加到对象身上
         *                        true: 将方法直接添加到target上,可能造成对象本身有同名方法而被覆盖
         *                        false: 为对象添加一个EventDispatcher的属性，这个属性就是一个观察者对象。
         **/
        com.setEventDispatcher = function(target, extend) {
            var ifextend = extend === undefined ? true : extend;
            if (ifextend) {
                target.addEventListener = cp.addEventListener;
                target.on = cp.on;
                target.removeEventListener = target.off =  cp.removeEventListener;
                target.removeAllEventListeners = cp.removeAllEventListeners;
                target.hasEventListener = cp.hasEventListener;
                target.dispatchEvent = cp.dispatchEvent;
                target.emit = cp.dispatchEvent;
                target._dispatchEvent = cp._dispatchEvent;
            } else {
                target.EventDispatcher = {
                    'addEventListener': cp.addEventListener,
                    'on': cp.on,
                    'removeEventListener': cp.removeEventListener,
                    'off':  cp.removeEventListener,
                    'removeAllEventListeners': cp.removeAllEventListeners,
                    'hasEventListener': cp.hasEventListener,
                    'dispatchEvent': cp.dispatchEvent,
                    'emit': cp.dispatchEvent,
                    '_dispatchEvent': cp._dispatchEvent,
                    'holder': target
                };
            }
            return target;
        }
        /**
         *  创建一个类
         *  @param prop         { PlainObject } 原型对象,init函数为初始化函数
         *  @param classname    { String } 类名，默认为ClassObject
         **/
        com.create = function(prop, classname) {
            var _super = this.prototype;
            initializing = true;
            var prototype = new this();
            initializing = false;
            prop = isFunction(prop) ? prop.prototype : prop;
            for (var name in prop) {
                if (typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name])) {
                    // 拷贝调用了super的方法
                    prototype[name] = (function(name, fn) {
                        return function() {
                            var tmp = this._super;
                            this._super = _super[name];
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;
                            return ret;
                        };
                    })(name, prop[name]);
                } else {
                    // 拷贝其余内容
                    prototype[name] = prop[name];
                }
            }
            // 继承而得到的类
            function Class() {
                if (!initializing && this.init) {
                    this.attrs = {};
                    this.init.apply(this, arguments);
                    com.setEventDispatcher(this);
                }
            };
            if (classname) {
                eval('var Class = function ' + classname + '() {if ( !initializing && this.init ){this.attrs={};this.init.apply(this, arguments);com.setEventDispatcher(this);}}');
            }
            Class.prototype = prototype;
            Class.prototype.constructor = Class;
            Class.prototype.toString = function() { return '[Object ' + classname + ']'};
            Class.prototype._super = Class.prototype;
            Class.create = arguments.callee;
            return Class;
        };
        

        /**
         *  Fix 老浏览器
         *  1> 修复console.log
         *  2> 添加JSON的两个常用方法
         *  3> requestAnimtionFrame 
         * */
        // console.log
        var method;
        var noop = function () {};
        var methods = [
            'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
            'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
            'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
            'timeStamp', 'trace', 'warn'
        ];
        var length = methods.length;
        var console = (window.console = window.console || {});

        while (length--) {
            method = methods[length];
            // Only stub undefined methods.
            if (!console[method]) {
                console[method] = noop;
            }
        }
        if (!window['JSON']) {
            window.JSON = {
                parse: function (sJSON) { return eval("(" + sJSON + ")"); },
                stringify: function (vContent) {
                    if (vContent instanceof Object) {
                        var sOutput = "";
                        if (vContent.constructor === Array) {
                            for (var nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ",", nId++);
                            return "[" + sOutput.substr(0, sOutput.length - 1) + "]";
                        }
                        if (vContent.toString !== Object.prototype.toString) { return "\"" + vContent.toString().replace(/"/g, "\\$&") + "\""; }
                        for (var sProp in vContent) { sOutput += "\"" + sProp.replace(/"/g, "\\$&") + "\":" + this.stringify(vContent[sProp]) + ","; }
                        return "{" + sOutput.substr(0, sOutput.length - 1) + "}";
                    }
                    return typeof vContent === "string" ? "\"" + vContent.replace(/"/g, "\\$&") + "\"" : String(vContent);
                }
            };
        }
        (function() {
            var lastTime = 0;
            var vendors = ['webkit','moz','o','ms'];
            for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
                                              window[vendors[x] + 'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                    var id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }
            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
            }
        }());
        return com;
    }

    var bj = com.bennyrice.utils;
        b.mixin(bj, b, math, main, dom, web, mobile, plugin);

    return com;
});