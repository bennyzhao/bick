
(function(){

    var bj = com.bennyrice.utils,
        isAvailable = bj.isAvailable;

    var loadUtil = {};

    /**	加载素材，不包括Sound、javascript

     @param asset		一个数组，包含了须加载素材的路径及配置[{src:"images/button.png", id:"button"},....]
     @param onComplete	加载队列完成时回调	参数：(事件对象)
     @param onProgress	加载队列加载过程时回调	参数：(事件对象，百分比)
     @param onFileLoad	队列中单个文件加载完成时回调	参数：(事件对象，加载的文件对象)

     */
    function loadAsset (asset,onComplete,onProgress,onFileLoad){


        /*
         是否使用XHR途径加载，设为false时将使用传统tag加载。
         1、XHR以二进制方式加载，用有加载百分比进度，并且可以暂停，但是会有跨域问题。
         2、TAG加载其实就是在HTML中加入一个标签获取数据，没有跨域问题但是无法访问到单个文件的百分比。
         在队列中能访问到队列已完成数÷队列总数这样的百分比。

         因此首先通过window的协议查看是否为本地路径，如果是本地路径，则不使用XHR
         */

        var loader = null;

        if( window.location.protocol == "file:"){
            loader = new createjs.LoadQueue(false);
            loader.maintainScriptOrder = false;
        }else{
            loader = new createjs.LoadQueue();
        }

        loader._asset = asset;
        loader._completeFn = (!isAvailable(onComplete)) ? null : onComplete;
        loader._progressFn = (!isAvailable(onProgress)) ? null : onProgress;
        loader._fileloadFn = (!isAvailable(onFileLoad)) ? null : onFileLoad;

        loader.addEventListener("fileload", fileloadFn);
        loader.addEventListener("progress", progressFn);
        loader.addEventListener("complete", completeFn);

        loader.loadManifest(asset);
        loader.getContent = loader.getItem;
        loader.getContentTag = loader.getResult;
        return loader;
    }

    function fileloadFn(e){
        var loader = e.target;
        if(loader._fileloadFn != null){
            loader._fileloadFn(e,e.result);
        }
    }

    function progressFn(e){
        var loader = e.target;
        if(loader._progressFn != null){
            // 获得一个百分比数值 -> 34
            var progress_num = e.progress.toFixed(2);
            progress_num *=100;
            progress_num = Math.floor(progress_num);
            loader._progressFn(e,progress_num);
        }
    }

    function completeFn(e){
        var loader = e.target;
        if(loader._completeFn != null){
            loader._completeFn(e);
        }
    }

    // 赋值
    loadUtil.loadAsset = loadAsset;

    bj.loadUtil = loadUtil;
    _.extend(bj,loadUtil);

    return bj;

}())


