<script>
import { onMount } from "svelte";
import {errMessage, successMessage} from "../../Forms/messages";
import {userAcc} from "../Stores";
import {NewsDisplay} from "./NewsDisplay";

    onMount( () => {
        document.getElementById( 'newsHeader' ).focus();
    } );


    function fieldsCheck() {
        if ( document.getElementById( 'newsHeader' ).value.length < 3 || document.getElementById( 'newstext' ).value.length < 20 ){
            errMessage( "Please fell out the fields" );
            return;
        } else newsPosting();
    }


    function newsPosting() {

    const postingDate = new Intl.DateTimeFormat( "en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
    });


        fetch("http://localhost:5000/newsPosting", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( { 
                authorID: $userAcc.userID,
                authorName: $userAcc.name,
                newsPostingDate: "posting date: " + postingDate.format(new Date),
                newsHeader: document.getElementById( 'newsHeader' ).value,
                newsText: document.getElementById( 'newstext' ).value
            } )
        })
        .then( response =>  response.json() )
        .then( ( data ) => {
            if ( data.newsposting ){
                document.getElementById( 'newsHeader' ).value = "";
                document.getElementById( 'newstext' ).value = "";
                successMessage( data.text );
                NewsDisplay( data.news );
            } else {
                errMessage( data.text );
            }
        } )
    }

    let scaleValue = 0;

    function addNewsDivOpen() {

        let addNewsDiv = document.getElementById( "addNewsDivHolder" );

        if( scaleValue ) {
            scaleValue = 0;
            addNewsDiv.style.height = "0";
            addNewsDiv.style.transform = `scale(${scaleValue})`;
            return;
        }

        scaleValue = 1;
        addNewsDiv.style.height = "420px";
        addNewsDiv.style.transform = `scale(${scaleValue})`;
    }

</script>


<body>
    <div>
        <span on:click={addNewsDivOpen}> 
            <h1>Add news</h1>
        </span>
        
        <div id="addNewsDivHolder">
            <input type="text" placeholder="ENTER NEWS HEADER" id='newsHeader'>
        
            <textarea name="news" placeholder="Enter your text here" id="newstext"></textarea>
    
            <button on:click={fieldsCheck}> <h2>Place news</h2> </button>
        </div>

    </div>

    <hr>
</body>


<style>

    body {
        height: auto;
    }
    
    div {
        margin: 0;
        margin-left: auto;
        margin-right: auto;
        padding: 0;
        width: 70%;
        max-width: 1000px;
        height: auto;
    }

    #addNewsDivHolder {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 0;
        transform: scale(0);
        transform-origin: top;
        transition: 200ms ease-in-out;
    }
    
    span {
        margin: 0;
        margin-top: 20px;
        margin-bottom: 20px;
        padding: 0;
        padding-bottom: 5px;
        width: 100%;
        height: auto;
        display: grid;
        background: teal;
        color: white;
        cursor: pointer;
    }

    span:hover {
        background: rgba(0, 143, 143);
    }

    span:active {
        background: rgb(0, 97, 97);
    }

    input {
        width: 50%;
        margin-top: 5px;
        outline-style: none;
        border-style: none;
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-color: black;
        font-weight: bold;
    }

    input:focus {
        background-color: lightgray;
    }
    
    textarea {
        width: 100%;
        height: 50%;
        margin: 0;
        padding: 5px;
        margin-top: 20px;
        outline: none;
        resize: none;
    }

    button {
        margin: 0;
        margin-top: 10px;
        float: right;
        width: 25%;
        height: 40px;
        color: white;
        background: TEAL;
        cursor: pointer;
        position: relative;
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

    h1 {
        margin: 0;
        margin-left: 10px;
        padding: 0;
        font-size: 30px;
    }

    h2 {
        margin: 0;
        padding: 0;
        font-size: 20px;
    }

    hr {
        bottom: 0;
        border: 0;
        height: 1px;
        width: 90%;
        background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
    }

</style>