// Message handlers

export function returnExtensionCookie(request, sender, sendResponse) {
  if (request.action === 'GET_COOKIE') {
    chrome.cookies.get({
      url: PPSettings.API_URL,
      name: request.name,
    }, (cookie: chrome.cookies.Cookie) => {
      if (cookie) {
        sendResponse({
          name: cookie.name,
          value: cookie.value,
        });
      } else {
        sendResponse({
          name: request.name,
          value: null,
        });
      }
    });
  }
  return true;
}

export function setBadge(request, sender, sendResponse) {
  if (request.action === 'SET_BADGE') {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      chrome.browserAction.setBadgeText({ text: request.text, tabId: tabs[0].id });
      sendResponse(request.text);
    });
  }
  return true;
}