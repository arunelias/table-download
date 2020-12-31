/*
** Content Script - Table Download
*/
(function() {
	/**
	 * Check and set a global guard variable.
	 * If this content script is injected into the same page again,
	 * it will do nothing next time.
	 */
	if (window.hasTableDownload) { return; }
	window.hasTableDownload = true;
  
	/**
	 * Listen for messages from the Pop-up script.
	 * Return Table list or perform Highlight or Download
	 */  
	browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
		console.log("In content script, received message from pop-up script: " + message.event);
		switch (message.event) { // switch Case for Message Event
			// Table List requested from Pop-up
			case "get-table-list":
				var tableArray = [];
				document.querySelectorAll("table").forEach(function (element, i) {
					if (element.caption) { tableArray[i] = element.caption.innerText; }
					else if (element.id) { tableArray[i] = "Table #" + element.id; }
					else if (element.className) { tableArray[i] = "Table ." + element.className.split(/\s+/).join('.'); }
					else { tableArray[i] = "Table " + (i + 1); }
				});
				// Return the Table Name Array to Pop-up
				sendResponse({event: "table-list", tableArray: tableArray});
				break;
			// Table Highlight requested from Pop-up
			case "table-highlight":
				if (message.tableIndex !== null) {
					console.log("Highlighting Table with index: " + message.tableIndex);
					var table = document.getElementsByTagName("table")[message.tableIndex];
					table.scrollIntoView({block: "center"});
					var elementColor = table.style.backgroundColor;
					table.style.backgroundColor = "#ffff99";
					setTimeout(function(){ table.style.backgroundColor = elementColor; }, 500);
				}
				sendResponse({event: "table-highlight-acknowledge"});
				break;
			// Table Download requested from Pop-up
			case "table-download":
				if (message.tableIndex !== null) {
					console.log("Downloading Table with index: " + message.tableIndex);
					var dirtyHtml = document.getElementsByTagName("table")[message.tableIndex].outerHTML;
					// Purify the HTML
					var tableHtml = DOMPurify.sanitize(dirtyHtml);
					var excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta charset="utf-8"/><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Worksheet</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>${tableHtml}</table></body></html>`;
					var blob = new Blob([excelHtml], {type: "application/vnd.ms-excel;charset=utf-8"});
					var file = new File([blob], "table.xls", {type: "application/vnd.ms-excel;charset=utf-8"})
					var url = window.URL.createObjectURL(file);
					window.location = url;
					window.URL.revokeObjectURL(url);
				}
				sendResponse({event: "table-download-acknowledge"});
				break;
			// Default switch
			default:
				break;
		}
	});
})();
