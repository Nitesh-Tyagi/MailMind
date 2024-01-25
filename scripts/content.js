function requestSetData(key, value) {
  chrome.runtime.sendMessage({ action: 'setData', key: key, value: value }, function(response) {});
}

function requestGetData(key, callback) {
    chrome.runtime.sendMessage({ action: 'getData', key: key }, function(response) {
        if (callback) callback(response);
    });
}

let lastURL = "";
var s = "";

async function processEmailWithOpenAI(apiKey, body) {
  const url = 'https://api.openai.com/v1/completions';
  const prompt = `"Process this email and give me the result in a json like structured format\n{\n  \"subject\"  :  \"\",\n  \"summary\" : \"\",\n  \"reply\" : \"\"\n}\n- subject : summary of the subject, between 80 and 120 characters\n- summary : summary of email, between 600 and 700 characters\n- reply : a positive reply of the email, between 600 and 700 characters, reply should not contain a subject line, try unserstanding my name for reply from the email if not found don't use any name\n\n${body}`;

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              model: "gpt-3.5-turbo-instruct", // or the latest available model
              prompt: prompt,
              max_tokens: 2000 // adjust as needed
          })
      });

      if (response.ok) {
          const data = await response.json();
          return JSON.parse(data.choices[0].text.trim());
      } else {
          console.error("Error processing email with status:", response.status, "and status text:", response.statusText);
          const errorData = await response.json();
          console.error("Error details:", errorData);
          return null;
      }
  } catch (error) {}
}

function displayData(data) {
  if(!(data && data.subject && data.summary && data.reply)) return;
  let box = document.createElement('div');
  box.classList.add('box');
  requestGetData('hide', function(data) {
    if(data) {
      box.style.opacity = '100';
      box.style.zIndex = '10';
    }
    else {
      box.style.opacity = '0';
      box.style.zIndex = '-10';
    }
  });

  requestGetData('dark', function(data) {
      dark = data;
      if(dark=='dark' && !box.classList.contains('dark')) {
          box.classList.add('dark');
          hideButton.classList.add('dark');
      }
      else {
          box.classList.remove('dark');
          hideButton.classList.remove('dark');
      }
  });

  let summary = document.createElement('div');
  summary.classList.add('innerBox');

  let summaryTop = document.createElement('div');
  summaryTop.classList.add('boxTop');
  summaryTop.innerText = data.subject;
  let summaryBottom = document.createElement('div');
  summaryBottom.classList.add('boxBottom');
  summaryBottom.innerText = data.summary;

  summary.appendChild(summaryTop);
  summary.appendChild(summaryBottom);

  let reply = document.createElement('div');
  reply.classList.add('innerBox');
  reply.classList.add('clickable');

  let replyTop = document.createElement('div');
  replyTop.classList.add('boxTop');
  replyTop.innerText = 'Reply';
  let replyBottom = document.createElement('div');

  replyBottom.classList.add('boxBottom');
  replyBottom.innerText = data.reply;

  reply.appendChild(replyTop);
  reply.appendChild(replyBottom);

  reply.addEventListener('click',function () {
    navigator.clipboard.writeText(data.reply)
    .then(function() {
      setTimeout(function () {
          function addSpace(n) {
            return new Array(n + 1).join('&nbsp;');
          }
        replyTop.innerHTML = 'Reply' + addSpace(58) + 'Copied to Clipboard!';
        setTimeout(function () {
          replyTop.innerText = 'Reply';
        },3000);
      },500);
    })
    .catch();
  });

  let hideButton = document.createElement('div');
  hideButton.classList.add('hideButton');

  hideButton.addEventListener('click', function () {
    const box = document.getElementsByClassName('box')[0];
    requestGetData('hide', function(data) {
      data = 1 - data;
      if(data) {
        box.style.opacity = '100';
        box.style.zIndex = '10';
      }
      else {
        box.style.opacity = '0';
        box.style.zIndex = '-10';
      }

      requestSetData('hide',data);
    });
  })

  document.body.appendChild(hideButton);

  box.appendChild(summary);
  box.appendChild(reply);

  document.body.appendChild(box);
}

function handleAsync(body) {
    requestGetData('stage', function(stage) {
        if(stage==3){
            requestGetData('openID', function(key) {
              processEmailWithOpenAI(key, JSON.stringify(body))
              .then(result => displayData(result))
              .catch(error);
            });
        } 
    });
}


// FUNCTION GET INNER TEXT BY RECURSION
function innerTextRecursive(element) {
  if (element && element.innerText) {
    s += element.innerText;
  }
  if (element && element.children) {
    innerTextRecursive(element.children[0]);
  }
}

function checkStage() {
    return requestGetData('stage').then(stage => {
        return stage;
    }).catch(error => {
        return false;
    });
}

// FUNCTION CHECK FOR PRESENCE OF { .hP AND .ads AND URL.len>60 }
function checkConditions() {
  const regex = /inbox\//;
  const currentURL = window.location.href;

  if(!regex.test(currentURL)) {
    let box = document.getElementsByClassName('box');
    let hideButton = document.getElementsByClassName('hideButton');
    while(box && box[0]) {
      document.body.removeChild(box[0]);
    }
    while(hideButton && hideButton[0]) {
      document.body.removeChild(hideButton[0]);
    }
    return;
  }
  const h = document.getElementsByClassName("hP");
  const d = document.getElementsByClassName("ads");

  if (regex.test(currentURL) && h.length > 0 && d.length > 0) {
      s = "";
      s += "SUBJECT : " + h[0].innerText + "\n\nBODY : \n";
      
      innerTextRecursive(d[0]);
      handleAsync(s);
  }
}

function checkForUrlChange() {
    const currentUrl = window.location.href;
    if (lastURL !== currentUrl) {
        lastURL = currentUrl;
        checkConditions();
    }
}

setInterval(checkForUrlChange, 1000);

checkConditions();