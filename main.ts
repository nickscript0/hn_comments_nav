function main() {
    const nav = new Nav();
    document.onkeypress = handle_key(nav);
}

function handle_key(nav: Nav) {
    return function (e: KeyboardEvent) {
        console.log(`onkeypress: e.code=${e.code}, e.key=${e.key}`);
        if (e.key === 'j') nav.next();
        if (e.key === 'k') nav.previous();
        console.log(`position is ${nav.navPosition}`);
    };
}

/**
 * Nav
 */
class Nav {
    private all_comments: HTMLCollectionOf<Element>;
    private position: number;

    constructor() {
        this.all_comments = document.getElementsByClassName('athing comtr ');
        console.log('all_comments is size ' + this.all_comments.length);

        this.position = 0;
    }

    public next() {
        if (this.position < this.all_comments.length - 1) {
            this.position++;
            this.highlight(this.all_comments[this.position], this.all_comments[this.position - 1]);
        }

    }

    public previous() {
        if (this.position > 0) {
            this.position--;
            this.highlight(this.all_comments[this.position], this.all_comments[this.position + 1]);
        }
    }

    public get navPosition() {
        return this.position;
    }

    private highlight(current_element: Element, last_element: Element) {
        const current = <HTMLElement>current_element;
        const last = <HTMLElement>last_element;
        current.style.background = "aliceblue";
        last.style.background = "";
    }
}

main();