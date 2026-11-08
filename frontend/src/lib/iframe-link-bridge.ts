export const IFRAME_NAVIGATE_MESSAGE_TYPE = "wyxan:navigate";
export const IFRAME_SCROLL_MESSAGE_TYPE = "wyxan:scroll";
export const IFRAME_SET_SCROLL_MESSAGE_TYPE = "wyxan:set-scroll";

export function getIframeLinkBridgeScript(): string {
  const navigateType = JSON.stringify(IFRAME_NAVIGATE_MESSAGE_TYPE);
  const scrollType = JSON.stringify(IFRAME_SCROLL_MESSAGE_TYPE);
  const setScrollType = JSON.stringify(IFRAME_SET_SCROLL_MESSAGE_TYPE);
  return `(function(){var N=${navigateType},S=${scrollType},R=${setScrollType};function report(){if(window.parent){window.parent.postMessage({type:S,scrollY:window.scrollY||0},"*");}}document.addEventListener("click",function(e){var n=e.target;while(n&&n.tagName!=="A")n=n.parentElement;if(!n)return;var h=n.getAttribute("href");if(!h)return;e.preventDefault();e.stopImmediatePropagation();report();if(window.parent){window.parent.postMessage({type:N,href:h},"*");}},true);window.addEventListener("scroll",report,{passive:true});window.addEventListener("message",function(e){if(e.source!==window.parent)return;var d=e.data;if(!d||d.type!==R||typeof d.scrollY!=="number")return;window.scrollTo(0,d.scrollY);});report();})();`;
}
