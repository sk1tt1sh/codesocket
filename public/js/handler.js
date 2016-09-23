var connection = new WebSocket('ws://localhost:4080');

connection.onopen = function () {
  connection.send('open'); // Send the message 'Ping' to the server
};
  // Log errors
connection.onerror = function (error) {
  console.log('WebSocket Error ' + error);
};

// Log messages from the server
connection.onmessage = function (e) {
  console.log('Server: ' + e.data);
  processMsg(e.data, connection);
  //var resp = prompt(e.data + '. Your response?','');
  //if(resp != null){connection.send(resp);}
};

function processMsg(msg, sock){
  switch(msg){
    case 'PING':
      sock.send('OK');
      break;
    case '\b':
    //-->Need complex type data to remove char at position in the text box
      console.log('Backspace.');
      removeChar();
      break;
    default:
    //-->Use complex type to set text at position in text box.
      appendChar(msg, msg == '\r');
      break;
  }
}

function specialKey(e){
  var keynum = (e.keyCode == null) ? e.keyCode : e.which;
  switch (keynum) {
    case 8:
      console.log('Backspace.specialKey');
      connection.send(keynum);
      break;
    case 13:
      console.log('Enter.specialKey');
      connection.send(keynum);
      break;
    default:
      /*Switch used due to about 6 other keys (such as shift/ctrl)*/
      break;
  }
}

function sendKey(e){
  var key = (e.keyCode == null) ? e.keyCode : e.which;
  if(key == 13 || key == 8){
    console.log("Got a special key dropping it.");
    return;
  }
  var ctl = document.getElementById('CodeBox');
  var start = ctl.selectionStart;
  var end = ctl.selectionEnd;
  console.log("Cursor pos: "+start+","+end);
  var cursorDataAndText = { cursorStart:start,cursorEnd:end,char:key };
  //connection.send((e.keyCode == null) ? e.keyCode : e.which);
  connection.send(JSON.stringify(cursorDataAndText));
}

function removeChar(){
  console.log('Got a backspace.');
  var tD = document.getElementById('OutputTbl').rows[0].cells[0];
  if(tD.innerHTML.length > 0){
    tD.innerHTML = tD.innerHTML.slice(0,-1);
  } // maybe delete backwards in message?
}

function appendChar(msg, newline){
  var box = document.getElementById('OutputTbl');
  var cBox = document.getElementById('CodeBox');

  if(newline || msg == "Hello!"){
    box.insertRow(0).insertCell(0);
    if(msg == "Hello!"){
      box.rows[0].cells[0].innerHTML = msg;
      box.insertRow(0).insertCell(0);
    }
    cBox.selectionStart = 0;
    cBox.selectionEnd = 0;
    cBox.value = '\r'+cBox.value;
    // Add some text to the new cells:
  } else {
    console.log("Adding char to line.");
    box.rows[0].cells[0].innerHTML += msg;
  }
}
