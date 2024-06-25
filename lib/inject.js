/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/utils/wait.ts
const wait = (timeout) => {
    return new Promise((res) => setTimeout(() => res(null), timeout));
};

;// CONCATENATED MODULE: ./src/inject/dom/add_gpt_button.ts

const gptIconSrc = chrome.runtime.getURL("icons/button.png");
const gptIconErrorSrc = chrome.runtime.getURL("icons/button_error.png");
const xIcon = chrome.runtime.getURL("icons/x.svg");
const closeIcon = chrome.runtime.getURL("icons/close.svg");
const settingsIcon = chrome.runtime.getURL("icons/settings.svg");
const tweetTypes = [
    { emoji: "👍", type: "supportive" },
    { emoji: "🎩", type: "snarky" },
    { emoji: "🌤️", type: "optimistic" },
    { emoji: "🔥", type: "controversial" },
    { emoji: "🤩", type: "excited" },
    { emoji: "🧠", type: "smart" },
    { emoji: "🤠", type: "hillbilly" },
    { emoji: "🏴‍☠️", type: "pirate" },
    { emoji: "🤣", type: "humorous" },
    { emoji: "🙄", type: "passive aggressive" },
];
const addGPTButton = async (toolbarEl, onClick) => {
    addGPTButtonWithType(toolbarEl, onClick);
};
const addPopup = (topic) => {
    console.log("ADD POPUP");
    return new Promise((resolve) => {
        const popupContainer = document.createElement("div");
        popupContainer.classList.add("gptPopupContainer");
        popupContainer.id = "gptPopupContainer";
        const handleMoodPress = (e) => {
            const topicObj = document.getElementById("topicInput");
            const topic = topicObj?.value || "Twitter";
            const mood = e.target.getAttribute("data-mood");
            console.log({ mood });
            popupContainer.remove();
            return resolve({ mood, topic });
        };
        const handleCloseButtonPress = () => {
            popupContainer.remove();
            resolve(undefined);
        };
        const handleSettingsButtonPress = () => {
            const url = chrome.runtime.getURL("assets/settings.html");
            window.open(url, "_blank")?.focus();
        };
        const html = `
    <div class="popupContent">
      <button class="close-button"><img src="${closeIcon}"></button>
      <button class="settings-button"><img src="${settingsIcon}" ></button>
      <div class="topicContainer">
        <div class="inputContainer">
          <img src="${xIcon}" class="xIcon" />
          <input type="text" class="topicInput" value="${topic || ""}" placeholder="What do you want to tweet about?" id="topicInput"/>
        </div>
      </div>
      <div class="moodsContainer">
        <div class="title">Moods</div>
        <div class="moods">
          ${tweetTypes
            .map((tt) => `<button class="mood" data-mood="${tt.type}">
                  <div class="emoji">${tt.emoji}</div>
                  <div class="type">${tt.type}</div>
                </button>`)
            .join("")}
      </div>
    </div>
  `;
        popupContainer.innerHTML = html;
        document.body.appendChild(popupContainer);
        const moodButtons = document.querySelectorAll(".mood");
        const closeButton = document.querySelector(".close-button");
        const settingsButton = document.querySelector(".settings-button");
        moodButtons.forEach((mb) => {
            mb.addEventListener("click", handleMoodPress);
        });
        closeButton?.addEventListener("click", handleCloseButtonPress);
        settingsButton?.addEventListener("click", handleSettingsButtonPress);
    });
};
const maybeReturnTopic = async () => {
    const replyState = await chrome.storage.local.get("isAddTopicForReplies");
    const isAddTopicForReplies = replyState.isAddTopicForReplies ?? false;
    const lastState = await chrome.storage.local.get("lastTopic");
    const lastTopic = lastState.lastTopic ?? "";
    const replyToTweet = document.querySelector('article[data-testid="tweet"][tabindex="-1"]');
    let topic;
    let type;
    const popupRes = (await addPopup(lastTopic));
    if (!popupRes)
        return undefined;
    topic = popupRes?.topic;
    type = popupRes?.mood;
    if (!replyToTweet || isAddTopicForReplies) {
        await chrome.storage.local.set({ lastTopic: topic });
    }
    return { topic: topic || lastTopic, type: type || "supportive" };
};
const addGPTButtonWithType = (toolbarEl, onClick) => {
    const doc = new DOMParser().parseFromString(`
        <div class="gptIconWrapper" id="gptButton">
            <img class="gptIcon" src="${gptIconSrc}" />
        </div>
    `, "text/html");
    const iconWrap = doc.querySelector('div[id="gptButton"]');
    const buttonContainer = toolbarEl.children[0];
    // attach to container
    buttonContainer.appendChild(iconWrap);
    iconWrap.onclick = async () => {
        const topicRes = (await maybeReturnTopic());
        const topic = topicRes?.topic;
        const type = topicRes?.type;
        if (!topic || !type)
            return;
        await onClick(type, topic);
        // const bodyRect = document.body.getBoundingClientRect();
        // const elemRect = iconWrap.getBoundingClientRect();
        // const top = elemRect.top - bodyRect.top;
        // const left = elemRect.left - bodyRect.left + 40;
        // let optionsList: HTMLDivElement;
        // let dismissHandler: GlobalEventHandlers["onclick"];
        // optionsList = createOptionsList(async (type: string) => {
        //   if (dismissHandler) {
        //     document.body.removeEventListener("click", dismissHandler);
        //   }
        //   if (optionsList) {
        //     optionsList.remove();
        //   }
        //   iconWrap.classList.add("loading");
        //   await onClick(type, topic);
        //   iconWrap.classList.remove("loading");
        // });
        // // adding settings button
        // const separator = document.createElement("div");
        // separator.classList.add("gptSeparator");
        // optionsList.appendChild(separator);
        // const item = document.createElement("div");
        // item.classList.add("gptSelector");
        // item.innerHTML = `⚙️&nbsp;&nbsp;Settings`;
        // item.onclick = (e) => {
        //   e.stopPropagation();
        //   const url = chrome.runtime.getURL("assets/settings.html");
        //   window.open(url, "_blank")?.focus();
        // };
        // optionsList.appendChild(item);
        // optionsList.style.left = `${left}px`;
        // optionsList.style.top = `${top}px`;
        // document.body.appendChild(optionsList);
        // dismissHandler = () => {
        //   if (dismissHandler) {
        //     document.body.removeEventListener("click", dismissHandler);
        //   }
        //   if (optionsList) {
        //     optionsList.remove();
        //   }
        // };
        // window.setTimeout(() => {
        //   document.body.addEventListener("click", dismissHandler!);
        // }, 1);
    };
};
const createOptionsList = (onClick) => {
    const container = document.createElement("div");
    container.classList.add("gptSelectorContainer");
    for (const tt of tweetTypes) {
        const item = document.createElement("div");
        item.classList.add("gptSelector");
        item.innerHTML = `${tt.emoji}&nbsp;&nbsp;${tt.type}`;
        item.onclick = (e) => {
            e.stopPropagation();
            onClick(tt.type);
        };
        container.appendChild(item);
    }
    return container;
};
const showErrorButton = async (toolbarEl) => {
    const gptIcon = toolbarEl.querySelector(".gptIcon");
    if (gptIcon) {
        gptIcon.setAttribute("src", gptIconErrorSrc);
        gptIcon.classList.add("error");
    }
    await wait(5000);
    gptIcon?.setAttribute("src", gptIconSrc);
    gptIcon?.classList.remove("error");
};

