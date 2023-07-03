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
 * Manifest v3 supports Promise
*/
function sendMessageWithPromise(tabId, message) {
  if (!isChrome) return browser.tabs.sendMessage(tabId, message);
  else return chrome.tabs.sendMessage(tabId, message);
}
/*
 * chrome.tabs.query wrapper function with Promise
 * Manifest v3 supports Promise
*/
function tabsQueryWithPromise(query) {
  if (!isChrome) return browser.tabs.query(query);
  else return chrome.tabs.query(query);
}
/*
 * chrome.tabs.executeScript wrapper function with Promise
 * Manifest v3 supports Promise
*/
function executeScriptWithPromise(details) {
  if (!isChrome) return browser.tabs.executeScript(details.tabs[0].id, {file: details.file});
  else return chrome.scripting.executeScript({target: {tabId: details.tabs[0].id}, files: [details.file]});
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
 * Copy Table by (index)
 *
 * @param {index} index of Table
 */
function copyTableByIndex(index) {//Request Table Copy to Background script
  sendMessageWithPromise(tabId, { event: "table-copy", tableIndex: index }).then(handleMessage).catch(onError);
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
      // Copy button <td>
      tableRowData = document.createElement('td');
      tableRowData.className = "copy";
      tableRowDataElem = document.createElement('button');
      tableRowDataElem.className = "copy";
      tableRowDataElem.title = "Copy Table";
      tableRowDataElem.dataset.index = index;
      // Add Event Listener to click event of the Table Copy
      tableRowDataElem.addEventListener('click', function () {
        copyTableByIndex(this.dataset.index);
        this.className = "copySuccess";
      });
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
  if(request.event == "table-blob" && request.dataUrl) { // Got Table Copy Blob from Content script
    console.log(request.dataUrl );
    fetch(request.dataUrl).then(res => res.blob()).then(
      (blob) => {
        console.log(blob);
        const type = "text/html";
        const data = [new ClipboardItem({ [blob.type]: blob })];
        navigator.clipboard.write(data).then(
          () => {
            console.log("Copied Table");
          },
          (err) => {
            console.log("Unable to copy: " + err);
          }
        );
      }
    );
    // const blob2 = async () => { const blob1 = await (await fetch(request.dataUrl)).blob(); console.log(blob1 ); }
    // console.log(blob1 );
    // const copyRichText = async () => {
    //   const response = await fetch(request.dataUrl);
    //   const blob = await response.blob();
    //   await navigator.clipboard.write([
    //     new ClipboardItem({ "text/html": blob }),
    //   ]).then(
    //       () => {
    //       console.log("Copied Table");
    //       },
    //       (err) => {
    //       console.log("Unable to copy: " + err);
    //       }
    //       );
      // const content = document.getElementById("richTextInputId").innerHTML;
      // const blob = new Blob([content], { type: "text/html" });
      // const richTextInput = new ClipboardItem({ "text/html": blob });
      // await navigator.clipboard.write([richTextInput]);
    // };
    // const data = fetch(request.dataUrl);
		// const blob = data.blob();
		// navigator.clipboard.write([ new ClipboardItem({ 'text/html': request.dataUrl }) ]);
    // navigator.clipboard.write([new ClipboardItem({[request.blobTable.type]: request.blobTable})]).then(
    //   () => {
    //   console.log("Copied Table");
    //   },
    //   (err) => {
    //   console.log("Unable to copy: " + err);
    //   }
    //   );
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
    executeScriptWithPromise({tabs: tabs, file: "/inject/purify.min.js"})
      .then(() => {
        executeScriptWithPromise({tabs: tabs, file: "/inject/cs.js"})
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