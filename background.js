let language;

if (typeof browser === "undefined") {
    var browser = chrome;
};


const url = "https://html2haml.herokuapp.com/api.json";

chrome.contextMenus.removeAll(function() {
	chrome.contextMenus.create({ title: "Convert to HAML", id:"convert-menu", contexts: ["selection"], documentUrlPatterns: ["*://*/*", "file:///*"]});
})
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	console.log("onclicked");
	if (info.menuItemId == "convert-menu"){
		let text = info.selectionText.trim().slice(0, 5000);
		console.log(text);
	
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "text/plain");

		var raw = `${text}`;
	
		var requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: raw,
		redirect: 'follow'
		};

		
		text = await fetch("https://cors-anywhere-yqzb.onrender.com/https://html2haml-api.onrender.com/html_content", requestOptions).then(
			r => r.ok ? r.json().then(obj => obj.message1) : "Error: " + r.statusText,
			e => "Error: " + e.message);

		let message = [text, info.frameId > 0, info.editable, language];
		if (!await chrome.tabs.sendMessage(tab.id, message).catch(e => false))
		{
			await chrome.scripting.insertCSS({target: {tabId: tab.id} , files: ["style.css"] });
			await chrome.scripting.executeScript({target: {tabId: tab.id} , files: ["script.js"] });
			chrome.tabs.sendMessage(tab.id, message);
		}
	}
})