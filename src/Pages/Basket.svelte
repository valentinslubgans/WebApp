<script>
    import {basketMap} from './Stores';
    import {basketSizeHolder} from './Stores';
    import {productTotalSummValue} from './Stores';
    import {userAcc} from "./Stores";
    import {simpleMessage} from "../Forms/messages";
    import { beforeUpdate, afterUpdate, onMount } from 'svelte';
    import BasketList from './BasketList.svelte';
    import {errMessage, successMessage} from "../Forms/messages";


    onMount( ()=> {
        simpleMessage( "It`s your basket" );

        if ( !$userAcc.logon ) {
            window.location.href = './#/login';
            return;
        }

        if ( !$basketMap.size ) return;

        $basketMap.forEach( ( value, key ) => {
            const prLi = new BasketList({
            target: document.getElementById("productList"),
            props: {
                productObject: key,
                productValue: value
            }
        });
        } );
    } );


    function productBasketClear() {
        let productListNode = document.getElementById( "productList" );
        while( productListNode.childNodes.length ) {
            productListNode.firstChild.remove();
        }
        $basketMap.clear();
        $basketSizeHolder = 0;
        $productTotalSummValue = 0;
    }


    function sendBasketListToTheServerFunction() {

        if ( $basketMap.size == 0 ){
            errMessage( "Nothing in basket" );
            return;
        }

        let productOrder = Object.fromEntries( $basketMap.entries() );

        fetch( "http://localhost:5000/productListToBuy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( productOrder )
    })
    .then( response => response.json() )
    .then( data => {
        if ( data.error ) errMessage( data.text );
        else successMessage( data.text );
        productBasketClear();
    })

    }

</script>


<body>
    <div id='basketMainDiv'>
        <div id='productBasketDiv'>
            <ul id='productList'>
            </ul>
        </div>
        <div id="productTotalSummHolder">
            <h2> Total summ: {$productTotalSummValue} $</h2>
        </div>
        <div id="productBasketButtonHolder">
            <button on:click={sendBasketListToTheServerFunction}> <h2>Make order</h2> </button>
        </div>
    </div>
</body>




<style>

#basketMainDiv {
    margin: 0;
    padding: 0;
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
}

#productBasketButtonHolder {
    margin: 0;
    padding: 0;
    width: 80%;
    max-width: 1000px;
    min-width: 500px;
    display: flex;
    justify-content: flex-end;
}


#productTotalSummHolder {
    margin: 0;
    padding: 0;
    width: 80%;
    max-width: 1000px;
    min-width: 500px;
    display: flex;
    justify-content: flex-end;
}

button:hover {
    background: rgba(0, 143, 143)
}

button:active {
    background: rgb(0, 97, 97);
}

button {
    margin: 0;
    padding: 0;
    width: 50%;
    height: 50px;
    background: teal;
    color: white;
    cursor: pointer;
    border-style: none;

}

#productBasketButtonHolder h2 {
    margin: 0;
    padding: 0;
}

#productBasketDiv {
    margin: 0;
    margin-top: 100px;
    padding: 0;
    width: 80%;
    max-width: 1000px;
    min-width: 500px;
    height: auto;
    min-height: 500px;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
}


#productList {
    margin: 0;
    padding: 0;
    width: 100%;
    list-style: none;
}

</style>