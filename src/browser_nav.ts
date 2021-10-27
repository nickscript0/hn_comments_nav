import { getAllComments, getIndent } from './hn_dom';

// No longer need this, can remove
// declare function toggle(event: any, id: string);

export interface Nav {
    next();
    previous();
    nextRoot();
    previousRoot();
    nextSameLevel();
    previousSameLevel();
    nextParent();
    previousParent();
    showParent();
    hideParent();
    toggleCollapseThread();
    readonly currentElement: HTMLElement | null;
}

interface ConditionFunc {
    (i: number): boolean;
}

interface FinderFunc {
    (
        current_position: number,
        incrementor: number,
        boundary_func: ConditionFunc,
        all_comments: HTMLCollectionOf<Element>
    ): number;
}

/**
 * Nav
 */
export class BrowserNav implements Nav {
    private all_comments: HTMLCollectionOf<Element>;
    private position: number | null;
    private highlightedParent: Element | null;

    constructor() {
        this.all_comments = getAllComments();
        console.log('all_comments size ' + this.all_comments.length);

        this.position = null;
        this.highlightedParent = null;
    }

    public next() {
        this.position = _nextPosition(this.position, 1, p => p < this.all_comments.length, this.all_comments);
    }

    public previous() {
        this.position = _nextPosition(this.position, -1, p => p >= 0, this.all_comments);
    }

    public nextRoot() {
        this._advance(1, i => i < this.all_comments.length, _findNextRoot);
    }

    public previousRoot() {
        this._advance(-1, i => i >= 0, _findNextRoot);
    }

    public nextSameLevel() {
        this._advance(1, i => i < this.all_comments.length, _findNextAtLevel);
    }

    public previousSameLevel() {
        this._advance(-1, i => i >= 0, _findNextAtLevel);
    }

    public nextParent() {
        this._advance(1, i => i < this.all_comments.length, _findClosestParent);
    }

    public previousParent() {
        // Note _findImmediateParent could be replaced with _findClosestParent here as they are equivalent
        // (as all nodes should have an immediate parent)
        this._advance(-1, i => i >= 0, _findImmediateParent);
    }

    public showParent() {
        // Only show parent if a current element is selected, and not already showing one, and not a root level element
        if (this.position && this.currentElement && !this.highlightedParent && _nestLevel(this.currentElement) !== 0) {
            const immediateParentI =
                this.position + _findImmediateParent(this.position, -1, i => i >= 0, this.all_comments);
            this.highlightedParent = _highlightAndOverlayParent(
                this.all_comments[immediateParentI],
                this.currentElement
            );
        }
    }

    public hideParent() {
        if (this.highlightedParent) {
            this.highlightedParent.remove();
            this.highlightedParent = null;
        }
    }

    public toggleCollapseThread() {
        if (this.currentElement?.id) {
            const toggleElements = this.currentElement.getElementsByClassName('togg');
            if (toggleElements.length === 0) return;
            (toggleElements[0] as HTMLElement).click();
        }
    }

    public get navPosition() {
        return this.position;
    }

    public get currentElement(): HTMLElement | null {
        return this.position !== null ? <HTMLElement>this.all_comments[this.position] : null;
    }

    private _advance(increment: number, boundary_func: ConditionFunc, finder_func: FinderFunc) {
        const incrementor =
            this.position !== null ? finder_func(this.position, increment, boundary_func, this.all_comments) : 0;
        this.position = _nextPosition(this.position, incrementor, boundary_func, this.all_comments);
    }
}

function _nextPosition(
    current_position: number | null,
    incrementor: number,
    boundary_func: ConditionFunc,
    all_comments: HTMLCollectionOf<Element>
): number {
    let new_position: number;
    // Case 1: no comment is highlighted, go to nearest
    if (current_position === null) {
        new_position = _findNearestTopCommentIndex(all_comments);
        _highlight(all_comments[new_position]);
    }
    // Case 2: will not go outside bounds, change to new position
    else if (boundary_func(current_position + incrementor)) {
        new_position = current_position + incrementor;
        _unHighlight(all_comments[current_position]);
        _highlight(all_comments[new_position]);
    }
    // Case 3: will go outside bounds, remain in current
    else {
        new_position = current_position;
    }
    console.log(`changePosition from ${current_position} to ${new_position}`);
    return new_position;
}

