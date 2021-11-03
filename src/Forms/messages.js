import {ActualPageDescription} from '../Pages/Stores';

let clearMesageTimer;

function errMessage( message ) {
    ActualPageDescription.update( obj => {
        obj.r = 128;
        obj.g = 0;
        obj.b = 0;
        obj.t = message;
        return obj;
    } );
    clearMesageTimer = setTimeout( simpleMessage, 3000, "" );
}
    
function successMessage( message ) {
    ActualPageDescription.update( obj => {
        obj.r = 0;
        obj.g = 143;
        obj.b = 143;
        obj.t = message;
        return obj;
    } );
    clearMesageTimer = setTimeout( simpleMessage, 3000, "" );
}

function simpleMessage( message ) {
    ActualPageDescription.update( obj => {
        obj.r = 0;
        obj.g = 0;
        obj.b = 0;
        obj.t = message;
        return obj;
    } );
    clearTimeout( clearMesageTimer );
}

export { errMessage, successMessage, simpleMessage };