;// CONCATENATED MODULE: ./src/inject/dom/create_observer.ts
const createObserver = (selector, onInputAdded, onInputRemoved) => {
    return new MutationObserver((mutations_list) => {
        mutations_list.forEach((mutation) => {
            const addedNodes = mutation.addedNodes; // wrong typings
            addedNodes.forEach((added_node) => {
                if (added_node.querySelector) {
                    const inputEl = added_node.querySelector(selector);
                    if (!!inputEl) {
                        onInputAdded(inputEl);
                    }
                    ;
                }
            });
            const removedNodes = mutation.removedNodes;
            removedNodes.forEach((removed_node) => {
                if (removed_node.querySelector) {
                    const inputEl = removed_node.querySelector(selector);
                    if (!!inputEl) {
                        onInputRemoved(inputEl);
                    }
                    ;
                }
            });
        });
    });
};

;// CONCATENATED MODULE: ./src/inject/dom/find_closest_input.ts
// can be more optimised, but ¯\_(ツ)_/¯, typically common container is just 2-3 levels higher
const findClosestInput = (el) => {
    // Adjust the selector to target the contenteditable div
    const contentEditableEl = el.querySelector("div[data-testid^='tweetTextarea_'][contenteditable='true']");
    if (contentEditableEl) {
        return contentEditableEl;
    }
    // Recurse up the DOM tree if the element is not found
    if (!el.parentElement) {
        return null;
    }
    else {
        return findClosestInput(el.parentElement);
    }
};

