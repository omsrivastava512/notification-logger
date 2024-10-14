var isInitialized = false,
  _console = {};
Notification.requestPermission();
// Get current notification icon
happyIcon = "happy.png";
sadIcon = "unhappy.png";

function log(body, title, icon) {
  // send browser notifications only if page is hidden
  if (document.hidden) {
    sendNotification(body, title, icon);
  }
  sendToast(body, title, icon);
}

function err(body, title) {
  log(body, title, logger.sadIcon);
}

function originalFnCallDecorator(fn, fnName) {
  return function () {
    fn.apply(this, arguments);
    if (typeof _console[fnName] === "function") {
      _console[fnName].apply(console, arguments);
    }
  };
}

function destroy() {
  isInitialized = false;
  console.log = _console.log;
}

function init() {
  if (isInitialized) {
    return;
  }
  isInitialized = true;
  _console.log = console.log;
  console.log = originalFnCallDecorator(log, "log");
}

window.logger = {
  log: log,
  err: err,
  init: init,
  destroy: destroy,
  happyIcon: happyIcon,
  sadIcon: sadIcon,
};
function sendNotification(body, title, icon) {
  icon = icon || logger.happyIcon;
  title = title || "Notification";
  if (!("Notification" in window)) {
    sendToast(
      "Issue",
      "This browser does not support desktop notification",
      logger.sadIcon
    );
  } else if (Notification.permission === "granted") {
    new Notification(title, { body: body, icon: icon });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      if (permission === "granted") {
        new Notification(title, { body: body, icon: icon });
      }
    });
  }
}

(function createToast() {
  let toastContainter = document.createElement("div");
  toastContainter.classList.add("toast-container");
  generateStyle(toastContainter);
  document.querySelector("body").appendChild(toastContainter);
})();

function sendToast(body, title, icon) {
  let toastContainter = document.querySelector(".toast-container");
  // if number of notification >=5 other notifications go on hold until older notifcations closed
  if (toastContainter.children.length >= 5) {
    setTimeout(() => {
      sendToast(body, title, icon);
    }, 3000);
    return;
  }

  let time = Date().split(" GMT")[0].split(" ");
  time = time[time.length - 1];
  icon = icon || logger.happyIcon;
  title = title || "Notification";

  // image containg icon
  let iconhHolder = document.createElement("img");
  iconhHolder.classList.add("icon");
  iconhHolder.setAttribute("alt", icon.split(".")[0]);
  iconhHolder.setAttribute("src", icon);
  generateStyle(iconhHolder);

  // div containing title
  let toastHeading = document.createElement("div");
  toastHeading.style.fontWeight = 800;
  toastHeading.style.overflowWrap = "break-word";
  toastHeading.innerHTML = title;
  // div containing body
  let toastBody = document.createElement("div");
  toastBody.innerHTML = body;
  toastBody.style.overflowWrap = "break-word";
  // div containing notification time
  let toastTime = document.createElement("div");
  toastTime.innerHTML = time;
  toastTime.style.fontFamily = "monospace";
  toastTime.style.fontSize = "10px";
  // div holding title, body and time
  let toastContent = document.createElement("div");
  toastContent.classList.add("toast-content");
  toastContent.appendChild(toastHeading);
  toastContent.appendChild(toastBody);
  toastContent.appendChild(toastTime);
  generateStyle(toastContent);
  // button to close the
  let erase = document.createElement("button");
  erase.classList.add("erase");
  erase.innerHTML = "x";
  generateStyle(erase);
  erase.addEventListener("click", () => {
    toast.remove();
  });
  erase.addEventListener("mouseenter", () => {
    erase.style.color = "#000";
  });
  erase.addEventListener("mouseleave", () => {
    erase.style.color = "#808080";
  });

  // toast containing icon, content and erase
  let toast = document.createElement("div");
  toast.classList.add("toast-item");
  generateStyle(toast);
  toast.appendChild(iconhHolder);
  toast.appendChild(toastContent);
  toast.appendChild(erase);

  toastContainter.appendChild(toast);
}

// adding styling through the style object
function elementStyler(element, styleObject) {
  for (let key in styleObject) {
    if (Object.prototype.hasOwnProperty.call(styleObject, key)) {
      const val = styleObject[key];
      if (key.indexOf("-") > -1) {
        key = key
          .split("-")
          .map((w, i) => (i > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
          .join("");
      }
      const fn = new Function(`element,key,val`, `element.style.${key}=val; `);
      //   console.log(fn)
      fn(element, key, val);
    }
  }
}

// stores style objects and acts as a wrapper function for elementStyler
function generateStyle(elem) {
  let style = {};
  if (elem.classList.value.includes("toast-container")) {
    style = {
      position: "absolute",
      bottom: "2rem",
      right: "2rem",
      display: "flex",
      alignItems: "flex-end",
      "flex-direction": "column",
      overflow: "hidden",
      padding: "20px",
    };
  } else if (elem.classList.value.includes("toast-item")) {
    style = {
      "min-width": "30vw",
      minHeight: "12vh",
      background: "#fff",
      fontWeight: 500,
      margin: "4px 2px",
      "box-shadow": "0 0 20px rgba(0,0,0,0.3)",
      display: "flex",
      "align-items": "center",
      gap: "5px",
      padding: "2px",
      height: "auto",
      position: "relative",
    };
  } else if (elem.classList.value.includes("toast-content")) {
    style = {
      display: "flex",
      "flex-direction": "column",
      justifyContent: "space-between",
      alignItems: "space-between",
      width: "100%",
      height: "100%",
    };
  } else if (elem.classList.value.includes("icon")) {
    style = {
      height: "3.5rem",
      width: "3.5rem",
    };
  } else if (elem.classList.value.includes("erase")) {
    style = {
      background: "none",
      border: 0,
      fontFamily: "monospace",
      fontSize: "1.2rem",
      position: "absolute",
      top: "0",
      right: ".5em",
      cursor: "pointer",
      color: "#808080",
    };
  }
  elementStyler(elem, style);
}


// test by uncommenting the logs
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // console.log("Page is hidden");
  } else {
    // console.log("Page is visible");
  }
});
