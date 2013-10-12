/**
 *  com.bennyrice.tools.Animation 
 *  & com.bennyrice.tools.Tweener
 *  @deps       [BennyJS main class & BennyJS.Timer]
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

    var bj = com.bennyrice.utils,
        result = bj.mapResult,
        Tweener = com.bennyrice.anim.Tweener;
    // 启动Tweener    
    Tweener.run();

    /*
     *  [Private Method] 搜寻value在arr中处于哪个p_rang范围，并返回索引号
     *  { x:[{time:[0.1,0.5],value:[100,200]},...] }
     * */
    function searchRange (list, per) {
        var len,arr=[];
        var that = this;
        bj.each(list,function(v,k,o){
            len = o[k].length;
            for (var i = 0; i < len; i++) {
                var min = v[i]['time'][0];
                var max = v[i]['time'][1];
                if (per >= min && per < max) {
                    arr.push({key:k,id:i});
                    break;
                } else if (per >= max && i >= len-1) {
                    arr.push({key:k,id:(len-1)});
                    break;
                } else if(per<min && i==0){
                    if(bj.isAvail(that.get('defaultProp'))){
                        arr.push({key:k,id:null});
                        break;
                    }else{
                        arr.push({key:k,id:0});
                        break;
                    } 
                }
            }     
        })
        return arr;
    }

    /*
     *  [Private Method] 获取当前进度对应的属性内容
     * */
    function getCurrentProp (frames,per){
        var r = searchRange.call(this,frames, per);
        var obj = {};
        var len = r.length;
        for (var j = 0; j < len; j++) {
            var prop = r[j]['key'];
            if(bj.isAvail(r[j]['id'])){
                var id = r[j]['id'];
                var times =  frames[prop][id]['time'];
                var min = bj.result(frames[prop][id]['value'],'0');
                var max = bj.result(frames[prop][id]['value'],'1');
                min = bj.isAvail(min) ? min : 0;
                max = bj.isAvail(max) ? max : 0;
                var pp = bj.math.rangeToPercent(per, times[0], times[1]); // 当前per在rang中处于百分之多少
                var value = bj.math.percentToRange(pp, min, max);
                obj[prop] = value;
            }else{
                obj = null;
            }
        }
        return obj;
    }

    /*
     *  [Private Method] 为dom实现CSS属性值的缓动
     * */
    function motionCSS (dict){
        var o = dict.parent;
        var propHelp = o.propHelp;
        var cssNumber = o.cssNumber;
    
        var keys = Object.keys(o.get('eachData'));
        var dict = bj.clone(bj.pick(dict,keys));
        var normal = bj.omit(dict,'tx','ty','rotate');
        bj.each(normal,function(a,b,o){
            if (bj.has(propHelp,b)) {
                var prop = propHelp[b];
                bj.changeKey(normal,b,prop);
            }
            if(!bj.has(cssNumber,b)){
                o[b] = bj.toNum(a,3)+'px';
            }
        })
        var trans = bj.pick(dict,'tx','ty','rotate');
        var transform = {};
        if(!bj.isEmpty(trans)){
            if(bj.isLow) {
                if (bj.has(dict,'tx')) {
                    transform['left'] = bj.toNum(dict['tx'],2)+'px';
                }
                if (bj.has(dict,'ty')) {
                    transform['top'] = bj.toNum(dict['ty'],2)+'px';
                }
            }else{
                var v = '',
                    c = bj.dss('transform');
                bj.each(trans,function(a,b){
                    if(b=='tx'){
                        if(!bj.isNaN(a)) v+=('translateX('+a+'px) ');
                    }else if(b=='ty'){
                        if(!bj.isNaN(a)) v+=('translateY('+a+'px) ');
                    }else if(b=='rotate'){
                        if(!bj.isNaN(a)) v+=('rotate('+a+'deg) ');
                    }
                })
                if(!bj.isEmpty(v)) transform[c] = v;
            }
        }
        dict = bj.mixin(normal,transform);          
        bj.each(dict,function(a,b){
            if (bj.isElement(o[0])) {
                o[0].style[b] = a;
            }else{
                o[0].css(b,a);
            }
        })
    }

    /*
     *  [Private Method]将当前帧所有属性以及动画设置配置提交给Tweener
     * */
    function motion (per,elem,fn,duration) {
        var el = elem;
        var frames,obj;
        frames = el.keyFrames();
        obj = getCurrentProp.call(this,frames,per);
        if(obj==null) obj = result(el.get('defaultProp'));
        el.set('eachData',bj.clone(obj));
        if(el.baseFn() && per>=el.startFrame) el.baseFn()();
        if (bj.isAvailable(obj)) {
            if (el.tweenFn() != null) {
                el.tweenFn()(el, obj);
            } else {
                if(!bj.isAvail(el.tweenObj())) el.set('tweenObj',{time:0.5});
                var timer = bj.isAvail(duration) ? duration : el.tweenObj().time;
                el.tweenObj().onCompletePara = el;
                bj.mixin(obj, el.tweenObj());
                obj.time = timer;
                if(fn){
                    obj.onUpdate = fn;
                    obj.onUpdateParams = el;
                }
                Tweener.to(el['dict'], obj);
                el.tweener = Tweener;
            }
        }
    }

    /*
     *  [Private Method] 处理设置Actor的keyFrames属性
     *
     *  list => { x:[{value:100,time:0.1},{value:200,time:0.5}],
     *            y:[{value:-50,time:0.2},{value:100,time:0.6}]}
     *  
     *  frames => { x:[{time:[0.1,0.5],value:[100,200]},...] }
     *
     * */
    function setFrames (list){
        var that = this;
        var frames={};
        bj.each(list,function(v,k){
            frames[k] = [];
            for(var i=0,len=v.length;i<len-1;i++){
                frames[k][i] = {};
                var v1 = v[i],v2=v[i+1];
                frames[k][i]['time']=[v1.time,v2.time];
                frames[k][i]['value'] = [v1.value,v2.value];
            }
        })
        this.set('keyFrames', frames);
    }


    /**
     *  Animation 基础类
     *  @note       基础类接受缓动普通对象，不接受dom以及jQuery对象
     *  @tip        如果要实现dom动画，可以将需要缓动的css属性存入一个Object中，
     *              然后在motionTo的回调函数中进行dom的css刷新
     * */
    var Anim = com.create({
        _elems:null,
        _tweenObj:null,
        _tweenFn:null,
        _visible:false,
        _updateFn:null,

        /**
         *  构造函数
         *  @param option
         *  case: option is Function，动画部分将使用这个Function完成 -> fn(obj,prop)
         *  case: option is Object，动画使用Tweener完成，这个对象为配置参数
         *        {
         *           time:xx(s),         // 动画需要的时间
         *           ease:xx,            // 缓动类型(默认是linear)
         *           delay:xx(s),        // 动画延迟开始
         *           onComplete:fn       // 动画对象在完成一次动画时调用，参数就是对象本身
         *        }
         * */
        init:function(option){
            this.percent=NaN;
            this._elems = [];
            // 动画参数
            this._tweenObj = null;
            // 外调动画函数
            this._tweenFn = null;
            this._visible = true;
            this._updateFn = null;
            if (!bj.isFunction(option)) {
                // 没有传入Function
                if (option == null) option = {
                    time: 0.5
                };
                this._tweenObj = option;
            } else {
                // 传入了Function
                this._tweenFn = option;
            }
        },
        /**
         *  添加参与动画的dom元素或者Object对象
         *  @param        目标对象(普通Object非Dom对象),可以传入单个或者多个   
         *  @return       {Array}/{*} 当传入多个参数时返回被包装后的动画对象的数组，如果传一个参数则返回包装后的单个对象
         * */
        animate:function(/*obj1,obj2,...*/) {
            var arg = [].slice.call(arguments);
            for (var i = 0, len = arg.length; i < len; i++) {
                var el = arg[i];
                var that     = this,
                    elems    = this._elems,
                    tweenObj = bj.clone(this._tweenObj),
                    tweenFn  = this._tweenFn;
                var dic = new Actor(el,{
                    'elems'   : elems,
                    'tweenObj': tweenObj,
                    'tweenFn' : tweenFn
                });
                if(el instanceof window['jQuery'] || bj.isElement(el)){
                    dic.actType = 'dom';
                }
                if(this._elems.indexOf(dic)===-1){
                    this._elems.push(dic);
                }
                arg[i] = dic;
                if(this._visible === false){
                    dic.hide();
                }
            }
            if (len === 1) {
                return arg[0];
            } else if (len > 1) {
                return arg;
            }
        },
        /**
         *  执行动画进度
         *  @param per         进度百分比
         *  @param option      可以额外设置此次过度的经历时间，另外还可以设置一个动画执行时的回调函数
         *                      
         * */
        motionTo:function(per/*,option*/) {
            per = bj.toNum(per,2);
            this.percent = per;
            
            var elems = this._elems;
            var args = arguments.length>1 ? [].slice.call(arguments) : [];
            args[0] = per;
            for(var i=0,len=elems.length;i<len;i++){
                var actor = elems[i];
                actor.motionTo.apply(actor,args);
            }  
        },
        /**
         *  隐藏所有动画角色
         */
        hide:function(){
            if(this._visible===false) return;
            var elems = this._elems;
            for(var i=0,len=elems.length;i<len;i++){
                elems[i].hide();
            }
            this._visible = false;
        },
        /**
         *  显示所有动画角色
         */
        show:function(){
            if(this._visible===true) return;
            var elems = this._elems;
            for(var i=0,len=elems.length;i<len;i++){
                elems[i].show();
            }
            this._visible = true;
        }
    },'Anim');
    
    function ActorDic(papa){
        this.parent = papa;
    }
    
    /**
     *  普通对象动画属性管理
     *  @param self         缓动对象
     *  @return             {Actor Arr}可以通过返回值[0]访问传入的缓动对象自身
     */
    var Actor = com.create({
        propHelp : {
            'x':'left',
            'y':'top',
            'tx':'transform',
            'ty':'transform',
            'rotate':'transform'
        },
        cssNumber : {
            "fillOpacity": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true,
            "rotate" :true
        },
        init: function(self,option){
            if(!bj.isAvail(self)) {
                return;
            }
            this[0] = self;
            this.actType = 'obj';
            this.visible = true;
            this.percent = NaN;
            this.startFrame = NaN;
            this.endFrame = NaN;
            this.dict = new ActorDic(this);
            this.set('play',true);
            this.set('elems',[]);
            this.set('tweenObj',null);
            this.set('tweenFn',null);
            this.set('defaultProp',null);
            this.set('baseFn',null);
            this.set('keyFrames',null);
            this.set('eachData',null);
            // 当前动画组中的所有元素
            this['elems'] = function(){ return this.get('elems') };
            // 缓动配置
            this['tweenObj'] = function(){ return this.get('tweenObj') };
            // 外部缓动函数
            this['tweenFn'] = function(){ return this.get('tweenFn') };
            // 在未处于进度设定时,动画属性的缺省设置
            this['defaultProp'] = function(){ return this.get('defaultProp') };
            // 动画对象始终保持的属性
            this['baseFn'] = function(){ return this.get('baseFn') };
            // 整理过的动画列表
            this['keyFrames'] = function(){ return this.get('keyFrames') };
            // 下一帧的动画属性
            this['eachData'] = function(){ return this.get('eachData') };
            // 阻止动画
            this['play'] = function(){ return this.get('play') };

            if(bj.isPlainObject(option)){
                var op = ['elems','tweenObj','tweenFn'];
                if(bj.has(option,'elems')){
                    this.set('elems',option['elems']);
                }
                if(bj.has(option,'tweenFn')){
                    this.set('tweenFn', option['tweenFn']);
                } 
                if(bj.has(option,'tweenObj')){
                    this.set('tweenObj',bj.clone(option['tweenObj']));
                }
            }else if(bj.isString(option)){
                this.actType = option;
            }
        },
        // 获取下一帧的属性信息
        getCurProp: function getCurProp(p){
            var curProp = result(this.eachData());
            if(curProp==null) return 0;
            if(curProp[p]==null) return 0;
            return curProp[p];
        },
        /**
         *  @param option      关键帧信息,属性值可以用一个函数代替，这样就能够实时获得值
         *  {
         *       default:{
         *           y:600, alpha:0
         *       },
         *       base:function(){ //code... },
         *       keyFrames:[
         *           {progress:0,y:500,alpha:0},
         *           {progress:0.3,y:100,alpha:1,x:50},
         *           {progress:0.5,y:100,x:100},
         *           {progress:0.7,y:0}
         *       ]
         *  }
         *
         *  [default]   -缺省设置，当动画百分比小于当前角色起始帧时默认会通过对第一组属性的时间区间
         *              换算出小于起始帧时的属性值。如果设置了缺省设置，那么会直接取缺省里的属性值。
         *
         *  [base]      -基础函数，当动画百分比进入到角色起始帧后，会在每次调用motionTo时调用此函数
         *              此函数只是为了便于管理各个角色的代码，并没有特殊功能。
         *
         *  [keyFrames] -关键帧信息
         *
         * */
        addFrames: function (option) {
            if(!option) return;
            if (bj.isAvail(option['default'])) this.set('defaultProp',option['default']);
            if (bj.isAvail(option['base'])) this.set('baseFn',option['base']);

            var kf = option['keyFrames'];
            var len = kf.length;
            var p_range = bj.pluck(kf, 'progress');
            this.startFrame = p_range[0];
            this.endFrame = p_range[len-1];
            var list = {}
            for (var i = 0; i < len ; i++) {
                // 获取起点和终点两个动画配置信息
                var props = bj.omit(kf[i], 'progress'); 
                // 获取属性名称 => keys = ['x','y','width',...]
                var keys = Object.keys(props);
                var time = p_range[i];
                var len2 = keys.length;
                for (var j = 0; j < len2; j++) {
                    var prop = keys[j];
                    var item = {value:props[prop],time:time};
                    if(bj.has(list,prop)){
                        list[prop].push(item);
                    }else{
                        list[prop] = [item];
                    }
                    if(!bj.isAvail(this.dict[prop])) {
                        this.dict[prop] = item;  
                    }
                }
            }
            setFrames.call(this,list);
        },
        motionTo:function(per/*,option*/) {
            if(this.play()===false){
                console.log('Actor.motionTo:',this,'.play=false,将不参与动画');
                return this.percent;
            }
            per = bj.toNum(per,2);
            this.percent = per;
            var args = arguments.length>1 ? [].slice.call(arguments,1):null;
            var fn=null,duration=null;
            var isDom = false;
            if(this.actType==='dom'){
                isDom=true;
                fn = function(){motionCSS.apply(this, arguments);}
            }
            if(args!=null){
                for(var i= 0,l=args.length;i<l;i++){
                    if(bj.isFunction(args[i])){
                        fn = args[i];
                        if(isDom){
                            (function(v){
                                fn = function(){
                                    args[v].apply(this,arguments);
                                    motionCSS.apply(this, arguments);
                                }
                            }(i));
                        }
                    }else if(bj.isNumber(args[i])){
                        duration = args[i];
                    }
                }
            }
            var elems = this;
            this.set('upDate',fn);
            motion.call(this,per,elems,fn,duration);
            return this.percent;
        },
        /**
         *  隐藏当前角色
         */
        hide:function(){
            if(this.visible === false) return;
            if(!this[0]) return;
            (this[0].hide()) || (this[0].style.visibility = 'hidden');
            this.visible = false;
        },
        /**
         *  显示当前角色
         */
        show:function(){
            if(this.visible === true) return;
            if(!this[0]) return;
            (this[0].show()) || (this[0].style.visibility = 'visible');
            this.visible = true;
        }
    },'Actor');

    com.bennyrice.anim.Anim = Anim;
    com.bennyrice.anim.Actor = Actor;

    return com.bennyrice.tools;
})