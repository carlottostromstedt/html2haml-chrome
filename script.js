document.body.insertAdjacentHTML("beforeend", '<div id="translate_selected_text_overlay"></div>\
	<div id="translate_selected_text"><div></div><div><div></div></div></div>');
let root = document.compatMode == "BackCompat" ? document.body : document.documentElement;
let overlay = document.getElementById("translate_selected_text_overlay");
let div = document.getElementById("translate_selected_text");

console.log("hello")

div.onclick = e => { e.stopPropagation(); };
div.firstChild.onmousedown = e => {
	e.preventDefault();
	overlay.style.display = "block";
	let old_x = div.offsetLeft - e.clientX;
	let old_y = div.offsetTop - e.clientY;
	let event_mouse_move = e => {
			e.preventDefault();
			div.style.top = old_y + e.clientY + "px";
			div.style.left = old_x + e.clientX + "px";
		};
	let event_mouse_up = e => {
			overlay.removeAttribute("style");
			document.removeEventListener("mousemove", event_mouse_move);
		};
	document.addEventListener('mouseup', event_mouse_up, { once: true });
	document.addEventListener('mousemove', event_mouse_move);
};

let div_hide = e => { div.removeAttribute("style"); };
chrome.runtime.onMessage.addListener(([text, frame, editable, language]) => {
	console.log(text);
	div.setAttribute("lang", language);
	div.style.top = div.style.left = "0px";
	div.children[1].removeAttribute("style");
	div.children[1].scrollTop = 0;
	
	div.children[1].firstChild.textContent = text;
	console.log(div.children[1].firstChild.textContent);
	div.children[1].style.width = div.children[1].offsetWidth + 200 + "px";
	div.children[1].style.height = Math.min(root.clientHeight - 25, div.children[1].offsetHeight) + "px";
	
	let max_x = root.clientWidth - div.offsetWidth;
	let max_y = root.clientHeight - div.offsetHeight;
	let position = frame ? { left: max_x / 2, bottom: max_y / 2 - 10 } :
		editable ? document.activeElement.getBoundingClientRect() :
		window.getSelection().getRangeAt(0).getBoundingClientRect();
	div.style.top = Math.max(0, Math.min(position.bottom + 10, max_y)) + "px";
	div.style.left = Math.max(0, Math.min(position.left, max_x)) + "px";
	
	div.style.visibility = "visible";
	document.addEventListener("click", div_hide, { once: true });
	document.activeElement.blur();
	return Promise.resolve(true);
});
window.addEventListener("blur", e => {
	setTimeout(() => {
		if (document.activeElement != document.body)
			div_hide();
	}, 50);
});