import { Nav } from 'browser_nav';

export class Friends {
    private storage: FriendStorage;
    private browserNav: Nav;

    constructor(browserNav: Nav) {
        this.storage = new FriendStorage();
        this.browserNav = browserNav;
    }

    highlightFriends() {
        const existingFriends = this.storage.all();
        Array.from(document.getElementsByClassName('hnuser'))
            .filter(e => Object.keys(existingFriends).includes(e.textContent || ''))
            .forEach(element => {
                const name = element.textContent;
                if (name) {
                    const html_element = <HTMLElement>element;
                    html_element.style.color = '#f44336';
                    html_element.style.fontWeight = 'bold';
                    html_element.className = 'hnuser friend';
                    html_element.textContent = name + ` [${existingFriends[name]}]`;
                }
            });
    }

    addCurrentElement() {
        if (this.browserNav.currentElement) {
            const hnuser = this.browserNav.currentElement.getElementsByClassName('hnuser');
            const author = hnuser[0].textContent;

            const comment = window.prompt(`Enter a description for ${author}`);
            this.storage.add(author, comment);
        }
    }

}

class FriendStorage {
    storage: Storage;
    friendsObj: FriendsObj;

    constructor() {
        this.storage = window.localStorage;
        this.friendsObj = JSON.parse(this.storage.getItem('hn_friends') || '{}');
    }

    all() {
        return this.friendsObj;
    }

    add(name, comment) {
        this.friendsObj[name] = comment;
        this.write();
    }

    private write() {
        this.storage.setItem('hn_friends', JSON.stringify(this.friendsObj));
    }
}

interface FriendsObj {
    [name: string]: string;
}