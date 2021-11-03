<script>
import TrashBinIcon from "../Icons/TrashBinIcon.svelte";
import { errMessage, successMessage } from "../Forms/messages";
import {basketMap} from './Stores';
import {basketSizeHolder} from './Stores';
import {productTotalSummValue} from './Stores';

export let productObject;
export let productValue;

let productPriceSummValue = 0;
productPriceSummFunction();
productTotalSumCountFunction();


function productPriceSummFunction() {
    productPriceSummValue = +productValue[0].productPrice * productValue[1];
    productPriceSummValue = productPriceSummValue.toFixed(2);
    productTotalSumCountFunction();
}


function productTotalSumCountFunction() {
        $productTotalSummValue = 0;

        $basketMap.forEach( ( value, key ) => {
            $productTotalSummValue += value[1] * value[0].productPrice;
        });

        $productTotalSummValue = $productTotalSummValue.toFixed(2);
}


function incrementFunction() {
    if ( productValue[0].productQuantity <= productValue[1] ){
        errMessage( 'Product maximal limit!' );
        return;
    }

    productValue[1]++;
    productPriceSummFunction();
}



function positionRemoveFunction() {
    $basketMap.delete( productObject );
    $basketSizeHolder = $basketMap.size;
    this.parentNode.remove();
    productTotalSumCountFunction();
}



function decrementFunction() {
    productValue[1]--;

    if ( productValue[1] < 1 ) {
        productValue[1] = 1;
        $basketSizeHolder = $basketMap.size;
    }

    productPriceSummFunction();
}


</script>



<li>
    <h1> {productValue[0].productName} </h1>
    <h2> {productPriceSummValue} $</h2>
    <button on:click={incrementFunction}> <h2>+</h2> </button>
    <h2> {productValue[1]} </h2>
    <button on:click={decrementFunction}> <h2>-</h2> </button>
    <button on:click={positionRemoveFunction} id="positionRemoveButton"> <TrashBinIcon c="MAROON"/> </button>
    <h2>Price: {+productValue[0].productPrice}$</h2>
</li>


<style>

    #positionRemoveButton {
        margin: 10px 20px;
        background: rgba(0, 0, 0, 0);
        border-style: none;
    }

    button h2 {
        margin: 0 5px;
        margin-bottom: 5px;
        padding: 0;
    }

    h1 {
        margin: 0;
        margin-left: 20px;
        max-width: 50%;
        padding: 0;
        font-size: 30px;
        font-weight: 400;
        display: inline;
    }

    h2 {
        margin: 10px 10px;
        padding: 0;
        font-size: 20px;
        font-weight: 400;
        float: right;
        display: inline;
    }

    li {
        margin: 0;
        margin-top: 10px;
        padding: 0;
        padding-bottom: 5px;
        width: 100%;
        height: 50px;
        display: inline-block;
        border-bottom: 1px solid lightgray;
    }

    button {
        margin: 10px 10px;
        padding: 0;
        width: auto;
        float: right;
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0);
        border-radius: 7px;
    }
</style>