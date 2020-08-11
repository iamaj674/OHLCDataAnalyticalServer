
// module included to create worker threads
const { Worker } = require('worker_threads');

// main attributes
let lst;    // list will be populated from 0 to n
let index = -1; // index will be used to traverse list
let myWorker; // worker reference
let interval;
let myWorkerToReadFile;
let myWorkerFSM;
mainBody();

function mainBody () {
    console.log("Main Thread Started");

    // filling array with 100 items
    lst = Array(1e2).fill().map((v,i) => i);

    // initiating worker process
    initiateWorker();

    // traversing list in main method with specific interval
    interval = setInterval(function(){ processDataInMainThread(); }, 1000);
}

// index and value of list will be consoled
function processDataInMainThread() {
    // update index
    index++;
    // check first length
    if ( lst.length > index) {
        //console.log("Message from Main Thread at Index: ", index, " and value is: ", lst[index]);
    }
    // no further calling if all items are traversed
    else {
        clearInterval(interval);
    }
}

// Defining callback method for receiving data or error on worker thread
function initiateWorker () {

    let cb = (err, result) => {
        if(err) { return console.error(err); }
    };

    // start worker
    myWorkerToReadFile = startWorker(__dirname + '/workerThreads/workerThreadReadFileByLines.js', cb);
    myWorkerFSM = startWorker(__dirname + '/workerThreads/workerThreadFSM.js', cb);
    myWorkerWS = startWorker(__dirname + '/workerThreads/workerToSendOHLCData.js', cb);

    //myWorkerToReadFile.postMessage({ filePath: __dirname + '/dataSet/treades.json' });
    myWorkerWS.postMessage({ WebSocketInit: true });
}

function startWorker(path, cb) {
    // sending path and data to worker thread constructor
    let w = new Worker(path, { workerData: lst });

    // registering events in main thread to perform actions after event triggered
    w.on('message', (msg) => {
        if(msg.SendToFSMThread) {
            myWorkerFSM.postMessage(msg);
        } else if(msg.sendToReadFile) {
            msg.filePath = __dirname + '/dataSet/treades.json'
            myWorkerToReadFile.postMessage(msg); 
        } else if(msg.sendDataToClient) {
            msg.sendDataToClient = true;
            myWorkerWS.postMessage(msg);
        }
        //myWorkerFSM.postMessage({ });
        cb(null, msg);
    });

    // for error handling
    w.on('error', cb);

    // for exit
    w.on('exit', (code) => {
        if(code !== 0) {
            console.error(new Error(`Worker stopped Code ${code}`))
        }
    });
    return w;
}
