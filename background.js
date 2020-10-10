"use strict";
console.clear();
function onError(e) {console.error(`Error: ${e}`);}
/*
 * Handle Messages from Other Scripts
 *
 * @param {request} Request Event
 * @param {sender} Tabs.tab Object, 
 * @param {sendResponse} Response message object
*/
function handleMessage(request, sender, sendResponse) {
  console.log("Pop-up Script => Background Script: Event: " + request.event );
  switch(request.event) {// switch Case for Event
    // Table List request message from Pop-up script.
    case "Request-Table-List":
      portFromCS.postMessage({event: "get-table-list"});
    break;
    // Table Highlight request message from Pop-up script.
    case "Request-Table-Highlight":
      portFromCS.postMessage({event: "table-highlight", tableIndex: request.tableIndex});
    break;
    // Table Download request message from Pop-up script.
    case "Request-Table-Download":
      portFromCS.postMessage({event: "table-download", tableIndex: request.tableIndex});
    break;

    default:
    //Default Switch - No Action";
    break;
  }
}
/*
** Add Listener to Handle the message from Other Scripts
*/
browser.runtime.onMessage.addListener(handleMessage);
/*
 * Handle Connect from Content Scripts
 *
 * @param {p} Message Port
*/
let portFromCS;
function connected(p) {
  portFromCS = p;
  // onMessage Listner
  portFromCS.onMessage.addListener(function(message) {
    console.log("Content Script => Background Script: Event: " + message.event);
    // Table List Received. Send the Table List to the Pop-up script
    if (message.event=="table-list-from-cs") { browser.runtime.sendMessage({event: "table-list", tableArray: message.tableArray}); }
  });
}
/*
** Add Listener to Handle the Connect from Content Scripts
*/
browser.runtime.onConnect.addListener(connected);
