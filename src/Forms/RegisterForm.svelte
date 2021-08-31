<script>
import {ActualPageDescription} from '../Pages/Stores.js';

    function Registration() {
        let loginName = document.getElementById( 'loginReg' );
        let regPassword = document.getElementById( 'passwordReg' );
        let confPassword = document.getElementById( 'passwordConf' );
        let regEmail = document.getElementById( 'emailReg' );

        if ( loginName.value.length < 5 ) {
            $ActualPageDescription.t = "One more test";
            console.log( $ActualPageDescription.t );
        }
        else if ( regPassword.value.length < 5 ) {
            regPassword.style.setProperty( 'border', '1px solid red' );
            console.log( 'Passwords must have at leas five simbols' );
        }
        else if ( regPassword.value !== confPassword.value ) {
            regPassword.style.setProperty( 'border', '1px solid red' );
            confPassword.style.setProperty( 'border', '1px solid red' );
            console.log( 'Passwords not equals' );
        }
        else if ( !regEmail.value.includes( '@' ) && regEmail.value.length < 5 ){
            regEmail.style.setProperty( 'border', '1px solid red' );
            console.log( 'Please enter correct email' );
        }
        else {
            console.log( 'Registered' );
        }
    }

    const onKeyPress = e => {
        if (e.charCode === 13) Registration();
    };

</script>






<body>
    <div>
        <ul>
            <li><h2>Login name</h2></li>
            <li><input type="text" placeholder="Enter your login name" id='loginReg' on:keypress={onKeyPress}></li>
            <li><h2>Password</h2></li>
            <li><input type="password" placeholder="Enter your password" id='passwordReg' on:keypress={onKeyPress}></li>
            <li><h2>Confirm password</h2></li>
            <li><input type="password" placeholder="Confirm your password" id='passwordConf' on:keypress={onKeyPress}></li>
            <li><h2>Email</h2></li>
            <li><input type="email" placeholder="Enter your email" id='emailReg' on:keypress={onKeyPress}></li>
            <li><button on:click={Registration}><h3>Registrate</h3></button></li>
        </ul>
    </div>
</body>



<style>

    body {
        height: 750px;
        display: flex;
    }

    div {
        margin: auto;
        background-color: white;
        width: 40%;
        max-width: 600px;
        height: 600px;
        display: flex;
        border-radius: 5px;
        box-shadow: 2px 0 2px rgba(0, 0, 0, 0.25), 2px 0 2px rgba(0, 0, 0, 0.25), 0 2px 2px rgba(0, 0, 0, 0.25), 0 2px 2px rgba(0, 0, 0, 0.25);
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
        box-shadow: 2px 2px 2px rgba(0,0,0,0.5);
        border-radius: 5px;
        outline-style: none;
    }

    input:focus {
        background-color: rgba(0,0,0,0.25);
        border-color: rgba(0,0,0,0.1);
    }

    h2 {
        margin: 0;
        margin-top: 20px;
        margin-bottom: 15px;
        padding: 0;
        color: rgba(0,0,0,0.5);
        text-shadow: 2px 2px 5px rgba(0,0,0,0.6);
    }

    h3 {
        margin: 0;
        padding: 0;
        text-shadow: 5px 5px 10px black;
    }

    button {
        margin: 0;
        margin-top: 40px;
        padding: 0;
        width: 92%;
        height: 40px;
        border-radius: 5px;
        color: white;
        border: 0;
        background: rgb(0,0,0);
        background: linear-gradient(167deg, rgba(0,0,0,1) 0%, rgba(14,19,73,1) 42%, rgba(135,26,123,1) 100%);
        box-shadow: 2px 2px 2px black;
    }

    button:active {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid black;
        color: black;
    }

</style>