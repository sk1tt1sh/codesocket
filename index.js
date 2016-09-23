var server = require('http').createServer()
  , url = require('url')
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = 4080;

const util = require('util')
app.use(express.static('public'));
app.use(express.static('node_modules/bootstrap/dist'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/page.html');
});

var connArr = []
var timer

wss.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  connArr.push(ws);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  if(timer == null){
    console.log('Starting ping timer...');
    timer = setInterval(sendPing,2000);
  }

  ws.on('message', function incoming(message) {
    ///Make parsing time for complex messages
    if(message === 'OK'){
      return; //update the item in connArr to indicate it's still alive...
    }
    console.log('received: %s', message);
    console.log(util.inspect(message, {showHidden: true, depth: 2}));
    switch (message) {
      case '8':
        console.log('Got Backspace');
        ws.send(String.fromCharCode(message));
        break;
      case '13':
        console.log('Got newline');
        ws.send(String.fromCharCode(message));
        break;
      default:
        messageParse(message, ws);
        break;
    }
  });

  console.log("Sending hello...");
  ws.send('Hello!');
  ws.on('error', function(err){
    console.log(err);
  });

  //console.log(util.inspect(ws, {showHidden: false, depth: null}));
});

function messageParse(msg, socket){
  //do things and stuff.
  //Store it in memcache or some how "source control" it.
  socket.send(msg);
}

function sendPing(){
  if(connArr.length == 0){
    console.log('Delete ping timer.');
    clearInterval(timer);
    timer = null;
  }
  var remIdx = [];
  for(var i=0; i<connArr.length; i++){
    var ws = connArr[i];
    /* Connecting=0,Open=1,Closing=2,Closed=3*/
    if(ws.readyState != 1){
      remIdx.push(i);
    } else {
      connArr[i].send('PING');
    }
  }
  for(var i=0; i<remIdx.length; i++){
    console.log('Removed dead client at: '+i+
      '. State: '+connArr[i].readyState);
    connArr.splice(i,1);
  }
}

server.on('request', app); // app is the callback with implied .use
server.listen(port, function () { console.log('Listening on ' + server.address().port) });
