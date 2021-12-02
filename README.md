<!--img src="./readme-resources/wip.jpg" style="width: 350px; height: 345px;"-->

# Table Download
This add-on is used to download HTML tables from webpages as XLS file.

Install from the [Add-ons for Firefox](https://addons.mozilla.org/en-US/firefox/addon/table-download/) [Chrome Web Store](https://chrome.google.com/webstore/detail/fgbeljjpgojmkhficlfdeclfmfmgkahp)

### Purpose

Download HTML table as XLS file

Download HTML Tables from pages in spreadsheet format XLS.
The data is copied in raw HTML format and a warning will be displayed while opening the file.
HTML code is sanitized using [DOMPurify](https://github.com/cure53/DOMPurify) library. DOMPurify will strip out everything that contains dangerous HTML and thereby prevent XSS attacks and other nastiness.

### Contents

* [Installation](#installation)
* [Browser compatibility](#browser-compatibility)
* [What's next](#whats-next)
* [Credits](#credits)
* [Info](#info)

## Installation

- Download the repository and extract.
- Go to [`about:debugging`](https://developer.mozilla.org/en-US/docs/Tools/about:debugging) and load it as temporary extension

## Browser compatibility:
<img title="Firefox" src="readme-resources/browsers/firefox.png" style="width: 64px;"/>
<img title="Chrome" src="readme-resources/browsers/chrome.png" style="width: 64px;"/>

## What's next 

TODO

## Credits

- Icons by [Firefox Photon icons](https://design.firefox.com/icons/viewer/)
- [Christian Kaindl](https://github.com/christiankaindl) for Translate an HTML page with the i18n API

## Info

*Table Download* is written and maintained by [Arun](https://github.com/arunelias)  
License: [MIT](https://github.com/arunelias/Table-Download/blob/master/LICENSE)