;// CONCATENATED MODULE: ./src/inject/utils/generate_text.ts
const generateText = (props) => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'generate_tweet', props }, response => resolve(response));
    });
};

;// CONCATENATED MODULE: ./src/inject/dom/set_input_text.ts
const setInputText = async (el, text) => {
    const dataTransfer = new DataTransfer();
    // this may be 'text/html' if it's required
    dataTransfer.setData("text/plain", text);
    el.dispatchEvent(new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        // need these for the event to reach Draft paste handler
        bubbles: true,
        cancelable: true,
    }));
    // clear DataTransfer Data
    dataTransfer.clearData();
};

;// CONCATENATED MODULE: ./src/background/chat_gpt_client/locales.ts
const locales = {
    "af-ZA": [
        "Afrikaans",
        "Afrikaans"
    ],
    "ar": [
        "العربية",
        "Arabic"
    ],
    "bg-BG": [
        "Български",
        "Bulgarian"
    ],
    "ca-AD": [
        "Català",
        "Catalan"
    ],
    "cs-CZ": [
        "Čeština",
        "Czech"
    ],
    "cy-GB": [
        "Cymraeg",
        "Welsh"
    ],
    "da-DK": [
        "Dansk",
        "Danish"
    ],
    "de-AT": [
        "Deutsch (Österreich)",
        "German (Austria)"
    ],
    "de-CH": [
        "Deutsch (Schweiz)",
        "German (Switzerland)"
    ],
    "de-DE": [
        "Deutsch (Deutschland)",
        "German (Germany)"
    ],
    "el-GR": [
        "Ελληνικά",
        "Greek"
    ],
    "en-GB": [
        "English (UK)",
        "English (UK)"
    ],
    "en-US": [
        "English (US)",
        "English (US)"
    ],
    "es-CL": [
        "Español (Chile)",
        "Spanish (Chile)"
    ],
    "es-ES": [
        "Español (España)",
        "Spanish (Spain)"
    ],
    "es-MX": [
        "Español (México)",
        "Spanish (Mexico)"
    ],
    "et-EE": [
        "Eesti keel",
        "Estonian"
    ],
    "eu": [
        "Euskara",
        "Basque"
    ],
    "fa-IR": [
        "فارسی",
        "Persian"
    ],
    "fi-FI": [
        "Suomi",
        "Finnish"
    ],
    "fr-CA": [
        "Français (Canada)",
        "French (Canada)"
    ],
    "fr-FR": [
        "Français (France)",
        "French (France)"
    ],
    "he-IL": [
        "עברית",
        "Hebrew"
    ],
    "hi-IN": [
        "हिंदी",
        "Hindi"
    ],
    "hr-HR": [
        "Hrvatski",
        "Croatian"
    ],
    "hu-HU": [
        "Magyar",
        "Hungarian"
    ],
    "id-ID": [
        "Bahasa Indonesia",
        "Indonesian"
    ],
    "is-IS": [
        "Íslenska",
        "Icelandic"
    ],
    "it-IT": [
        "Italiano",
        "Italian"
    ],
    "ja-JP": [
        "日本語",
        "Japanese"
    ],
    "km-KH": [
        "ភាសាខ្មែរ",
        "Khmer"
    ],
    "ko-KR": [
        "한국어",
        "Korean"
    ],
    "la": [
        "Latina",
        "Latin"
    ],
    "lt-LT": [
        "Lietuvių kalba",
        "Lithuanian"
    ],
    "lv-LV": [
        "Latviešu",
        "Latvian"
    ],
    "mn-MN": [
        "Монгол",
        "Mongolian"
    ],
    "nb-NO": [
        "Norsk bokmål",
        "Norwegian (Bokmål)"
    ],
    "nl-NL": [
        "Nederlands",
        "Dutch"
    ],
    "nn-NO": [
        "Norsk nynorsk",
        "Norwegian (Nynorsk)"
    ],
    "pl-PL": [
        "Polski",
        "Polish"
    ],
    "pt-BR": [
        "Português (Brasil)",
        "Portuguese (Brazil)"
    ],
    "pt-PT": [
        "Português (Portugal)",
        "Portuguese (Portugal)"
    ],
    "ro-RO": [
        "Română",
        "Romanian"
    ],
    "ru-RU": [
        "Русский",
        "Russian"
    ],
    "sk-SK": [
        "Slovenčina",
        "Slovak"
    ],
    "sl-SI": [
        "Slovenščina",
        "Slovenian"
    ],
    "sr-RS": [
        "Српски / Srpski",
        "Serbian"
    ],
    "sv-SE": [
        "Svenska",
        "Swedish"
    ],
    "th-TH": [
        "ไทย",
        "Thai"
    ],
    "tr-TR": [
        "Türkçe",
        "Turkish"
    ],
    "uk-UA": [
        "Українська",
        "Ukrainian"
    ],
    "ur-PK": [
        "اردو",
        "Urdu"
    ],
    "vi-VN": [
        "Tiếng Việt",
        "Vietnamese"
    ],
    "zh-CN": [
        "中文 (中国大陆)",
        "Chinese (PRC)"
    ],
    "zh-TW": [
        "中文 (台灣)",
        "Chinese (Taiwan)"
    ]
};
const defaultLocale = 'en-US';

