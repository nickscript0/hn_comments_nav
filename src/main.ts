/**
 * HN Keynav Chrome Extension
 */

import {BrowserNav, Nav} from "browser_nav";

function main() {
    const nav = new BrowserNav();
    document.onkeypress = handle_key(nav);
    highlight_op();
}

/**
 * Highlight the original poster's name throughout the page
 */
function highlight_op() {
    const op_name = document.getElementsByClassName('subtext')[0]
        .getElementsByClassName('hnuser')[0]
        .textContent;
    Array.from(document.getElementsByClassName('hnuser'))
        .filter(e => e.textContent === op_name)
        .map(element => {
            const html_element = <HTMLElement>element;
            html_element.style.color = '#42c135';
            html_element.style.fontWeight = 'bold';
        });
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