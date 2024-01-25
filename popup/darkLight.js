function requestSetData(key, value) {
    chrome.runtime.sendMessage({ action: 'setData', key: key, value: value }, function(response) {});
}

function requestGetData(key, callback) {
    chrome.runtime.sendMessage({ action: 'getData', key: key }, function(response) {
        if (callback) callback(response);
    });
}

let dark; 
let darkLight = document.getElementById("darkLight");

function updateMode () {
    requestGetData('dark', function(data) {
        dark = data;
        if(dark=='dark' && !document.body.classList.contains('dark')) {
            document.body.classList.add('dark');
            darkLight.innerText = 'Light Mode';
        }
        else {
            document.body.classList.remove('dark');
            darkLight.innerText = 'Dark Mode';
        }
    });
}

updateMode();

function switchDark () {
    if(dark=='dark') dark = 'light';
    else dark = 'dark';

    requestSetData('dark', dark);
    
    updateMode();
}

darkLight.addEventListener('click', switchDark);