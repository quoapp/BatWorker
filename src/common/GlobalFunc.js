var global=window;


import JobQueueView from '../views/body/JobQueueView.js'
import {CutView,LogView,XEditableText} from "./index.js";
import FuncCfgs from '../cfg/FuncCfgs.js'

var _ = require('lodash');

global.getPanelByType=function(type){
    if(type=="jobQueue"){
        return JobQueueView;
    }else if(type=="logView"){
        return LogView;
    }else if(type=="cutView"){
        return null;
        //return CutView;
    }
    return null;
}

global.getPanelNameByType=function(type){
    if(type=="jobQueue"){
        return '执行队列';
    }else if(type=="logView"){
        return '日志';
    }else if(type=="cutView"){
        return 'JSON'
    }
    return '未定义';
}


global.cloneCreate=function(data,addId=true){
	var obj=_.clone(data,true);
    if(_.isString(obj)){
        return obj;
    }
    //循环id
    var chgId=function(obj){
        if(obj.hasOwnProperty('id')){
            obj.id=global.WorkStore.createIncId();
        }
        for(var key in obj){
            if(_.isArray(obj[key])||_.isObject(obj[key])){
                chgId(obj[key]);
            }
        }
    }
	if(addId){
       chgId(obj); 
    }    
    delete obj.viewFilters;
    delete obj.exec;
	console.log('dengyp new clone');
	console.dir(obj);
	return obj;
}

global.searchAndReplace=function(obj,sStr,repStr){
    //console.log(sStr,repStr);
    for(var key in obj){
        var val=obj[key];
        if(_.isString(val)){
            //console.log("searchAndReplace:"+val,sStr,repStr);

            if(val.indexOf(sStr)>-1){

                obj.set(key,val.replace(sStr,repStr));
            }
        }else if(_.isArray(obj[key])||_.isObject(obj[key])){
            global.searchAndReplace(obj[key],sStr,repStr);
        }
    }
}

global.log=function(){
    var arr=Array.prototype.slice.call(arguments);
    var str=arr+"";
    console.log(str);
    global.LogActions.addLog(str);
}

global.globalReplace=function(value,vars){
            for(var kv in vars){
                var {name,val}=vars[kv];
                var repVal = val;
                
                //check first char to run func
               
                if(val.indexOf('~')>=0)
                {
                    val = val.replace('~','');
                    var arr = new Array();
                    arr = val.split(',');
                    var f =FuncCfgs[arr[0]]; 
                    arr.shift();
                    //f.apply(this,);
                   
                    while(value.indexOf("$"+name)!=-1)
                    {
                         repVal = f.apply(this,arr);
                        value=value.replace(new RegExp("\\$"+name),repVal);                        
                    }
                }
                else
                {
                     value=value.replace(new RegExp("\\$"+name,'g'),repVal); 
                }
                
                
            }
            return value;
        }