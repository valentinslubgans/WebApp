<script>
import {onMount} from 'svelte';
import {errMessage, successMessage} from "./messages";
import {userAcc} from "../Pages/Stores";

    onMount( () => {
        document.getElementById( 'loginCheck' ).focus();
    } );

    function loginRequest() {

        fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( { 
                name : document.getElementById( 'loginCheck' ).value,
                pass: document.getElementById( 'passwordCheck' ).value

            } )
        })
        .then( response =>  response.json() )
        .then( ( data ) => {
            if ( data.login ){
                successMessage( data.text );
                $userAcc.logon = true;
                $userAcc.name = data.userName;
                $userAcc.userID = data.userID;
                $userAcc.profLink = './#/profile';
                window.location.href = './#/profile';

            } else {
                errMessage( data.text );
            }
        } )
    }

    const onKeyPress = e => {
        if (e.charCode === 13) loginRequest();
    };

    const jupmToPassword = e => {
        if (e.charCode === 13) document.getElementById('passwordCheck').focus();
    };

</script>

<body>
    <div>

        <span>
            <h1>Hello</h1>
            <a href="#/register" class="reglink"> If you are NEW, PRESS HERE to register. </a> 
        </span>

        <ul>
            <li><h2>Login</h2></li>
            <li><input type="text" placeholder="Enter your login name" id='loginCheck' on:keypress={jupmToPassword}></li>
            <li><h2>Password</h2></li>
            <li><input type="password" placeholder="Enter your password" id='passwordCheck' on:keypress={onKeyPress}></li>
            <li><button on:click= {loginRequest} ><h3>Login</h3></button></li>
        </ul>


    </div>
</body>


<style>

    input {
        outline-style: none;
        border-style: none;
        border-bottom-style: solid;
        border-bottom-width: 1px;

    }

    input:focus {
        background-color: whitesmoke;
    }

    button {
        margin-top: 25%;
        width: 100%;
        height: 8%;
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

    h3 {
        margin: 0;
    }

    ul {
        margin: auto;
        margin-top: 50px;
        padding: 0;
        list-style: none;
    }

    span {
        text-align: center;
        align-items: center;
        display: grid;
        width: 35%;
        height: 100%;
        background: TEAL;
    }

    h1 {
        margin: auto;
        margin-top: 60px;
        color: white;
        font-size: 200%;

    }

    a {
        margin: 0;
        margin-left: 5%;
        margin-right: 5%;
        font-size: 100%;
        color: white;
    }

    a.reglink {
        font-size: 20px;
        max-width: 80%;
        margin-left: 10%;
    }

    body {
        height: 750px;
        display: flex;
    }

    div {
        display: flex;
        margin: auto;
        width: 60%;
        max-width: 800px;
        height: 70%;
        max-height: 500px;
        background-color: white;
        border-style: solid;
        border-width: 1px;
        border-color: lightgray;
    }

</style>