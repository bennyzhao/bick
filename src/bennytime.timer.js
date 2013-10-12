/**
 *  com.bennyrice.tools.Timer 
 *  @deps       [com]
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

    var Event = com.bennyrice.event.Event;

	var Timer = com.create({  
    	// 计时器事件间的延迟（以毫秒为单位）
    	delay:0,
    	// 设置的计时器运行总次数
    	repeatCount:0,
    	// 计时器的当前是否处于暂停
    	_paused:true,
    	// 计时器开始计数后触发的次数	
    	_currentCount:0,
    	/**
    	 *	初始化计时器
    	 *	@param delay:Number 		计时器间隔时间
    	 *	@param repeatCount:Number	重复次数，默认为0代表无限重复
    	 *	@return {Timer} 				
    	 */
    	init: function(delay,repeatCount){
    		that = this;
    		// inherit
    		
  			// prototype
    		this.delay = delay;
    		this.repeatCount = repeatCount || 0;
    		this._paused = true;
    		this._count = 0;
    		// instance
    		// 计时器
    		this.time = 0;
    		// 累积时间
    		this._passed = 0;
    		// 开始那一刻的时间
    		this._begin = 0;
            // ID
            this._timeId = NaN;
    		return this;
    	},
    	/**
    	 *	暂停计时并重置当前计时器的时间
    	 *	@return {void}
    	 */
    	reset: function(){
    		this.stop();
    		this.time = 0;
    	},
    	/**
    	 *	开始计时
    	 *	@return {void}
    	 */
    	start: function(){
    		if(this._paused===true) {
    			this._begin = new Date().getTime();
    			this._timeId = requestAnimationFrame(this._run_.bind(this));
                this._paused = false;
    		}    			
    	},
    	/**
    	 *	暂停计时
    	 *	@return {void}
    	 */
    	stop: function(){
    		this._paused = true;
            var timeid = this._timeId;
            cancelAnimationFrame(timeid);
    	},
    	/**
		 *	停止当前计时，将所有数据清零
    	 */
    	close: function(){
    		this.reset();
    		this._currentCount=0;
	    	this._passed = 0;
    	},
    	/**
    	 *	计时器是否正在运行
    	 *	@return {Boolean} 	true 运行 | false 停止
    	 */
    	isrun: function(){
    		return !this._paused;
    	},
    	/**
    	 *	计时器运行
    	 */
    	_run_: function (){
    		if(this._paused===true) return;
    		var step = this._begin;
        	this._begin = new Date().getTime();

        	// 修正时间：得出从start至此处程序运算的时间，而不是每次都笼统的+1
        	step = (this._begin - step);
    		this.time += step;
    		this._passed += step;

    		// 每完成一轮计时，重置！
    		if(this.time >= this.delay){    
                var timerevent = new Event('timer');
                timerevent.step = step;
                timerevent.passed = this._passed;		
    			this.emit.call(this,timerevent,this);
                // 当达到计时次数时，完成！
                if(this.repeatCount!=0){
                    this._currentCount++;
                    if(this._currentCount>= this.repeatCount){
                        var completevent = new Event('timerComplete');
                        completevent.step = step;
                        completevent.passed = this._passed;
                        this.emit.call(this,completevent,this);
                        this.close();                   
                        return;
                    }
                }
                if(this._paused===true) return;
                this.reset();
                this.start();
    		}
			this._timeId = requestAnimationFrame(this._run_.bind(this));
    	}
    },'Timer');

    
    var Timeline = function(option) {
        this.config(option);
    };
    var EnterFrame = com.create({


    },'EnterFrame');
    Timeline.prototype = {
        EVENT_ENTER_FRAME: "enterFrame",

        option: {
            fps: 30
        },
        tid: null,
        active: false,

        config: function(option) {
            if (isNaN(option)) {
                this.option = $.extend({},
                this.option, option);
            } else {
                this.option.fps = option;
            }
            return this;
        },
        start: function() {
            this.active = true;
            this._enterFrame();
            return this;
        },
        _enterFrame: function() {
            if (this.active) {
                $(this).trigger(this.EVENT_ENTER_FRAME);
                this.tid = setTimeout($.proxy(this._enterFrame, this), Math.floor(1000 / this.option.fps));
            }
        },
        stop: function() {
            this.active = false;
            clearTimeout(this.tid);
            return this;
        },
        bind: function(name, func) {
            $(this).bind(name, func);
            return this;
        },
        unbind: function(name, func) {
            $(this).unbind(name, func);
            return this;
        }
    };

    com.bennyrice.time.Timer = Timer;

    return com.bennyrice.tools;
})