;// CONCATENATED MODULE: ./src/inject/inject.ts






const onToolBarAdded = (toolBarEl) => {
    let inputEl = findClosestInput(toolBarEl);
    if (inputEl) {
        addGPTButton(toolBarEl, async (type, topic) => {
            toolBarEl.click();
            const replyToTweet = document.querySelector("article[data-testid=\"tweet\"][tabindex=\"-1\"]");
            let replyTo = undefined;
            if (!!replyToTweet) {
                const textEl = replyToTweet.querySelector("div[data-testid=\"tweetText\"]");
                if (!textEl || !textEl.textContent) {
                    showErrorButton(toolBarEl);
                    return;
                }
                replyTo = textEl.textContent;
            }
            const text = await generateText({
                locale: (await chrome.storage.local.get('language')).language ?? defaultLocale,
                type,
                replyTo,
                topic
            });
            if (text) {
                inputEl = findClosestInput(toolBarEl);
                if (inputEl) {
                    setInputText(inputEl, text);
                }
            } else {
                showErrorButton(toolBarEl);
                chrome.runtime.sendMessage({
                    type: 'show_notification',
                    message: 'Failed to generate tweet. Please ensure you\'re logged into ChatGPT and try again.'
                });
            }
        });
    }
};

const onToolBarRemoved = (toolBarEl) => { };
// observe dom tree to detect all tweet inputs once they are created
const toolbarObserver = createObserver("div[data-testid=\"toolBar\"]", onToolBarAdded, onToolBarRemoved);
const reactRoot = document.querySelector("#react-root");
toolbarObserver.observe(reactRoot, { subtree: true, childList: true });

/******/ })()
;