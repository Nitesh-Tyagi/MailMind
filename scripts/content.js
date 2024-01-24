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

let lastURL = "";
var s = "";

async function processEmailWithOpenAI(apiKey, body) {
  const url = 'https://api.openai.com/v1/completions';
  const prompt = `"Process this email and give me the result in a json like structured format\n{\n  \"subject\"  :  \"\",\n  \"summary\" : \"\",\n  \"reply\" : \"\"\n}\n- subject : summary of the subject, between 100 and 200 characters\n- summary : summary of email, between 800 and 1000 characters\n- reply : a positive reply of the email, between 800 and 1000 characters, reply should not contain a subject line, try unserstanding my name for reply from the email if not found don't use any name\n\n${body}`;

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
              max_tokens: 500 // adjust as needed
          })
      });

      if (response.ok) {
          const data = await response.json();
          return JSON.parse(data.choices[0].text.trim());
          // return data.choices[0].text.trim();
      } else {
          console.error("Error processing email with status:", response.status, "and status text:", response.statusText);
          const errorData = await response.json();
          console.error("Error details:", errorData);
          return null;
      }
  } catch (error) {
      // console.error("Error during API request:", error);
      // return null;
  }
}

function displayData(data) {
  console.log("SUBJECT : ",data.subject);
  console.log("SUMMARY : ",data.summary);
  console.log("REPLY : ",data.reply);

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
      console.log("MODE : ",dark);
      if(dark=='dark' && !box.classList.contains('dark')) {
          box.classList.add('dark');
          hideButton.classList.add('dark');
      }
      else {
          box.classList.remove('dark');
          hideButton.classList.remove('dark');
      }
      console.log("BODY CLASSLIST : ",box.classList);
  });

  let summary = document.createElement('div');
  summary.classList.add('innerBox');
  // summary.innerText = data.subject + "\n\n" + data.summary;

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
  
  // reply.innerText = data.reply;

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
      // console.log("!!! REPLY : ",replyTop,"\n\n",data.reply);
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

  console.log("BOX : ",box);
}

// async function processEmailWithOpenAI(apiKey, body) {
//   var data = {
//     "subject": "Free Trial Subscription Expiry",
//     "summary": "Microsoft notifies the expiry of your Azure Free Trial subscription on 20 January 2024. It includes instructions for upgrading or renewing the subscription, depending on your current plan (free trial, monetary commitment, BizSpark program). Additional resources for Azure, privacy statement, and support options are mentioned. Email is from an unmonitored address.",
//     "reply": "Subject: Continuation of Azure Free Trial Subscription\n\nDear Microsoft Azure Team,\n\nI am interested in continuing my subscription post the free trial. I've found Azure services beneficial and would like to explore more features. Please guide me on upgrading or renewing my subscription.\n\nBest regards,\n[Your Name]",
//     "unsubscribeLink": null
//   }

//   return data;
// };

function handleAsync(body) {
    // console.log("READCHED : 3");

    requestGetData('stage', function(stage) {
        // console.log("STAGE : ",stage);
        // if(stage==3) console.log("STAGE IS THREE");
        if(stage==3){
            console.log(body);
            requestGetData('openID', function(key) {
              console.log("DISPLAYING");
              processEmailWithOpenAI(key, JSON.stringify(body))
              .then(result => displayData(result))
              .catch(error);
              // .catch(error => console.error(error));
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
        // console.log("STAGE : ", stage);
        return stage;
    }).catch(error => {
        // console.error("Error in checkStage:", error);
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
    console.log("REMOVING : ", box);
    while(box && box[0]) {
      document.body.removeChild(box[0]);
    }
    while(hideButton && hideButton[0]) {
      document.body.removeChild(hideButton[0]);
    }
    return;
  }
//   console.log("CHECKING CONDITIONS");
  const h = document.getElementsByClassName("hP");
  const d = document.getElementsByClassName("ads");

  if (regex.test(currentURL) && h.length > 0 && d.length > 0) {
    // console.log("READCHED : 1");
    // if () {

      //   console.log("READCHED : 2");
      // console.log("URL: " + currentURL);

      s = "";
      s += "SUBJECT : " + h[0].innerText + "\n\nBODY : \n";
      
      innerTextRecursive(d[0]);
      
      // lastURL = currentURL;

      // console.log("DISPLAYING : ",s);
      handleAsync(s);
    // }
  }
}
  
// // LISTEN FOR DOM CONTENT LOAD
// document.addEventListener("DOMContentLoaded", checkConditions);

// // LISTEN FOR DOM MUTATION
// const observer = new MutationObserver(function (mutations) {
//   mutations.forEach(function (mutation) {
//     checkConditions();
//   });
// });

// // START DOM OBSERVATION
// observer.observe(document.body, {
//   subtree: true,  // WATCH FOR CHANGES IN { entire DOM subtree }
//   childList: true, // WATCH FOR CHANGES IN { child elements }
// });

// let lastURL = window.location.href;

function checkForUrlChange() {
    const currentUrl = window.location.href;
    if (lastURL !== currentUrl) {
        lastURL = currentUrl;
        console.log("CHECKING");
        checkConditions();
    }
}

// Check for URL change every 500 milliseconds
setInterval(checkForUrlChange, 1000);

// Initial check
checkConditions();


console.log("CONTENT JS WORKING");