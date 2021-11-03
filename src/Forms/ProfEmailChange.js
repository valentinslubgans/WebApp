import {errMessage, successMessage} from "./messages";

export async function funcEmailChange( userAcc, checkThePassword ) {

    let newEmail = document.getElementById( 'emailChange' );

await fetch("http://localhost:5000/emailChange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( { 
        userID : userAcc.userID,
        pass: checkThePassword,
        newEmail: newEmail.value
    } )
})
.then( response =>  response.json() )
.then( ( data ) => {
    if ( data.emailChange ){
        successMessage( data.text );
    } else {
        errMessage( data.text );
    }
} ).catch( (err) => {
    errMessage( "Some error!" );
} )

    newEmail.value = "";
}