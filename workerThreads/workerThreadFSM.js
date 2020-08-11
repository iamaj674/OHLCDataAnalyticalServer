
// parentPort for registering to events from main thread
console.log("Finite-State-Machine => Worker Thread Started");
const {  parentPort, workerData } = require('worker_threads');
const moment = require('moment');
let lastline = null;
let bar_num = 1;
registerForEventListening();

function registerForEventListening () {

    // callback method is defined to receive data from main thread
    let cb = (err, result) => {
        if(err) return console.error(err);

        //console.log("**** Multiple Factor Received From Parent Thread 2: ", result.multipleFactor, " ****");

        //  setting up interval to call method to multiple with factor
        processDataAndSendData(result.val, result.client_id, result.interval);
    };

    // registering to events to receive messages from the main thread
    parentPort.on('error', cb);
    parentPort.on('message', (msg) => {
        
        cb(null, msg);
    });
}

function processDataAndSendData (data, client_id, interval) {
    //console.log("Message From Parent for worker Thread 2 Processing");
    // interval is data sent by client by default interval set to 15 seconds
    //console.log(interval);
    if(!interval) {
        interval = 15;
    }
    let resObj = {};
    if(!lastline) {
       bar_num = 1;
       resObj.o = data.P;
       resObj.h = data.P;
       resObj.l = data.P;
       resObj.c = 0;
       resObj.volume = data.Q;
       resObj.event = "ohlc_notify",
       resObj.symbol = data.sym;
       resObj.bar_num = bar_num;
       lastline = Object.assign(data);
       lastline.o = resObj.o;
       lastline.h = resObj.h;
       lastline.l = resObj.l;
    } else {
        if (moment(new Date(data.TS2 * 1e-6)).diff(moment(new Date(lastline.TS2 * 1e-6)), "seconds") <= interval) {
            resObj.o = lastline.o;
            resObj.h =  Math.max(lastline.h ,data.P);
            resObj.l = Math.min(lastline.l,data.P);
            resObj.c = 0;
            resObj.volume = data.Q + lastline.Q;
            resObj.event = "ohlc_notify",
            resObj.symbol = data.sym;
            resObj.bar_num = bar_num;
            lastline = Object.assign(data);
            lastline.o = resObj.o;
            lastline.h = resObj.h;
            lastline.l = resObj.l;
            lastline.Q = resObj.volume;
        } else {
            lastline.c = lastline.P;
            //console.log(JSON.stringify(lastline));
            let obj_h = {o: lastline.o, h: lastline.h,l:lastline.l, c:lastline.c, volume:lastline.Q, event: "ohlc_notify", symbol: data.symbol, bar_num: bar_num }
            //console.log(JSON.stringify(obj_h));
            parentPort.postMessage({ val: obj_h, sendDataToClient:true, client_id: client_id });
            bar_num = bar_num + 1;
            parentPort.postMessage({ val: {"event":"ohlc_notify","symbol": data.sym ,"bar_num": bar_num}, sendDataToClient:true, client_id: client_id });
            console.log("*********  Starts bar", bar_num);
            resObj.o = data.P;
            resObj.h =   data.P;
            resObj.l =  data.P;
            resObj.c = 0;
            resObj.volume = data.Q;
            resObj.event = "ohlc_notify",
            resObj.symbol = data.sym;
            resObj.bar_num = bar_num;
            lastline = Object.assign(data);
            lastline.o = resObj.o;
            lastline.h = resObj.h;
            lastline.l = resObj.l;
        }
    }
    parentPort.postMessage({ val: resObj, sendDataToClient:true, client_id: client_id });

}
