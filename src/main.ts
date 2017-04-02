/**
 * HN Keynav Chrome Extension
 */

import { BrowserNav, Nav } from "browser_nav";
import { highlight_op, TextHighlight, Highlight } from "highlight";

function main() {
    const nav = new BrowserNav();
    const highlighter = new TextHighlight();
    document.addEventListener("keypress", handle_key(nav, highlighter), false);

    highlight_op();
}

function handle_key(nav: Nav, highlight: Highlight) {
    const key_map = {
        'j': nav.next.bind(nav),
        'k': nav.previous.bind(nav),
        'J': nav.nextSameLevel.bind(nav),
        'K': nav.previousSameLevel.bind(nav),
        'n': nav.nextRoot.bind(nav),
        'm': nav.previousRoot.bind(nav),

        'h': highlight.add.bind(highlight),
        'c': highlight.clear.bind(highlight),
    };
    return (e: KeyboardEvent) => {
        if (key_map[e.key]) key_map[e.key]();
    };
}

main();