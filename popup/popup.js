// variables
var tableList = document.getElementById('table-list');
var tableListingNode = document.getElementById('table-list-body');
var noTables = document.getElementById('no-tables');
var tabId;
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
 * Highlight Table by (index)
 *
 * @param {index} index of Table
 */
function highlightTableByIndex(index) { //Request Table Highlight to Background script
  // browser.runtime.sendMessage({event: "Request-Table-Highlight", tableIndex: index});
  browser.tabs.sendMessage(tabId, { event: "table-highlight", tableIndex: index }).then(handleMessage).catch(onError);
}
/*
 * Download Table by (index)
 *
 * @param {index} index of Table
 */
function downloadTableByIndex(index) {//Request Table Download to Background script
  // browser.runtime.sendMessage({event: "Request-Table-Download", tableIndex: index});
  browser.tabs.sendMessage(tabId, { event: "table-download", tableIndex: index }).then(handleMessage).catch(onError);
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
    // Display Table
    tableList.style.display = "none";
    // Display Table
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
 * Popup Script initialize
 * @param {} nil 
*/
function initPopup() {
  // Request Table List to Background script
  // browser.runtime.sendMessage({event: "Request-Table-List"});
  // Query the active tab and get table list from content script
  browser.tabs.query({ currentWindow: true, active: true })
    .then((tabs) => {
      tabId = tabs[0].id;
      browser.tabs.sendMessage(
        tabId,
        { event: "get-table-list" }
      ).then(handleMessage).catch(() => {
        // Content Script does not exists. Inject the content scripts
        browser.tabs.executeScript({file: "/inject/purify.min.js"})
          .then(() => {
            browser.tabs.executeScript({file: "/inject/cs.js"})
            .then(() => {
              // Retry the Query the active tab and get table list from content script
              browser.tabs.sendMessage(
                tabId,
                { event: "get-table-list" }
              ).then(handleMessage).catch(onError);
            });
          })
          .catch(onError);
      });
    })
    .catch(onError);
  // Display Table
  tableList.style.display = "none";
  // Display Table
  noTables.style.display = "block";
  // Call Translate
  translate();
}
/*
** Add Listener to Handle the message from Content Script
*/
// browser.runtime.onMessage.addListener(handleMessage);
// Call Initialize
initPopup();