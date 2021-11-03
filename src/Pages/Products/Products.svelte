<script>
    import { beforeUpdate, afterUpdate, onMount } from "svelte";
    import { simpleMessage } from "../../Forms/messages";
    import { userAcc } from "../Stores";
    import AddFileForm from "./AddFileForm.svelte";
    import { productListCreating } from "./ProductListCreating";


    onMount( async () => {
        if ( $userAcc.logon ) simpleMessage( "Now you can add products" );
        else simpleMessage("To add products you need to login");

        await fetch("http://localhost:5000/productGet", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        })
        .then( response => response.json() )
        .then( ( data ) => {
            data.forEach( element => {
                productListCreating( element );
            })
        })

    });

    let addProductFormHolderScale = 0;

    function addFileFormScaleFunction() {
        let addProductFormHolderNode = document.getElementById( "addProductFormHolder" );

        if ( addProductFormHolderScale ) {
            addProductFormHolderScale = 0;
            addProductFormHolderNode.style.height = "0";
            addProductFormHolderNode.style.transform = `scale(${addProductFormHolderScale})`;
            return;
        }

        addProductFormHolderScale = 1;
        addProductFormHolderNode.style.height = "auto";
        addProductFormHolderNode.style.transform = `scale(${addProductFormHolderScale})`;
    }

</script>


<body id="porductBody">

    
    {#if $userAcc.logon}
        <span on:click={addFileFormScaleFunction}>
            <h1>Add product</h1>
        </span>
        <div id="addProductFormHolder">
            <AddFileForm/>
        </div>
        <hr/>
    {/if}

    <div id="productListDiv">
    </div>

</body>




<style>

    #productListDiv {
        margin: 0;
        padding: 0;
        width: auto;
        height: auto;
        display: flex;
        justify-content: center;
        align-content: flex-start;
        flex-wrap: wrap;
        flex-direction: row;
    }


    #addProductFormHolder {
        margin: 0;
        padding: 0;
        height: 0;
        transform: scale(0);
        transform-origin: top;
        transition: 200ms ease-in-out;
    }


    span {
        margin: 0;
        margin-top: 40px;
        margin-left: auto;
        margin-right: auto;
        padding: 0;
        width: 80%;
        background: teal;
        color: white;
        display: flex;
        cursor: pointer;
    }

    span:hover {
        background: rgba(0, 143, 143);
    }

    span:active {
        background: rgb(0, 97, 97);
    }


    span h1 {
        margin: 10px 20px;
        padding: 0;
    }


    hr {
        margin-top: 50px;
        bottom: 0;
        border: 0;
        height: 1px;
        width: 90%;
        background-image: linear-gradient( to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0) );
    }

</style>
