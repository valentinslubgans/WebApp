import { userAcc } from "../Stores";
import { get } from 'svelte/store';
import {errMessage, successMessage} from "../../Forms/messages";
import { productListCreating } from "./ProductListCreating";

function sendproductToServer( file ) {

    const seller = get( userAcc );

    const formData = new FormData();

    formData.append( 'imageFile', file );
    formData.append( 'sellersID', seller.userID );
    formData.append( 'sellerName', seller.name );
    formData.append( 'productName', document.getElementById("productName").value );
    formData.append( 'productPrice', parseFloat( document.getElementById("productPrice").value ).toFixed(2) );
    formData.append( 'productQuantity', Math.floor( parseFloat( document.getElementById("productQuantity").value ) ) );
    formData.append( 'productDescription', document.getElementById("productDescription").value );
    
    fetch("http://localhost:5000/productAdd", {
        method: "POST",
        body: formData
            
    })
    .then( response =>  response.json() )
    .then( ( data ) => {
        document.getElementById("productName").value = "";
        document.getElementById("productPrice").value = "";
        document.getElementById("productQuantity").value = "";
        document.getElementById("productDescription").value = "";
        if ( data.productSaved ) {
            successMessage( data.text );
            productListCreating( data.product );
        }
    });

}

export {sendproductToServer};