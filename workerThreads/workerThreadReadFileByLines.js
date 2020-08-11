
// parentPort for registering to events from main thread
console.log("Read Data line by line Worker Thread Started");
const {  parentPort, workerData } = require('worker_threads');
const lineReader = require('line-reader');

registerForEventListening();

function registerForEventListening () {

    // callback method is defined to receive data from main thread
    let cb = (err, result) => {
        if(err) return console.error(err);
        processDataAndSendData(result);
    };

    // registering to events to receive messages from the main thread
    parentPort.on('error', cb);
    parentPort.on('message', (msg) => {
        //console.log("Message From Parent for worker Thread 1", msg);
        cb(null, msg);
    });
}

function processDataAndSendData (objData) {
lineReader.eachLine(objData.filePath, function(line, last) {
    const lineObj = JSON.parse(line);
    if(lineObj.sym === objData.val.symbol) {
        parentPort.postMessage({ val: lineObj, SendToFSMThread:true, client_id: objData.client_id, interval: objData.val.interval });
    }
});
}
