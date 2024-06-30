importScripts('chatgpt_client.js');

chrome.scripting.registerContentScripts([
    {
        id: `main_context_inject_${Math.random()}`,
        world: "ISOLATED",
        matches: ["https://x.com/*"],
        js: ["lib/inject.js"],
        css: ["css/inject.css", "css/popup.css"],
    },
]);

chrome.runtime.onInstalled.addListener(function (object) {
    chrome.tabs.query({ url: 'https://chatgpt.com/*' }, (tabs) => {
        tabs.forEach(tab => {
            //close tabs
            chrome.tabs.remove(tab.id);
        });
    });

    chrome.tabs.query({ url: 'https://x.com/*' }, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
        });
    })
});

const getChatGPResponse = (message, sender) => new Promise(resolve => {
    chrome.tabs.query({ url: 'https://chatgpt.com/*' }, async (tabs) => {
        try {
            let response;
            if (tabs.length > 0) {
                const chatGPTTab = tabs[0];
                //focus the tab
                await chrome.tabs.update(chatGPTTab.id, { active: true });
                response = await chrome.tabs.sendMessage(chatGPTTab.id, { type: 'generate_tweet', props: message.props });

                await chrome.tabs.update(sender.tab.id, { active: true });
                resolve(response);
            } else {
                (async () => {
                    const tab = await new Promise((resolve, reject) => {
                        chrome.tabs.create({ url: 'https://chatgpt.com', active: false }, (tab) => {
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError);
                            } else {
                                const waitingTimer = setInterval(() => {
                                    const allTabs = chrome.tabs.query({ url: 'https://chatgpt.com/*' }, async (tabs) => {
                                        const length = tabs.length;
                                        const tab = tabs[length - 1];
                                        const isTabReady = tab && tab.status === 'complete';
                                        if (isTabReady) {
                                            clearInterval(waitingTimer);
                                            await chrome.tabs.update(tab.id, { active: true });
                                            resolve(tab);
                                        }
                                    });
                                }, 300);
                            }
                        });
                    });

                    response = await chrome.tabs.sendMessage(tab.id, { type: 'generate_tweet', props: message.props });
                    await chrome.tabs.update(sender.tab.id, { active: true });
                    resolve(response);
                })()
            }

        } catch (error) {
            console.error('Error generating tweet:', error);
            resolve({ error: 'Failed to generate tweet' });
        }
    });
})



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message.type) {
        return;
    }

    switch (message.type) {
        case 'generate_tweet':
            (async () => {
                const gptResp = await getChatGPResponse(message, sender)
                sendResponse(gptResp)
            })()
            break;
        case 'show_notification':
            chrome.notifications.create({
                type: 'basic',
                iconUrl: './icons/32.png',
                title: 'Tweet Generation Error',
                message: message.message,
                priority: 2,
            });
            break;
    }

    return true; // Indicates we will send a response asynchronously
});
