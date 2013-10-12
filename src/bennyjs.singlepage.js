// deps:[jQUery,preloadJS]

(function(context){

    var tools = com.bennyrice.tools;
    var bj = com.bennyrice.utils;

    function Gaia(){trace('SinglePage inited')}

    // url地址改变，切换页面事件
    Gaia.CHANGE_PAGE = 'changePage';
    // 目标子页面已经加载完成
    Gaia.PAGE_READY = 'pageReady';

    /*
    *   工具方法,搜索$content里的图片素材路径
    *
    *   @return:        路径集合
    *
    * */
    Gaia.searchImg = function($content){

        // 图片资源路径
        var imgs=[];

        // 全文匹配-> ",',(,),url <-这些符号
        var patt=/\"|\'|\)|\(|url/g;

        // 寻找页面中的图片资源

        // <img>标签中的图片
        $content.find('img').each(function(){
            imgs.push($(this).attr('src'));
        });

        // css中的背景图
        $content.find('*').each(function(){
            var bg = $(this).css("background-image").replace(patt,'');
            if( bg!='none' ){
                imgs.push(bg);
            }
        });

        return imgs;
    }

    var gp = Gaia.prototype;

    // >>> private <<<

    gp.isLocal = (window.location.protocol == "file:") ? true : false;
    // root 根路径
    gp.base = '';
    // sitemap 网站结构
    gp.map = null;
    // pages Array 所有子页面的集合
    gp.pages = [];
    // container 子页面显示区域
    gp.content = null;
    // nav 导航元素
    gp.nav = null;
    // loading 加载动画元素
    gp.loading = null;

    // 对应id字符串的一个数字索引,比如{canvas:0,home:1},
    // 那么当gaia.id = home的时候,对应的数字id就是1
    gp.idIndex = {};
    // jQuery.address
    gp.watcher = new HashWatcher();

    // 每次加载到的素材
    gp.pageAsset = null;

    // >>> property <<<

    // ** 配置content、nav、loading 参数:($content,$nav,$loading)
    gp.setConfig = null;
    // ** 页面加载过程 参数:(pecent百分比值)
    gp.progressPage = null;
    // ** 事件中心
    gp.EventCenter = null;

    // 事件收集
    gp.event_collect = [];
    // id 页面ID用来进行不同处理
    gp.id = '';
    gp.pre_id = '';
    // 已经预加载过的页面
    gp.loadedPage = [];

    // >>> method <<<
    /*
    * 初始化框架实例
    *
    * @note:                先配置完property中带**的属性 最后再调用init
    * @note:                如果子页面有文档类请写成非直接执行的文档，请再pageReady事件回调函数中进行执行
    *
    * @para:conf            配置信息
    *
    *                       └ base:     页面根路径
    *                       └ siteMap:  网站地图
    *
    *                           └ loading:    loading动画元素的id选择器
    *                           └ content:    子页面容器元素的id选择器
    *                           └ nav:        导航元素的id选择器
    *                           └ page:       子页面地图
    *
    *                               └ id:        子页面id名称
    *                               └ title:     子页面标题
    *                               └ path:      子页面路径
    *                               └ script:    子页面素材js (文档类留在最后)
    *                               └ image:     是否預加載子頁面中所有圖片素材
    * */
    gp.init = function(conf){

        $(this).on(Gaia.PAGE_READY,this.EventCenter);
        $(this).on(Gaia.CHANGE_PAGE,this.EventCenter);

        this.base = conf.base || '';
        this.map = conf.siteMap;
        if(typeof this.map === 'object'){
            setConfig(this);
        }else{
            loadJson(this);
        }
    }

    /*
    *   设置开启锚点页面的按钮启用深度链接
    *
    *   @para:$nav      jQuery包裹的按钮元素
    *
    *   @note: 目标元素必须带有deeplink这个attribute
    *
    * */
    gp.setNav = function($nav){
        var gaia = this;

        if($nav.css('cursor') == 'auto'){
            $nav.css('cursor','pointer')
        }
        $nav.on('click',function(){
            var hash = $(this).attr('deeplink').replace(/^#/, '');
            gaia.watcher.setHash(hash);
        })
    }

    /*
    *   开始加载新的页面
    * */
    gp.getPage = function(){
        loadAsset(this);
    }

    /*
    *  抛事件
    *
    *  @para:type       事件类型
    *  @para:data       事件参数:Array
    *
    * */
    gp.dispatchEvent = function(type,data){
        $(this).trigger(type,data);
        this.event_collect.push(type);
    }

    gp.removePage = function(){
        //var child = this.content_box.children();
        this.content_box.empty();
        //this.content_box.html('');
    }

    // >>> Function <<<

    // 加载网站地图JSON文件
    function loadJson(gaia){

        $.getJSON(gaia.map,function(json){
            gaia.map = json;
            setConfig(gaia);
        })
    }

    // 初始配置
    function setConfig(gaia){
        gaia.content = $(gaia.map.content);
        var content_box = $("<div id='content_box' style='margin: 0; padding: 0'></div>")
        gaia.content.append(content_box);
        gaia.content_box = content_box;

        gaia.nav = $(gaia.map.nav);
        gaia.loading = $(gaia.map.loading);
        gaia.pages = gaia.map.page;
        var len = gaia.pages.length;
        for(var i=0;i<len;i++){
            gaia.idIndex[gaia.pages[i].id] = i;
        }
        // 调用外接配置函数
        gaia.setConfig(content_box,gaia.nav,gaia.loading);
        deeplink(gaia);
    }

    // 设置深度链接
    function deeplink(gaia){

        var watcher = gaia.watcher;
        watcher.init(hashHandler)

        // 首次登录首页，自动切换到第一个子页面ID
        if(watcher.value() == '/' || watcher.value() == ''){
            watcher.setHash(gaia.map.page[0].id)
        }

        function hashHandler(deeplinks, fragment)
        {

            if(deeplinks[0] != ''){

                gaia.id = deeplinks[0]

                if(gaia.id == ''){
                    gaia.id = gaia.map.page[0].id;
                }
            }else{
                gaia.id = gaia.map.page[0].id;
            }

            checkID(gaia);

            gaia.dispatchEvent(Gaia.CHANGE_PAGE,[{gaia:gaia}]);

            gaia.pre_id = gaia.id;
        }

    }

    // 检测含有有?ver=xxx的参数的路径
    function checkID(gaia){
        var pages = gaia.map.page;

        pages.forEach(function(element, index, array){
            var reg = new RegExp('^'+element.id);
            if(reg.test(gaia.id)){
                gaia.id = element.id;
                trace('checkID:',gaia.id);

                return;
            }
        })
    }

    // 加载子页面
    function loadAsset (gaia){

        var that = gaia;
        var page = null;        // 当前页面配置内容
        var page_data = null;   // 目标子页面html

        // 确定当前page内容
        var id = that.idIndex[that.id]
        page = that.pages[id]
        if(page==null) {
            page = that.pages[0];
            that.id = that.pages[0].id;
        }

        document.title = page.title;


        loadResource();

        // 加载图片和js
        function loadResource(){
            // 加载素材
            var manifest = [];

            var ifXHR = !gaia.isLocal;

            // 没加载过的才进行加载
            if(_.indexOf(that.loadedPage,that.id)==-1){
                // javascript
                if(page.script && page.script.length>0){
                    var len = page.script.length;
                    for(i=0;i<len;i++){
                        manifest[i] = {
                            src:page.script[i],
                            id:i+1,
                            type:'javascript'
                        }
                    }
                }

                // image
                if(page.image && page.image.length>0){
                    var len2 = page.image.length;
                    for(i=0;i<len2;i++){
                        manifest.push({
                            src:page.image[i],
                            id:'img_'+i,
                            type:'image'
                        })
                    }
                }
            }

            // html
            if(ifXHR){
                manifest.push({src:page.path.replace("{base}",that.base),id:'html'})
            }else{
                trace('加载首页')
                gaia.content_box.load(page.path.replace("{base}",that.base))
            }

            // 开始加载
            if(manifest.length>0){
                bj.loadAsset(manifest,onComplete,onProgress,fileLoad);
            }else{
                trace('ready')
                gaia.pageAsset = null;
                gaia.dispatchEvent(Gaia.PAGE_READY,[{gaia:gaia,data:null}]);
            }


        }

        var toAppendIn = [];

        // 每个文件加载完毕
        function fileLoad(e,result){

            var loader = e.target;
            if(loader.useXHR){
                if(e.item.type == 'javascript'){
                    var script = {data:result,id: e.item.id}
                    toAppendIn.push(script);
                }else if(e.item.id == 'html') {
                    page_data = result;
                }
            }
        }

        // 队列完成时
        function onComplete(e){
            //window.location.hash = "#!/" + that.id;
            var loader = e.target;

            if(loader.useXHR){

                toAppendIn.sort(function(a,b){
                    if(a.id>b.id){
                        return 1;
                    }else{
                        return -1;
                    }
                })

                that.pageAsset = [];
                var data = that.pageAsset;

                var len = toAppendIn.length;
                for(var i =0 ;i<len;i++){
                    data[i] = toAppendIn[i].data;
                }

                data.push(page_data);
                that.dispatchEvent(Gaia.PAGE_READY,[{gaia:that,data:data}]);
            }else{
                that.pageAsset = null;
                that.dispatchEvent(Gaia.PAGE_READY,[{gaia:that,data:null}]);
            }

            if(_.indexOf(that.loadedPage,that.id)==-1){
                that.loadedPage.push(that.id);
            }

        }

        // 队列进行时
        function onProgress(e,p){
             that.progressPage(p);
        }
    }

    /* ////////////////////////////// */
    // Hash Watcher 1.0
    /* ////////////////////////////// */

    function HashWatcher()
    {
        var oldHash = "", curHash = "", url = "", deeps=[""];
        var interval, handler, isNativeSupported;
        var fn;

        this.init = function(handlerFunc, duration)
        {
            handler = handlerFunc;
            duration = duration || 500;

            fn = this;
            fn.checkHash();

            isNativeSupported = ("onhashchange" in window) ? true : false;

            if (isNativeSupported){ window.onhashchange = fn.checkHash }
            else { interval = setInterval(fn.checkHash, duration); }

            //interval = setInterval(fn.checkHash, duration);
        }
        this.destory = function()
        {
            if(!isNativeSupported) {
                clearInterval(interval);
                interval = null;
            }

            handler = deeps = null;
            oldHash = curHash = url = "";
        }

        this.clearHash = function()
        {
            //清空hash,不刷新页面
            oldHash = curHash = url = "";
            deeps = [""];
            window.location = window.location.href.split('#')[0];
        }

        this.setHash = function(link)
        {
            if(link.length<1) { return }
            window.location.hash = "#!/" + link;
            url = link;
        }

        // window.location.hash发生改变时调用
        this.checkHash = function()
        {
            if(window.location.hash.length > 3)
            {
                curHash = window.location.hash;
                if(curHash.substring(0,3) != "#!/")
                {
                    fn.clearHash();
                    return;
                }

                deeps = curHash.replace( /^#!/, '' ).split('/');
                deeps.shift(); //剔除第一个空的 ""
                url = deeps[0];

            }
            else
            {
                if(window.location == window.location.href.split('#')[0]) { return }
                else { fn.clearHash() }
            }

            if(oldHash != curHash && url.length != "")
            {
                fn.fire();
                oldHash = curHash;
            }
        }

        // 调用init中绑定的外接函数
        this.fire = function()
        {
            handler(deeps, curHash)
        }
        // 当前hash
        this.fragment = function() { return curHash }
        // 深度链接的值
        this.value = function() { return deeps[0] }
    }

    // Singleton
    Gaia.instance = null;
    Gaia.init = function(){
        if(Gaia.instance != null)return Gaia.instance;
        Gaia.instance = new Gaia();
        return Gaia.instance;
    }

    tools.SinglePage = Gaia;
    return tools;

}(Function('return this')()))
