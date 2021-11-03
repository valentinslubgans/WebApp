import {errMessage, successMessage} from "./messages";

export async function funcPassChange( userAcc, checkThePassword ) {
    
        let newPassword = document.getElementById( 'passChange' );
        let confirmNewPassword = document.getElementById( 'passChangeConfirm' );
    
    
        await fetch("http://localhost:5000/passChange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( { 
                userID : userAcc.userID,
                pass: checkThePassword,
                newPass: newPassword.value
            } )
        })
        .then( response =>  response.json() )
        .then( ( data ) => {
            if ( data.passChange ){
                successMessage( data.text );
            } else {
                errMessage( data.text );
            }
        } ).catch( (err) => {
            errMessage( "Some error!" );
        } )
    
        newPassword.value = "";
        confirmNewPassword.value = "";
    }
