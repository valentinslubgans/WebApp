<script>
    import { beforeUpdate, afterUpdate, onMount } from "svelte";
    import {errMessage, successMessage} from "../../Forms/messages";
    import UploadIcon from "../../Icons/UploadIcon.svelte";
    import {sendproductToServer} from "./AddFileFunction";

    let productImmages;

    onMount(() => {
        productImmages = document.getElementById("productPictureUpload");
        productImmages.addEventListener("change", uploadProductImmages, false);
    });

    function uploadProductImmages() {
        if (!productImmages.files.length) {
            console.log("There is no immages to upload.");
            document.getElementById("uploadSpanHolder").classList.remove("hidden");
            document.getElementById("uploadIMGHolder").classList.add("hidden");
            return;
        }
        
        document.getElementById("uploadSpanHolder").classList.add("hidden");
        document.getElementById("uploadIMGHolder").classList.remove("hidden");

        let fileURL = URL.createObjectURL(productImmages.files[0]);
        let imgWindow = document.getElementById("productDescriptionImage");
        imgWindow.src = fileURL;
    }


    function fieldCompleateCheck() {

        let errMessageText = "";

        if ( !productImmages.files.length ) errMessageText += 'Please add image of your product <br>';
        if ( !document.getElementById("productName").value ) errMessageText += 'Please add name of your product <br>';
        if ( !document.getElementById("productPrice").value ) errMessageText += 'Please add price for your product <br>';
        if ( !document.getElementById("productQuantity").value ) errMessageText += 'Please add product quantity <br>';
        if ( !document.getElementById("productDescription").value ) errMessageText += 'Please add description of your product <br>';

        if ( errMessageText.length ) {
            errMessage( errMessageText );
            return;
        } else sendproductToServer( productImmages.files[0] );

    }

</script>




<body>

    <div id="mainProductFormDiv">

        <div id="imageField">
            <input type="file" id="productPictureUpload" name="Product Picture" accept="image/jpg, image/jpeg, image/png" class="hidden" />
        
            <label id="imgUploadLabel" for="productPictureUpload">
                <div id="uploadSpanHolder">
                    <UploadIcon />
                    <h4>Press here to upload image</h4>
                </div>
        
                <div id="uploadIMGHolder" class="hidden">
                    <img id="productDescriptionImage" src="" alt="" />
                </div>
            </label>

        </div>


        <div id="inputsFormHolder">
            <ul>
                <li> <h3> Product name: </h3> </li>
                <li> <input type="text" id="productName" placeholder="Input product name"> </li>
                <li> <h3> Price: </h3> </li>
                <li> <input type="number" min="0.01" step="0.1" id="productPrice" > <h6> $ </h6> </li>
                <li> <h3> Quantity: </h3> </li>
                <li> <input type="number" min="1" step="1" id="productQuantity" > </li>
            </ul>
        </div>

    </div>

    
    <div id="productDescriptionAreaDiv">
        <span> <h3> Product description: </h3> </span>
        <textarea name="Product description" placeholder="Describe the product" id="productDescription"></textarea>
    </div>

    <div id="productAddingButtonDiv">
        <button on:click={fieldCompleateCheck}> <h5> Add product </h5> </button>
    </div>

</body>




<style>
    body {
        margin: 0;
        padding: 0;
        height: auto;
    }

    span {
        margin: 0;
        padding: 0;
        display: block;
        text-align: center;
    }

    #productAddingButtonDiv {
        margin: 0;
        margin-left: auto;
        margin-right: auto;
        padding: 0;
        display: flex;
        width: 60%;
        min-width: 550px;
        max-width: 800px;
        height: auto;
        flex-direction: column;
        align-items: flex-end;
    }

    button {
        margin: 0;
        margin-top: 30px;
        padding: 0;
        width: 40%;
        height: 50px;
        color: white;
        float: right;
        border: 0;
        background-color: TEAL;
        cursor: pointer;
        position: relative;
        -webkit-transition: all 0.3s;
        -moz-transition: all 0.3s;
        transition: all 0.3s;
    }

    button:after {
        position: absolute;
        z-index: -1;
        -webkit-transition: all 0.3s;
        -moz-transition: all 0.3s;
        transition: all 0.3s;
    }

    button:before{
        position: relative;
        -webkit-font-smoothing: antialiased;
    }

    button:hover {
        background: rgb(0, 97, 97);
    }

    button:active {
        background: rgba(0, 143, 143);
        top: 2px;
    }

    h5 {
        margin: 5px;
        padding: 0;
        font-size: 20px;
    }

    #productDescriptionAreaDiv {
        margin: 0;
        margin-top: 20px;
        margin-left: auto;
        margin-right: auto;
        padding: 0;
        display: flex;
        width: 60%;
        min-width: 550px;
        max-width: 800px;
        height: auto;
        align-items: flex-start;
        flex-direction: column;
    }

    textarea {
        margin: 0;
        margin-top: 5px;
        padding: 5px;
        width: 100%;
        height: 100px;
    }

    #mainProductFormDiv {
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        width: auto;
        height: auto;
    }

    #inputsFormHolder {
        margin: 0;
        padding: 0;
        margin-top: 50px;
        margin-left: 2%;
        width: 250px;
    }

    ul {
        margin: 0;
        padding: 0;
        width: 100%;
        list-style: none;
    }

    li {
        margin: 0;
        padding: 0;
        width: auto;
    }

    input {
        margin: 0;
        height: 40px;
        width: 50%;
    }

    #productName {
        width: 100%;
    }

    li input {
        outline-style: none;
        border-style: none;
        border-bottom-style: solid;
        border-bottom-width: 1px;

    }

    li input:focus {
        background-color: darkgray;
    }

    h6 {
        margin: 0;
        padding: 0;
        width: 1%;
        font-size: 20px;
        display: inline;
    }

    label {
        margin: 0;
        padding: 0;
        cursor: pointer;
        width: 100%;
        height: 100%;
        background-color: white;
        border-width: 2px;
        border-style: solid;
        border-color: darkgray;
    }

    #uploadSpanHolder {
        margin: 0;
        margin-left: auto;
        margin-right: auto;
        padding: 0;
        width: 100%;
        height: auto;
        text-align: center;
    }

    h4 {
        margin: 0;
        padding: 0;
        margin-left: 10%;
        margin-right: 10%;
        margin-top: 60px;
        width: auto;
        color: darkgray;
    }

    h3 {
        margin: 0;
        padding: 0;
        margin-top: 20px;
        margin-bottom: 5px;
    }

    #imageField {
        margin: 0;
        padding: 0;
        margin-top: 50px;
        width: 300px;
        height: 300px;
    }

    #uploadIMGHolder {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        position: relative;
    }

    #productDescriptionImage {
        max-height: 100%;
        max-width: 100%;
        width: auto;
        height: auto;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
    }

    .hidden {
        display: none;
    }

</style>
