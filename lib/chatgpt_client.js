async function getInputBox() {
    const inputBox = document.querySelector('textarea[data-id="root"]');
    if (!inputBox) {
        throw new Error('Could not find ChatGPT input box');
    }
    return inputBox;
}

async function getSubmitButton() {
    const submitButton = document.querySelector('button[data-id="root"]');
    if (!submitButton) {
        throw new Error('Could not find ChatGPT submit button');
    }
    return submitButton;
}

async function getLastResponse() {
    const responseElements = document.querySelectorAll('.markdown');
    if (responseElements.length === 0) {
        throw new Error('No response found');
    }
    return responseElements[responseElements.length - 1].textContent;
}

async function generateTweet(props) {
    return new Promise(async (resolve) => {
        const chatGPTTab = await getOrCreateChatGPTTab();
        await focusTab(chatGPTTab.id);

        chrome.runtime.sendMessage({ type: 'generate_tweet', props }, async (response) => {
            return resolve(response);
        });
    })
}

function getOrCreateChatGPTTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ url: 'https://chat.openai.com/*' }, (tabs) => {
            if (tabs.length > 0) {
                resolve(tabs[0]);
            } else {
                chrome.tabs.create({ url: 'https://chat.openai.com/', active: false }, (tab) => {
                    resolve(tab);
                });
            }
        });
    });
}

function focusTab(tabId) {
    return new Promise((resolve) => {
        chrome.tabs.update(tabId, { active: true }, resolve);
    });
}

function closeChatGPTTab(tabId) {
    return new Promise((resolve) => {
        chrome.tabs.remove(tabId, resolve);
    });
}
