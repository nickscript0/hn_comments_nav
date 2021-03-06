/**
 * HN Keynav Chrome Extension
 */

import { BrowserNav, Nav } from './browser_nav';
import { highlight_op, TextHighlight, Highlight } from './highlight';
import { Friends } from './friends';

function main() {
    const nav = new BrowserNav();
    const highlighter = new TextHighlight(nav);
    const friends = new Friends(nav);
    document.addEventListener('keypress', handle_keypress(nav, highlighter, friends), false);
    document.addEventListener('keydown', handle_keydown(nav), false);
    document.addEventListener('keyup', handle_keyup(nav), false);
    highlight_op();
    friends.highlightFriends();
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
