/*
** Content Script - Table Download
*/
let tdPort = browser.runtime.connect({name:"port-from-cs"});
// onMessage Listner
tdPort.onMessage.addListener(function(message) {
	console.log("In content script, received message from background script: " + message.event);
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
			tdPort.postMessage({event: "table-list-from-cs", tableArray: tableArray});
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
				var url = window.URL.createObjectURL(blob);
				window.location = url;
				window.URL.revokeObjectURL(url);
			}
			break;
	
		default:
			break;
	}
});