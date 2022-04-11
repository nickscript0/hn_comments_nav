export function getAllComments(): HTMLCollectionOf<Element> {
    return document.getElementsByClassName('athing comtr ');
}

/**
 * Given a `<tr class="athing comtr" ...>` hn comment element, return the indent level
 * "0" for root, "1" for 1st level child, "2" for 2nd, and so on.
 * 
 * As of Oct 26, 2021 an hn comment tr element has a td with attr 'indent', for example:
<tr class="athing comtr" id="29007203"><td><table border="0">  <tbody><tr>    <td class="ind" indent="0"><img src="s.gif" height="1" width="0"></td><td valign="top" class="votelinks">
      <center><a id="up_29007203" href="vote?id=29007203&amp;how=up&amp;goto=item%3Fid%3D29005669"><div class="votearrow" title="upvote"></div></a></center>    </td><td class="default"><div style="margin-top:2px; margin-bottom:-10px;"><span class="comhead">
          <a href="user?id=slownews45" class="hnuser">slownews45</a> <span class="age" title="2021-10-26T22:30:37"><a href="item?id=29007203">13 hours ago</a></span> <span id="unv_29007203"></span><span class="par"></span> <a class="togg" n="1" href="javascript:void(0)" onclick="return toggle(event, 29007203)">[–]</a><span class="onstory"></span>                  </span></div><br><div class="comment">
                  <span class="commtext c00">[redacted]
              </p><div class="reply">        <p><font size="1">
                      <u><a href="reply?id=29007203&amp;goto=item%3Fid%3D29005669%2329007203">reply</a></u>
                  </font>
      </p></div></span></div></td></tr>
        </tbody></table></td></tr>
 */
export function getIndent(comment: Element): number {
    const indent = comment?.getElementsByClassName('ind')[0]?.getAttribute('indent');
    if (indent === undefined || indent === null) {
        throw Error(`getIndent called with invalid argument ${JSON.stringify(comment)}`);
    }
    return parseInt(indent);
}

export function getCommentAuthor(comment: HTMLElement): string | null {
    const hnuser = comment.getElementsByClassName('hnuser');
    if (hnuser.length > 0) {
        const author = hnuser[0].textContent;
        if (author !== null) {
            // Could be cleaner but typescript wasn't allowing the type guard for the more concise version
            return author.trim(); //.toLowerCase();
        }
    }
    return null;
}

export function hightlightUserThroughoutPage({
    userName,
    color,
    fontWeight,
}: {
    userName: string;
    color?: string;
    fontWeight?: string;
}) {
    Array.from(document.getElementsByClassName('hnuser'))
        .filter(e => e.textContent === userName)
        .map(element => {
            const html_element = <HTMLElement>element;
            if (color) html_element.style.color = color;
            if (fontWeight) html_element.style.fontWeight = fontWeight;
        });
}

// TODO: compare perf of
/**
 * ***** PERFORMANCE COMPARISON querySelectorAll vs getElementsByClassName *****
 * 1. 1 loop: single querySelectorAll('hnuser') all comments, then inside loop element.querySelectorAll(addClass) delete if exists, then add
 * 2. 2 loop: querySelectorAll(addClass) delete if exists, then querySelectorAll('hnuser') all comments add tag if username matches
 * 3. 1 loop: single getElementsByClassName('hnuser') all comments, then inside loop element.getElementsByClassName(addClass) delete if exists, then add
 * 4. 2 loop: getElementsbyClassName(addClass) delete if exists, then getElementsbyClassName('hnuser') all comments add tag if username matches
 * As per this good comparison of the two functions https://dev.to/wlytle/performance-tradeoffs-of-queryselector-and-queryselectorall-1074
 *
 * RESULTS: Apr 10, 3:26pm
 * tutpQuerySelectorAll2Loop consistently fastest by ~0.1-0.2 ms. This is explained by 2 slow queries, then fast accesses on each
 *
 * ***** PERFORMANCE COMPARISON map, forEach, for of *****
 * No noticeable difference
 */

export function tagUsersThroughoutPage({
    userNames,
    color,
    fontWeight,
    addTag,
}: {
    userNames: string[];
    color?: string;
    fontWeight?: string;
    addTag: {
        style: Partial<CSSStyleDeclaration>;
        class: string;
    };
}) {
    // Remove pre-existing matching class so we don't duplicate
    if (addTag) document.querySelectorAll(`.${addTag.class}`).forEach(e => e.remove());

    for (const element of Array.from(document.querySelectorAll('.hnuser'))) {
        if (element.textContent && userNames.includes(element.textContent)) {
            _insertTag(userNames, element, color, fontWeight, addTag);
        }
    }
}

function _insertTag(
    userNames: string[],
    element: Element,
    color: string | undefined,
    fontWeight: string | undefined,
    addTag: {
        style: Partial<CSSStyleDeclaration>;
        class: string;
    }
) {
    const html_element = element as HTMLElement;
    const userName = html_element.textContent as string;
    if (color) html_element.style.color = color;
    if (fontWeight) html_element.style.fontWeight = fontWeight;
    if (addTag) {
        const tag = document.createElement('span');
        tag.className = addTag.class;
        tag.textContent = `GP${userNames.indexOf(userName)}`;
        for (const [key, value] of Object.entries(addTag.style)) {
            tag.style[key] = value;
        }
        // html_element.appendChild(tag);
        html_element.insertAdjacentElement('afterend', tag);
    }
}
