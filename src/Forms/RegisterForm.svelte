<script>
import { onMount } from 'svelte';
import {errMessage, successMessage} from "./messages";

let mistakesDescription = "";

    function Registration() {
        let loginName = document.getElementById( 'loginReg' );
        let regPassword = document.getElementById( 'passwordReg' );
        let confPassword = document.getElementById( 'passwordConf' );
        let regEmail = document.getElementById( 'emailReg' );

        mistakesDescription = "";

        if ( loginName.value.length < 4 ) {
            mistakesDescription += 'Login name must have at leas 4 simbols <br>';
        }
        if ( regPassword.value.length < 5 ) {
            mistakesDescription += 'Passwords must have at leas 5 simbols <br>';
        }
        if ( regPassword.value !== confPassword.value ) {
            mistakesDescription += 'Passwords not equals <br>';
        }
        if ( !regEmail.value.includes( '@' ) ){
            mistakesDescription += 'Please enter correct email <br>';
        } else if ( regEmail.value.length < 5  ) {
            mistakesDescription += 'Please enter correct email <br>';
        } else if ( !regEmail.value.includes( '.' ) ) {
            mistakesDescription += 'Please enter correct email <br>';
        }
        
        if ( mistakesDescription.length === 0 ){

            fetch("http://localhost:5000/reg", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( { 
                    name : loginName.value,
                    pass: regPassword.value,
                    email: regEmail.value

                } )
            })
            .then( response =>  response.json() )
            .then( ( data ) => {
                if ( data.registration ){
                    successMessage( data.text );
                    setTimeout(() => {
                        window.location.href = './#/login';
                    }, 1000);
                } else {
                    errMessage( data.text.replaceAll( '\n', '<br>' ) );
                }
            } )
            
        } else {
            errMessage( mistakesDescription );
        }
    }

    onMount( () => {
        document.getElementById( 'loginReg' ).focus();
    } );

    const jumpToPassword = e => {
        if (e.charCode === 13) document.getElementById('passwordReg').focus();
    };

    const jumpToPasswordConfirm = e => {
        if (e.charCode === 13) document.getElementById('passwordConf').focus();
    };

    const jumpToEmailInput = e => {
        if (e.charCode === 13) document.getElementById('emailReg').focus();
    };

    const onKeyPress = e => {
        if (e.charCode === 13) Registration();
    };

</script>






<body>
    <div>
        <ul>
            <li><h2>Login name</h2></li>
            <li><input type="text" placeholder="Enter your login name" id='loginReg' on:keypress={jumpToPassword}></li>
            <li><h2>Password</h2></li>
            <li><input type="password" placeholder="Enter your password" id='passwordReg' on:keypress={jumpToPasswordConfirm}></li>
            <li><h2>Confirm password</h2></li>
            <li><input type="password" placeholder="Confirm your password" id='passwordConf' on:keypress={jumpToEmailInput}></li>
            <li><h2>Email</h2></li>
            <li><input type="email" placeholder="Enter your email" id='emailReg' on:keypress={onKeyPress}></li>
            <li><button on:click={Registration}><h3>Registrate</h3></button></li>
        </ul>
    </div>
</body>



<style>

    body {
        height: auto;
        display: flex;
    }

    div {
        margin: auto;
        margin-top: 50px;
        background-color: white;
        width: 40%;
        max-width: 600px;
        height: 600px;
        display: flex;
        border-style: solid;
        border-width: 1px;
        border-color: lightgray;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: auto;
        margin-top: 30px;
    }

    li {
        margin: 0;
        padding: 0;
    }

    input {
        outline-style: none;
        border-style: none;
        border-bottom-style: solid;
        border-bottom-width: 1px;

    }

    input:focus {
        background-color: whitesmoke;
    }

    h2 {
        margin: 0;
        margin-top: 20px;
        margin-bottom: 15px;
        padding: 0;
    }

    h3 {
        margin: 0;
        padding: 0;
    }

    button {
        margin: 0;
        margin-top: 40px;
        padding: 0;
        width: 92%;
        height: 40px;
        color: white;
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

</style>