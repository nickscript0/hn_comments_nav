/**
 * HN Keynav Chrome Extension
 */

import { BrowserNav, Nav } from "browser_nav";
import { highlight_op } from "highlight";

function main() {
    const nav = new BrowserNav();
    document.onkeypress = handle_key(nav);
    highlight_op();
}

function handle_key(nav: Nav) {
    const key_map = {
        'j': nav.next.bind(nav),
        'k': nav.previous.bind(nav),
        'J': nav.nextSameLevel.bind(nav),
        'K': nav.previousSameLevel.bind(nav),
        'n': nav.nextRoot.bind(nav),
        'm': nav.previousRoot.bind(nav)
    };
    return (e: KeyboardEvent) => {
        if (key_map[e.key]) key_map[e.key]();
    };
}

main();