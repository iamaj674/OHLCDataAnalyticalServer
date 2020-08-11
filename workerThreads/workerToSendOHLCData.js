console.log("WebSocket Worker Thread Started");
const {  parentPort, workerData } = require('worker_threads');
const WebSocket = require('ws');
let interval;

registerForEventListening();

function registerForEventListening () {

    // callback method is defined to receive data from main thread
    let cb = (err, result) => {
        if(err) return console.error(err);
        if(result.WebSocketInit) {
          WebSocketinit();
        } else if(result.sendDataToClient) {
          sendMsgToClient(result);
        }
    };

    // registering to events to receive messages from the main thread
    parentPort.on('error', cb);
    parentPort.on('message', (msg) => {
        //console.log("Message From Parent for worker Thread 1", msg);
        cb(null, msg);
    });
}


function sendMsgToClient (result) {
  //console.log("Sending Message to client");
  ws_client_array[result.client_id].send(JSON.stringify(result.val));
}
const ws_client_array = {};
function WebSocketinit () {
  const wss = new WebSocket.Server({ port: 8080 });
  console.log("Webscoket server listing at http://localhost:8080");
  wss.on('connection', ws => {
    ws.on('message', message => {

     let objMsg= JSON.parse(message.trim());
     if(typeof objMsg !== "object") {
      ws.send('Send Data Within JSON Format');
     }
     if(!objMsg.event || !objMsg.symbol || ! objMsg.interval) {
      ws.send('event, symbol & interval required');
     }
     let random = (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
     let client_id = `client_${random}`;
     ws_client_array[client_id] = ws;
     parentPort.postMessage({ val: objMsg, sendToReadFile:true, client_id: client_id });
    });
    ws.send('Scoket Connection Successful');
  });
}