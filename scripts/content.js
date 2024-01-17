// FUNCTION GET INNER TEXT BY RECURSION
function innerTextRecursive(element) {
    if (element && element.innerText) {
      s += element.innerText;
    }
    if (element && element.children) {
      innerTextRecursive(element.children[0]);
    }
  }

// FUNCTION CHECK FOR PRESENCE OF { .hP AND .ads AND URL.len>60 }
function checkConditions() {
    const h = document.getElementsByClassName("hP");
    const d = document.getElementsByClassName("ads");
  
    if (h.length > 0 && d.length > 0) {
      const currentURL = window.location.href;
      
      if (currentURL !== lastURL && currentURL.length>60) {
        console.log("URL: " + currentURL);
  
        s = "";
        s += "SUBJECT : " + h[0].innerText + "\n\nBODY : \n";
        
        innerTextRecursive(d[0]);
        
        lastURL = currentURL;
  
        // handleAsync(s);
      }
    }
  }
  
  // LISTEN FOR DOM CONTENT LOAD
  document.addEventListener("DOMContentLoaded", checkConditions);
  
  // LISTEN FOR DOM MUTATION
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      checkConditions();
    });
  });
  
  // START DOM OBSERVATION
  observer.observe(document.body, {
    subtree: true,  // WATCH FOR CHANGES IN { entire DOM subtree }
    childList: true, // WATCH FOR CHANGES IN { child elements }
  });