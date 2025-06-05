/**
 * HN Keynav Chrome Extension
 */

import { BrowserNav, Nav, addNavButtonsToComments } from './browser_nav';
import { highlight_op, TextHighlight, Highlight } from './highlight';
import { Friends } from './friends';

function main() {
    const nav = new BrowserNav();
    const highlighter = new TextHighlight(nav);
    const friends = new Friends(nav);
    document.addEventListener('keypress', handle_keypress(nav, highlighter, friends), false);
    document.addEventListener('keypress', handleOtherKeypress, false);
    document.addEventListener('keydown', handle_keydown(nav), false);
    document.addEventListener('keyup', handle_keyup(nav), false);
    highlight_op();
    friends.highlightFriends();

    addNavButtonsToComments(nav);
}

async function handleOtherKeypress(e: KeyboardEvent) {
    if (e.key === 'X' && e.shiftKey === true && e.ctrlKey === true) {
        const errorMsg = `Error: Unable to parse title. The page format likely changed.`;
        const aElements = document.getElementsByClassName('titleline')[0].getElementsByTagName('a');
        if (aElements.length !== 2) {
            alert(errorMsg);
            return;
        }
        const title = aElements[0].textContent;
        const linkUrl = aElements[0].getAttribute('href');
        const linkText = aElements[1].textContent;
        if (!title || !linkUrl || title.trim() === '' || linkUrl.trim() === '') {
            alert(errorMsg);
            return;
        }

        const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
        const adocLinkText = `${url}[${title} (${linkText})] - ${document.URL}[HN Post]`;
        await navigator.clipboard.writeText(adocLinkText);
        alert(`Copied title to clipboard as adoc link.`);
    } else if (e.key === '?' && e.shiftKey === true) {
        console.log(`Not Implemented (Help)`);
        // TODO: This currently doesn't work to call openPopup likely not allowed in manifest v3 or a bug I think
        // https://github.com/GoogleChrome/developer.chrome.com/issues/2602
        //chrome.browserAction.openPopup()
    }
}

function handle_keypress(nav: Nav, highlight: Highlight, friends: Friends) {
    const key_map = {
        j: nav.next.bind(nav),
        k: nav.previous.bind(nav),
        J: nav.nextSameLevel.bind(nav),
        K: nav.previousSameLevel.bind(nav),
        n: nav.nextRoot.bind(nav),
        m: nav.previousRoot.bind(nav),
        N: nav.nextParent.bind(nav),
        M: nav.previousParent.bind(nav),

        l: nav.toggleCollapseThread.bind(nav),

        h: highlight.add.bind(highlight),
        c: highlight.clear.bind(highlight),

        f: friends.addCurrentElement.bind(friends),
    };
    return _keyInvoker(key_map);
}

function handle_keydown(nav: Nav) {
    const key_map = {
        p: nav.showParent.bind(nav),
    };
    return _keyInvoker(key_map);
}

function handle_keyup(nav: Nav) {
    const key_map = {
        p: nav.hideParent.bind(nav),
    };
    return _keyInvoker(key_map);
}

function _keyInvoker(key_map) {
    return (e: KeyboardEvent) => {
        const notTextArea = document?.activeElement?.tagName.toLowerCase() !== 'textarea';
        if (notTextArea && key_map[e.key]) key_map[e.key]();
    };
}

main();
