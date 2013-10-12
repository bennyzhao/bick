/**
 *  com.bennyrice.tools.Tweener
 *
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
        Timer = com.bennyrice.time.Timer,
        result = bj.mapResult,
        easeFn = bj.easeFn;

    /**
     *  Static Util
     **/
    function Tweener(){ throw('do not new instance')};
    // 所有的动画对象
    Tweener['objs']= []; 
    // 所有对象的属性动画队列(一个属性拥有一个队列)
    Tweener['twns']= []; 
    // Tweener是否在运行
    Tweener['looping']= false; 
    // previous time
    Tweener['_ptime']= 0; 
    Tweener['timer']= new Timer(10);
    // 默认值
    Tweener['def']= {
        time: 1,
        transition: bj.ease.Expo.easeOut,
        ease: bj.ease.Expo.easeOut,
        delay: 0,
        prefix: {},
        suffix: {},
        onStart: undefined,
        onStartParams: undefined,
        onUpdate: null,
        onUpdateParams: null,
        onComplete: null,
        onCompleteParams: null
    }; 


    /**
     *  API Fn
     *
     *  @param o    缓动对象
     *  @param ps   动画配置(time,delay,transition/ease,onComplete,onCompletePara,onUpdate)
     */
    Tweener.to = function(o, ps) {
        var tweens, T = Tweener;

        var ind = T.objs.indexOf(o);
        if (ind < 0) {
            tweens = [];
            T.objs.push(o);
            T.twns.push(tweens);
            tweens.id = T.twns.length-1;
        } else tweens = T.twns[ind];

        var dur, del, ef, comfn, compara, upfn,upfnpara;
        dur = (ps.time == null) ? T.def.time : ps.time;
        del = (ps.delay == null) ? T.def.delay : ps.delay;
        comfn = (ps.onComplete == null) ? T.def.onComplete : ps.onComplete;
        compara = (comfn && ps.onCompletePara != null) ? ps.onCompletePara : T.def.onCompleteParams;
        tweens.onUpdate = upfn = (ps.onUpdate != null) ? ps.onUpdate : T.def.onUpdate;
        tweens.onUpdateParams = upfnpara = (upfn && ps.onUpdateParams !=null ) ? ps.onUpdateParams : T.def.onUpdateParams;
        if (ps.transition == null && ps.ease == null) ef = easeFn[T.def.transition];
        else ef = easeFn[ps.transition || ps.ease];
        for (var p in ps) {
            // 遍历出ps中所有非Tweener的属性，也就是需要进行缓动的属性
            if (p == "time" || p == "delay" || p == "transition" || p == 'ease' || p == 'onComplete' || p == 'onCompletePara' || p =='onUpdate' || p == 'onUpdateParams') continue;
            var t = new T.Tween();
            // 设置
            t.Set(p, dur, del, ps[p], ef, comfn, compara, upfn, o);
            tweens.push(t);
        }
        loop();
    }
    /**
     *  返回Tweener是否处于运行
     **/
    Tweener.isrun = function(){
        return Tweener.looping
    }
    /**
     *  启动Tweener
     **/
    Tweener.run = function(){
        Tweener.timeHandle = Tweener.timer.on('timer',step);
    }
    /**
     *  停止Tweener
     **/
    Tweener.stop = function(){
        Tweener.timer.off('timer',Tweener.timeHandle);
    }

    /*
     Tween class
     */
    Tweener.Tween = function() {
        this.t = 0;
        this.b = 0;
        this.c = 0;
        this.par = null;
        this.dur = 0;
        this.del = 0;
        this.tval = 0;
        this.ef = null;
        this.cf = null;
        this.cfp = null;
        this.uf = null;
    }

    Tweener.Tween.prototype.Set = function(par, dur, del, tval, ef, comfn, compara, uf, o) {
        this.par = par; // prop
        this.dur = dur; // duration
        this.del = del; // delay
        this.tval = tval; // target value
        this.ef = ef; // easing function
        this.cf = comfn; // onComplete
        this.cfp = compara; // onComplete(para)
        this.uf = uf; // onUpdate
    }

    // private
    function loop() {
        var T = Tweener;         
        if (T.looping === false) {
            T.timer.start(); 
            T.looping = true;
        }
    }
    // private
    function step(e) {
        var T = Tweener,
            tweens,o,t;
        for (var i=0; i<T.twns.length ; i++) {
            tweens = T.twns[i];
            o = T.objs[i];
            for (var j = 0; j < tweens.length; j++) {
                t = tweens[j];
                if( e.passed < t.del) continue;
                var prop = t.par;
                if (t.t == 0) {
                    // tween中的起始属性值
                    t.b = parseFloat(result(o[prop]));
                    t.c = t.tval-t.b;
                }
                t.t += e.step;
                var target_value = t.tval,
                    progress_value = 0;
                if (t.t > t.dur) {
                    o[prop] = target_value;
                    tweens.splice(j, 1);
                    j--;
                } else {
                    progress_value = t.ef(t.t, t.b, t.c, t.dur);
                    o[prop] = progress_value;
                }
            }
            if(tweens.onUpdate) {
                tweens.onUpdate(o,tweens.onUpdateParams)
            };
            if (tweens.length <= 0) {
                if (t.cf != null) {
                    t.cf(t.cfp,o);
                }
                T.objs.splice(i, 1);
                T.twns.splice(i, 1);
                i--;
            }            
        }
        if (T.objs.length <= 0) {
            T.timer.close();
            T.looping = false;
        }
    }
    
    context.Tweener = com.bennyrice.anim.Tweener = Tweener;
    return Tweener;
})