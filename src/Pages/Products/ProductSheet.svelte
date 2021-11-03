<script>
import { userAcc } from "../Stores";
import BackArrow from "../../Icons/BackArrow.svelte";
import TrashBinIcon from "../../Icons/TrashBinIcon.svelte";
import BasketIcon from "../../Icons/BasketIcon.svelte";
import { errMessage, successMessage } from "../../Forms/messages";
import {basketMap} from '../Stores';
import {basketSizeHolder} from '../Stores';

    export let productObject;
    export let productPicture;
    export let parentElement;

    function productOverlayBackButtonFunction() {
        document.getElementById( "productOverlay" ).parentNode.remove();
    }

    function productDeleteButtonFunction() {

        fetch("http://localhost:5000/deleteProduct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( productObject )
        })
        .then( response => response.json() )
        .then( data => {
            if ( data.fileRemoved ){
                successMessage( data.text );
                parentElement.remove();
                productOverlayBackButtonFunction();
            } else {
                errMessage( data.text );
            }
        } );
    }


    function addToBasketFunction() {
        if ( !$userAcc.logon ) {
            errMessage( "You need to login at first" );
            productOverlayBackButtonFunction();
            return;
        } 

        let productCountVariable = +document.getElementById( "productOrderQuantuty" ).value;

        if ( $basketMap.has( productObject._id ) ) productCountVariable += +$basketMap.get( productObject._id )[1];

        if ( productCountVariable > productObject.productQuantity ) productCountVariable = productObject.productQuantity;
        
        $basketMap.set( productObject._id, [ productObject, productCountVariable ] );


        $basketSizeHolder = $basketMap.size;
        productOverlayBackButtonFunction();
    }

</script>



<body>
    <div id="productOverlay">

        <button id="productOverlayBackButton" class="exit" on:click={productOverlayBackButtonFunction}> <BackArrow/> <h3>back</h3> </button>
        
        <div id="productSheetHolder">
            
            <div id="productSheetNameHolder">
                <h1>{productObject.productName}</h1>
            </div>

            <div id="pictureAndSpec">
                <img src={productPicture} alt="">
                <ul>
                    <li> <h4>Price:</h4>  <h2 style="color:MAROON"> {productObject.productPrice}$ </h2></li>
                    <li> <h4>Quantity in a stock: </h4> <h2>{productObject.productQuantity}</h2> </li>
                    <li> <h4>Order:</h4> <input type="number" id="productOrderQuantuty" value=1 min=1 max={productObject.productQuantity}> </li>
                    <li> <h4>Seller: </h4> <h2> {productObject.sellerName} </h2> </li>
                </ul>
            </div>

            <span>
                <h4> {productObject.productDescription} </h4>
            </span>

            <div id="productSheetButtonHolder">

                <button id="addToBaskerButton" on:click={addToBasketFunction}> <BasketIcon w="40px" h="40px" ml="20px"/> <h3> Add to basket </h3>  </button>
                
                {#if $userAcc.userID == productObject.sellerID}
                    <button id="productDeleteButton" class="exit" on:click={productDeleteButtonFunction}> <TrashBinIcon c="white"/> <h3> DELETE </h3> </button>
                {/if}
            </div>

        </div>
    </div>
</body>



<style>

#productOverlay {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: fixed;
    background-color: white;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
}

#addToBaskerButton {
    margin: 0;
    padding: 0;
    width: 60%;
    height: 70px;
    background: teal;
    color: white;
    display: flex;
    align-items: center;
    cursor: pointer;
}

#addToBaskerButton:hover {
    background: rgba(0, 143, 143);
}

#addToBaskerButton:active {
    background: rgb(0, 97, 97);
}


#addToBaskerButton h3 {
    margin: 0;
    margin-left: 10px;
    padding: 0;
    font-size: 30px;
}

#productSheetButtonHolder {
    margin: 0;
    padding: 0;
    margin-top: 50px;
    width: 100%;
    height: auto;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

#productDeleteButton {
    margin: 0;
    padding: 10px 30px;
    color: white;
    display: flex;
    flex-direction: row;
    align-items: center;
}

#productDeleteButton h3 {
    margin: 0;
    margin-left: 5px;
    padding: 0;
}


#pictureAndSpec {
    margin: 0;
    padding: 0;
    margin-top: 50px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
}

span {
    margin: 0;
    margin-top: 30px;
    padding: 0;
    max-width: 100%;
    height: auto;
}

span h4 {
    margin: 0;
    margin-top: 2px;
    padding: 0;
    max-width: 100%;
}


ul {
    margin: 0;
    margin-left: 30px;
    padding: 0;
    list-style: none;
    height: 100%;
}

li {
    margin: 0;
    margin-top: 20%;
    padding: 0;
    display: flex;
    flex-direction: row;
    align-content: flex-end;
    align-items: flex-end;
    justify-content: flex-start;
}

li h4 {
    margin: 0;
    padding: 0;
}

li h2 {
    margin: 0;
    padding: 0;
    margin-left: 10px;
}

li input {
    margin: 0;
    padding: 0;
    padding-left: 5px;
    margin-left: 10px;
    height: 30px;
}


img {
    margin: 0;
    padding: 0;
    width: 300px;
    height: auto;
    max-height: 300px;
}


#productSheetHolder {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-content: flex-start;
}


#productSheetNameHolder {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
}

#productSheetNameHolder h1 {
    margin: 0;
    margin-left: 30px;
    padding: 0;
    font-size: 40px;
}

#productOverlayBackButton {
    margin: 0;
    padding: 5px 20px;
    top: 50px;
    left: 50px;
    position: absolute;
    width: auto;
    display: flex;
    color: white;
    align-items: center;
    flex-direction: row;
}

#productOverlayBackButton h3 {
    margin: 0;
    margin-left: 20px;
    padding: 0;
    font-size: 40px;
}


button.exit {
    background: rgba(128, 0, 0);
}

button.exit:hover{
    cursor: pointer;
    background: rgba(153, 0, 0);
    box-shadow: rgba(153, 0, 0, 0.5) 0px 30px 60px -12px inset, rgba(255, 255, 255, 0.6) 0px 18px 36px -18px inset, rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
}

button.exit:active {
    background: rgba(97, 0, 0);
}

</style>