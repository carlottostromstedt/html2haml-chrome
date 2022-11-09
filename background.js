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
		myHeaders.append("Content-Type", "application/json");
	
		var raw = `{'page': {'html':'${text}'}}`;
	
		var requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: raw,
		redirect: 'follow'
		};

		
		text = await fetch("https://rocky-spire-72250.herokuapp.com/https://html2haml.herokuapp.com/api.json", requestOptions).then(
			r => r.ok ? r.json().then(obj => obj.page.haml) : "Error: " + r.statusText,
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