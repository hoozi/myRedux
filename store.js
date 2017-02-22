/**
 * 自定义一个redux框架的store
 * @dependencies EvenetEmitter
 * @class Store
 */

'use strict';

const EventEmitter = require('events').EventEmitter;

const myRedux = {};

class Store {
    constructor(state) {
        this._state = state || {};
        this._updaters = {};
        this._emitter = new EventEmitter;
        this._eventName = 'change';
        this._middles = [];
        this._middleIndex = 0;
    }
    
    get state() {
        return JSON.parse(JSON.stringify(this._state)); //复制内部_state
    }

    /**
     * 设置updaters
     * @param {function | Object} fns
     * @memberOf Store
     */
    setUpdaters(fns) {
        this._updaters = fns;
    }

    /**
     * 添加中间件
     * 
     * @param {function} middle
     * 
     * @memberOf Store
     */
    /*use(middle) {
        this._middles.push(middle);
        return this;
    }*/

    /**
     * 触发
     *  
     * @param {Object} action
     * 
     * @memberOf Store
     */
    dispatch(action) {
        let _updaters = this._updaters;
        if(typeof _updaters == "function") {
           this._state = this._updaters(this.state, action); //=>new State
        } else {
           let state = {};
           let keys = Object.keys(_updaters);
           keys.forEach(key=>{
              let _updater = _updaters[key];
              let _value = this.state[key];
              let _newValue = _updater(_value,action);
              state[key] = _newValue;
           })
           this._state = Object.assign({},this.state,state)
        }
       
        this._emitter.emit(this._eventName);
    }
   /* dispatch(action) {
        this._dispatch(action);
    }*/
    subscribe(subscribe) {
        this._emitter.on(this._eventName, subscribe);
    }
}

myRedux.createStore = function(updaters, defaultState){
    let store = new Store(defaultState);
    store.setUpdaters(updaters);
    return store;
}

const state = {
    count:0,
    name:"hoozi"
}

const action = {
    type:"ADD"
}
const action2 = {
    type:"CUT"
}
const action3 = {
    type:"CHANGE_NAME"
}
function countReducer(count, action) {
    switch(action.type) {
        case "ADD":
            return ++count
        case "CUT":
            return --count
        default:
            return count;
    } 
}
function nameReducer(name, action) {
    console.log(action.type)
   if(action.type=="CHANGE_NAME") {
     return name+"!"
   }
   return name;
   
}
const store = myRedux.createStore({
  count: countReducer,
  name: nameReducer
},state);
store.subscribe(function(){
    //console.log('default--->',state)
    console.log('store--->',store.state);
});

//store.dispatch(action);
//store.dispatch(action3);

/*function logger(store,next) {
    return function(action) {
        console.log("logger1 strat");
        next.call(store,action)
        console.log("logger1 end")
    }
}*/


const logger = store => next => action => {
     console.log("logger1 strat");
     next.call(store,action)
     console.log("logger1 end")
}

const logger2 = store => next => action => {
     console.log("logger2 strat");
     next.call(store,action)
     console.log("logger2 end")
}

function useMiddleware(store, middles) {
    middles.reverse();
    middles.forEach((middle)=>{
        let next = store.dispatch;
        store.dispatch = middle(store)(next);
    })
}

useMiddleware(store,[logger,logger2]);
store.dispatch(action)
store.dispatch(action3)
