import { writable } from 'svelte/store';

export class PageDesc {

    constructor ( red = 0, green = 0, blue = 0, newtext = "Test text" ) {
        this.r = red;
        this.g = green;
        this.b = blue;
        this.t = newtext;
    }
}

export class userAccount {
    constructor ( logon = false, name = 'Guest', profLink = "/#/login" ){
        this.logon = logon;
        this.name = name;
        this.profLink = "/#/login";
        this.userID;
    }
}

export const userAcc = writable( new userAccount() );

export const ActualPageDescription = writable( new PageDesc() );

export const basketMap = writable( new Map() );

export const basketSizeHolder = writable( 0 );

export const productTotalSummValue = writable( 0 );