function _findNextRoot(
    current_position: number,
    incrementor: number,
    boundary_func: ConditionFunc,
    all_comments: HTMLCollectionOf<Element>
): number {
    const is_child = i => getIndent(all_comments[i]) > 0;
    return _findNextComment(current_position, incrementor, boundary_func, is_child, all_comments);
}

function _findImmediateParent(
    current_position: number,
    incrementor: number,
    boundary_func: ConditionFunc,
    all_comments: HTMLCollectionOf<Element>
): number {
    const currentNestLevel = _nestLevel(all_comments[current_position]);
    const isImmediateParent = i => _nestLevel(all_comments[i]) !== currentNestLevel - 1;

    return _findNextComment(current_position, incrementor, boundary_func, isImmediateParent, all_comments);
}

// Similar to 'findImmediateParent' but continues searching past one level up all the way until the root
function _findClosestParent(
    current_position: number,
    incrementor: number,
    boundary_func: ConditionFunc,
    all_comments: HTMLCollectionOf<Element>
): number {
    const currentNestLevel = _nestLevel(all_comments[current_position]);
    const equalOrHigherNestLevel = i => currentNestLevel <= _nestLevel(all_comments[i]);

    return _findNextComment(current_position, incrementor, boundary_func, equalOrHigherNestLevel, all_comments);
}

function _findNextAtLevel(
    current_position: number,
    incrementor: number,
    boundary_func: ConditionFunc,
    all_comments: HTMLCollectionOf<Element>
): number {
    const nest_level = _nestLevel(all_comments[current_position]);
    const not_at_level = i => nest_level !== _nestLevel(all_comments[i]);

    // Check it belongs to same parents
    function sameParentOrDescendant(i) {
        // Return false immediately if we're out of bounds
        if (!boundary_func(i)) return false;
        function getParentId(i) {
            if (i < 0) return false;
            const currentIndent = getIndent(all_comments[i]);
            if (currentIndent === null) return null;
            let idx = i;
            while (idx > 0 && getIndent(all_comments[idx]) >= currentIndent) {
                idx--;
            }
            return all_comments[idx].id;
        }
        const sameParent = getParentId(current_position) == getParentId(i);
        const isDescendant = getIndent(all_comments[i]) > getIndent(all_comments[current_position]);
        return sameParent || isDescendant;
    }
    return _findNextComment(current_position, incrementor, sameParentOrDescendant, not_at_level, all_comments);
}

function _findNextComment(
    current_position: number,
    incrementor: number,
    boundary_func: ConditionFunc,
    condition_func: ConditionFunc,
    _all_comments: HTMLCollectionOf<Element>
): number {
    let i: number = current_position + incrementor;

    while (boundary_func(i) && condition_func(i)) {
        i += incrementor;
    }
    return boundary_func(i) ? i - current_position : 0;
}

function _highlight(element: Element) {
    const current = <HTMLElement>element;
    current.style.background = 'aliceblue';
    current.scrollIntoView(true);
}

function _unHighlight(element: Element) {
    const last = <HTMLElement>element;
    last.style.background = '';
}

function _findNearestTopCommentIndex(all_comments: HTMLCollectionOf<Element>): number {
    // find element index of first non-negative distance from top of viewport (elements above viewport are negative)
    let starting_index = 0;
    for (; starting_index < all_comments.length; starting_index++) {
        if (all_comments[starting_index].getBoundingClientRect().top >= 0) break;
    }
    return starting_index;
}

function _nestLevel(commentRow: Element): number {
    // return commentRow.getElementsByTagName('table')[0].classList.length;
    return getIndent(commentRow);
}

function _highlightAndOverlayParent(originalParent: Element, currentElement: HTMLElement): HTMLElement {
    const overlayNode = <HTMLElement>originalParent.cloneNode(true);
    overlayNode.style.backgroundColor = 'MistyRose';
    overlayNode.style.top = currentElement.getBoundingClientRect().bottom.toString();
    overlayNode.style.left = currentElement.getBoundingClientRect().left.toString();
    currentElement.parentElement && currentElement.parentElement.insertBefore(overlayNode, currentElement.nextSibling);
    return overlayNode;
}

// function _arraysEqual<T>(arrA: Array<T> | null, arrB: Array<T> | null): boolean {
//     if (arrA === null || arrB === null) {
//         return arrA === arrB;
//     }
//     const a = new Set(arrA);
//     const b = new Set(arrB);
//     const difference = new Set(Array.from(a).filter(x => !b.has(x)));
//     return difference.size === 0;
// }
