import Container from "./Infrastructure/Container";
import {ShowToastCommand} from "./Domain/ShowToastCommand";
import {Settings} from "./Infrastructure/Settings";

chrome.runtime.onInstalled.addListener(async () => {
    await chrome.storage.sync.set({
        settings: Settings.getDefaults()
    });
});

// @TODO: Auto refresh price after a week.
/*chrome.webNavigation.onCompleted.addListener(
    function () {
        chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message: "myMessage"});
        });
    },
    {url: [{hostSuffix: 'tcgcollector.com'}]}
);*/

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.cmd === ShowToastCommand.getCommandName()) {
        return;
    }

    const command = Container.getCommand(request.cmd);
    command.handle(request.payload).then(response => {
        sendResponse(response);
        if (command.getSuccessMessage) {
            pushMessageToContent(command.getSuccessMessage(request.payload));
        }
    }).catch(e => {
        pushErrorToContent(e.message);
    });

    return true;
});

const pushMessageToContent = (msg) => {
    chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            cmd: ShowToastCommand.getCommandName(), payload: {type: 'success', msg: msg}
        });
    });
}

const pushErrorToContent = (msg) => {
    chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            cmd: ShowToastCommand.getCommandName(), payload: {type: 'error', msg: msg}
        });
    });
}