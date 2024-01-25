function requestSetData(key, value) {
    chrome.runtime.sendMessage({ action: 'setData', key: key, value: value }, function(response) {});
}

function requestGetData(key, callback) {
    chrome.runtime.sendMessage({ action: 'getData', key: key }, function(response) {
        if (callback) callback(response);
    });
}

let key = document.getElementById('key');
let left = document.getElementById('left');
let right = document.getElementById('right');

async function checkOpenAIKey(apiKey) {
    const url = 'https://api.openai.com/v1/engines';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.ok) {
            return true;
        } else {
            console.error("Invalid API key or other error:", response.statusText);
            return false;
        }
    } catch (error) {
        console.error("Error checking API key:", error);
        return false;
    }
}

function checkKey () {
    if (key && key.value.trim() === '') {
        alert('Please Enter an API Key!');
        return false;
    }
    if(!checkOpenAIKey(key.value.trim())) return false;
    
    return true;
}

function stage12 () {
    if(checkKey()) {
        requestSetData('openID', key.value);
        requestSetData('stage', 2);
        animate12();
    }
    else return;
}

function stage23 () {
    requestSetData('stage', 3);
    animate23();
}

function stage21 () {
    requestSetData('openID', '');
    requestSetData('stage', 1);
    animate21();
}

function stage32 () {
    requestSetData('stage', 2);
    animate32();
}

function leftClick () {
    requestGetData('stage', function(stage) {
        if(stage==2) stage21();
        else if(stage==3) stage32();
    });
}

function rightClick () {
    requestGetData('stage', function(stage) {
        if(stage==1) stage12();
        else if(stage==2) stage23();
    });
}

left.addEventListener('click', leftClick);
right.addEventListener('click', rightClick);