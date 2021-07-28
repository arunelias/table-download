// variables
var tableList = document.getElementById('table-list');
var tableListingNode = document.getElementById('table-list-body');
var noTables = document.getElementById('no-tables');
var tabId;
const isChrome = typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype;
// Error handler
function onError(error) {
  console.error(`Error: ${error}`);
}
/*
 * Add Event Listner for Close button
*/
document.getElementById('close').addEventListener('click', function(){
    window.close();
});
/*
 * chrome.tabs.sendMessage wrapper function with Promise
*/
function sendMessageWithPromise(tabId, message) {
  if (!isChrome) return browser.tabs.sendMessage(tabId, message);
  return new Promise(function(resolve, reject) {
    try {
      chrome.tabs.sendMessage(tabId, message, function(response) {
        if (!response) reject(JSON.stringify(chrome.runtime.lastError));
        else if (response.event) resolve(response);
        else reject("Error in the response of sendMessage!");
      });
    } catch (error) { reject(error); }
  });
}
/*
 * chrome.tabs.query wrapper function with Promise
*/
function tabsQueryWithPromise(query) {
  if (!isChrome) return browser.tabs.query(query);
  return new Promise(function(resolve, reject) {
    try {
      chrome.tabs.query(query, function(tabs) {
        if (chrome.runtime.lastError) reject(JSON.stringify(chrome.runtime.lastError));
        else resolve(tabs);
        });
    } catch (error) { reject(error); }
  });
}
/*
 * chrome.tabs.executeScript wrapper function with Promise
*/
function executeScriptWithPromise(details) {
  if (!isChrome) return browser.tabs.executeScript(details);
  return new Promise(function(resolve, reject) {
    try {
      chrome.tabs.executeScript(details, function(results) {
        if (chrome.runtime.lastError) reject(JSON.stringify(chrome.runtime.lastError));
        else resolve(results);
        });
    } catch (error) { reject(error); }
  });
}
/*
 * Highlight Table by (index)
 *
 * @param {index} index of Table
 */
function highlightTableByIndex(index) { //Request Table Highlight to Background script
  sendMessageWithPromise(tabId, { event: "table-highlight", tableIndex: index }).then(handleMessage).catch(onError);
}
/*
 * Download Table by (index)
 *
 * @param {index} index of Table
 */
function downloadTableByIndex(index) {//Request Table Download to Background script
  sendMessageWithPromise(tabId, { event: "table-download", tableIndex: index }).then(handleMessage).catch(onError);
}
/*
 * Handle Table list message from Content Script
 *
 * @param {tableArray} tableArray Array of table Names 
*/
function handleTableList(tableArray) {
  var totTables = tableArray.length;
  var tableRow, tableRowData, tableRowDataElem;
  if (totTables > 0) {
    tableList.style.display = "block";
    //Hide No Result Info
    noTables.style.display = "none";
    // Clear the listing by removing nodes
    while (tableListingNode.lastChild) {
      tableListingNode.removeChild(tableListingNode.lastChild);
    }
    tableArray.forEach(function (item, index) { // Generate Listing Table
      tableRow = document.createElement('tr');
      // Table Name <td>
      tableRowData = document.createElement('td');
      tableRowData.className = "table-name-td";
      tableRowData.textContent = item;
      tableRowData.title = item;
      tableRowData.appendChild(document.createTextNode('\u00A0'));
      tableRow.appendChild(tableRowData);
      // Highlight button <td>
      tableRowData = document.createElement('td');
      tableRowData.className = "highlight";
      tableRowDataElem = document.createElement('button');
      tableRowDataElem.className = "highlight";
      tableRowDataElem.title = "Highlight Table";
      tableRowDataElem.dataset.index = index;
      // Add Event Listener to click event of the Table Highlight
      tableRowDataElem.addEventListener('click', function () { highlightTableByIndex(this.dataset.index); });
      tableRowData.appendChild(tableRowDataElem);
      tableRow.appendChild(tableRowData);
      // Download button <td>
      tableRowData = document.createElement('td');
      tableRowData.className = "download";
      tableRowDataElem = document.createElement('button');
      tableRowDataElem.className = "download";
      tableRowDataElem.title = "Download Table";
      tableRowDataElem.dataset.index = index;
      // Add Event Listener to click event of the Table Download
      tableRowDataElem.addEventListener('click', function () { downloadTableByIndex(this.dataset.index); });
      tableRowData.appendChild(tableRowDataElem);
      tableRow.appendChild(tableRowData);
      //Append to Listing
      tableListingNode.appendChild(tableRow);
    });
  } else {
    // Display No Tables message by default
    tableList.style.display = "none";
    noTables.style.display = "block";
  }
}
/*
 * Handle Messages from Other Scripts
 *
 * @param {request} Request Event
 * @param {sender} A runtime.MessageSender object representing the sender of the message.
 * @param {sendResponse} Response message object
*/
function handleMessage(request, sender, sendResponse) {
  console.log("Content Scripts => Popup Script: Event: " + request.event );
  if(request.event == "table-list") { // Got Table List from Content script
    handleTableList(request.tableArray);
  }
}
/*
 * Send the message to Content Script to get the table list
 *
 * @param {tabs} Active Tab from tabs query
*/
function getTableList(tabs) {
  tabId = tabs[0].id;
  message = { "event": "get-table-list" };
  sendMessageWithPromise(
    tabId,
    message
  ).then(handleMessage).catch(() => {
    // Content Script does not exists. Inject the content scripts
    executeScriptWithPromise({file: "/inject/purify.min.js"})
      .then(() => {
        executeScriptWithPromise({file: "/inject/cs.js"})
        .then(() => {
          // Retry the Query the active tab and get table list from content script
          sendMessageWithPromise(
            tabId,
            message
          ).then(handleMessage).catch(onError);
        });
      })
      .catch(onError);
  });
}
/*
 * Popup Script initialize
 * @param {} nil 
*/
function initPopup() {
  // Query the Active Tab to Inject Content script
  tabsQueryWithPromise({ currentWindow: true, active: true })
    .then(getTableList)
    .catch(onError);
  // Display No Tables message by default
  tableList.style.display = "none";
  noTables.style.display = "block";
  // Call Translate
  translate();
}
// Call Initialize
initPopup();