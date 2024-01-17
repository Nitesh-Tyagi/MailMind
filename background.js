function setData(key, value, callback) {
    chrome.storage.sync.set({ [key]: value }, function() {
        if (callback) callback();
    });
}

function getData(key, callback) {
    chrome.storage.sync.get([key], function(result) {
        if (callback) callback(result[key]);
    });
}

// getData, setData
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'setData') {
        setData(request.key, request.value, sendResponse);
        return true;
    } else if (request.action === 'getData') {
        getData(request.key, sendResponse);
        return true;
    }
});
