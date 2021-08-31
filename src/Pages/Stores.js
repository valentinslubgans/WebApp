import { writable } from 'svelte/store';

export class Test {

    constructor ( red = 0, green = 0, blue = 0, newtext = "Test text" ) {
        this.r = red;
        this.g = green;
        this.b = blue;
        this.t = newtext;
    }

}

export const ActualPageDescription = writable( new Test() );