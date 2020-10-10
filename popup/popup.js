// variables
var tableList = document.getElementById('table-list');
var tableListingNode = document.getElementById('table-list-body');
var noTables = document.getElementById('no-tables');
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
  browser.runtime.sendMessage({event: "Request-Table-Highlight", tableIndex: index});
}
/*
 * Download Table by (index)
 *
 * @param {index} index of Table
 */
function downloadTableByIndex(index) {//Request Table Download to Background script
  browser.runtime.sendMessage({event: "Request-Table-Download", tableIndex: index});
}
/*
 * Handle Table list message from Background Script
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
 * @param {request} Request Event, Request Rule id, Ajax Status and Tab Ajax Response URL
 * @param {sender} Tabs.tab Object, 
 * @param {sendResponse} Response message object
*/
function handleMessage(request, sender, sendResponse) {
  console.log("Background Scripts => Popup Script: Event: " + request.event );
  if(request.event == "table-list") { // Got Table List from Background script
    handleTableList(request.tableArray);
  }
}
/*
 * Popup Script initialize
 * @param {} nil 
*/
function initPopup() {
  // Request Table List to Background script
  browser.runtime.sendMessage({event: "Request-Table-List"});
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
browser.runtime.onMessage.addListener(handleMessage);
// Call Initialize
initPopup();