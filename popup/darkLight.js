function requestSetData(key, value) {
    chrome.runtime.sendMessage({ action: 'setData', key: key, value: value }, function(response) {
        // console.log('Data set');
    });
}

function requestGetData(key, callback) {
    chrome.runtime.sendMessage({ action: 'getData', key: key }, function(response) {
        if (callback) callback(response);
    });
}

// // Example usage
// requestSetData('myKey', 'myValue');
// requestGetData('myKey', function(data) {
//     console.log('Data retrieved:', data);
// });

let dark; 
let darkLight = document.getElementById("darkLight");

function updateMode () {
    requestGetData('dark', function(data) {
        dark = data;
        // console.log("MODE : ",dark);
        if(dark=='dark' && !document.body.classList.contains('dark')) {
            document.body.classList.add('dark');
            darkLight.innerText = 'Light Mode';
        }
        else {
            document.body.classList.remove('dark');
            darkLight.innerText = 'Dark Mode';
        }
        // console.log("BODY CLASSLIST : ",document.body.classList);
    });
}

updateMode();


// console.log(darkLight);

function switchDark () {
    if(dark=='dark') dark = 'light';
    else dark = 'dark';

    requestSetData('dark', dark);
    
    updateMode();
}

darkLight.addEventListener('click', switchDark);

// chrome.storage.sync.get(['darkLight'], function(result) {
//     console.log('Current Mode : ' + result.key);
//     alert('Current Mode : ' + result.key);
// });