<script>
    import ExitIcon from '../Icons/ExitIcon.svelte';
    import {userAcc} from '../Pages/Stores';
    import {funcPassChange} from './ProfPassChange';
    import {funcEmailChange} from "./ProfEmailChange";
    import {errMessage} from "./messages";

    let changeThePassword = true;

    // смена пароля
    function checkIfPassCorrect() {
        let errorPassField = false;
        let errText = "";

        if ( document.getElementById( 'passChange' ).value.length < 5 || document.getElementById( 'passChangeConfirm' ).value.length < 5 ) {
            errorPassField = true;
            errText += "Password must have at leas 5 simbols <br>";
        }
        if ( document.getElementById( 'passChange' ).value != document.getElementById( 'passChangeConfirm' ).value ) {
            errorPassField = true;
            errText += "Passwords must be equals.";
        }

        if ( errorPassField ) {
            errMessage( errText );
            return;
        } else {
            changeThePassword = true;
            document.getElementById( 'overlay' ).style.transform = "scale(1)";
            document.getElementById( 'changesConfirm' ).focus();
        }
    }

    const checkIfPassCorrectKeyPress = e => {
        if (e.charCode === 13) checkIfPassCorrect();
    };



    //смена E-Mail
    function checkIfEmailCorrect() {
        if ( !document.getElementById( 'emailChange' ).value.includes( '@' ) ){
            errMessage( 'Please enter correct email.' );
        } else if ( document.getElementById( 'emailChange' ).value.length < 5  ) {
            errMessage( 'Please enter correct email.' );
        } else if ( !document.getElementById( 'emailChange' ).value.includes( '.' ) ) {
            errMessage( 'Please enter correct email.' );
        } else {
            changeThePassword = false;
            document.getElementById( 'overlay' ).style.transform = "scale(1)";
            document.getElementById( 'changesConfirm' ).focus();
        }
    }

    const checkIfEmailCorrectKeyPress = e => {
        if (e.charCode === 13) checkIfEmailCorrect();
    };
    


    // переход на след строку в поле пароля
    const nextPassFieldFocus = e => {
        if (e.charCode === 13) document.getElementById( 'passChangeConfirm' ).focus();
    };



    //Оверлай
    function passCheckCancel() {
        document.getElementById( 'changesConfirm' ).value = "";
        document.getElementById( 'overlay' ).style.transform = "scale(0)";
    }

    function changesSending() {
        if ( changeThePassword ) {
            funcPassChange( $userAcc, document.getElementById( 'changesConfirm' ).value );
            passCheckCancel();
        }
        else {
            funcEmailChange( $userAcc,  document.getElementById( 'changesConfirm' ).value );
            passCheckCancel();
        } 
    }

    const onKeyPressPassCheck = e => {
        if (e.charCode === 13) {
            if ( changeThePassword ) {
                funcPassChange( $userAcc, document.getElementById( 'changesConfirm' ).value );
                passCheckCancel();
            } else {
                funcEmailChange( $userAcc,  document.getElementById( 'changesConfirm' ).value );
                passCheckCancel();
            }
        }
    };

    //выход
    function funcExit() {
        $userAcc.logon = false;
        $userAcc.name = "Guest";
        $userAcc.profLink = "/#/login";
        $userAcc.userID = "";
        window.location.href = "/#/login";
    }
</script>


<body>

    <div>
        <ul>
            <li><h1 class="accName">Account name: {$userAcc.name} </h1></li>
            <li><h1>Change the password:</h1></li>
            <li><input type="password" placeholder="Enter your new password" id='passChange' on:keypress={nextPassFieldFocus}></li>
            <li><input type="password" placeholder="Confirm your new password" id='passChangeConfirm' on:keypress={checkIfPassCorrectKeyPress}></li>
            <li><button on:click={checkIfPassCorrect} ><h3>Change</h3></button></li>
            <li><h1>Change the e-mail:</h1></li>
            <li><input type="email" placeholder="Enter your new email" id='emailChange' on:keypress={checkIfEmailCorrectKeyPress}></li>
            <li><button on:click={checkIfEmailCorrect} ><h3>Change</h3></button></li>
            <li><button class="exit" on:click={funcExit} ><h3>Exit</h3> <ExitIcon/> </button> </li>
        </ul>
    </div>


    <div id='overlay'>
        <div class="passConfirm" >
            <span>
                <h1>To confirm changes, enter your existing password. </h1>
            </span>
            
            <input class="inputChangesConfirm" type="password" placeholder="Enter your existing password" id="changesConfirm" on:keypress={onKeyPressPassCheck} >
    
            <div class="buttonHolder">
                <button class="cancelConfirm" on:click={passCheckCancel} >CANCEL</button>
                <button class="enterConfirm" on:click={changesSending} >ENTER</button>
    
            </div>
        </div>
    </div>

</body>


<style>
    body {
        height: auto;
        display: flex;
    }

    #overlay {
        margin: 0;
        padding: 0;
        top: 0;
        left: 0;
        width: -webkit-fill-available;
        height: -webkit-fill-available;
        position: fixed;
        background-color: rgba(0, 0, 0, 0.8);
        transform: scale(0);
        transform-origin: top right;
        transition: 200ms ease-in-out;
    }

    div.passConfirm {
        margin: 0;
        padding: 0;
        height: 30%;
        width: 50%;
        max-height: 280px;
        max-width: 620px;
        min-width: 400px;
        top: 30%;
        left: 30%;
        z-index: 1;
        position: fixed;
        background-color: white;
        display: block;
    }

    .cancelConfirm {
        margin: 0;
        margin-left: 12%;
        width: 30%;
        height: 100%;
    }

    .enterConfirm {
        margin: 0;
        margin-left: 15%;
        width: 30%;
        height: 100%;
    }

    .buttonHolder {
        margin: 0;
        padding: 0;
        margin-top: 5%;
        width: 100%;
        height: 15%;
        display: flex;
    }

    span {
        margin: 0;
        padding: 0;
        padding-bottom: 10px;
        height: auto;
        width: 100%;
        background-color: teal;
        display: flex;
        color: white;

    }

    span h1 {
        margin: 0;
        margin-top: 3%;
        margin-left: 5%;
        margin-right: 5%;
    }

    div input.inputChangesConfirm {
        margin: 0;
        padding: 0;
        padding-left: 5px;
        margin-left: 5%;
        margin-top: 10%;
        width: 90%;
        border-color: black;
    }

    div {
        margin: auto;
        width: 50%;
        min-width: 400px;
        height: 600px;
        display: flex;
    }

    h1 {
        font-size: 20px;
        margin: 0;
        margin-bottom: 10px;
    }

    h1.accName {
        font-size: 30px;
        margin: 0;
        margin-bottom: 40px;
    }

    ul {
        margin: auto;
        margin-top: 50px;
        margin-left: auto;
        margin-right: auto;
        padding: 0;
        list-style: none;
        width: 60%;
        min-width: 500px;
    }

    li {
        margin: 0;
        padding: 0;
    }

    input {
        margin: 0;
        padding: 0;
        padding-left: 5px;
        height: 40px;
        width: 100%;
        background-color: whitesmoke;
        outline-style: none;
        border-style: none;
        border-bottom-style: solid;
        border-bottom-width: 1px;
    }

    input:focus {
        background-color: darkgray;
    }

    button {
        width: 50%;
        height: 40px;
        margin: 0;
        margin-left: 50%;
        margin-top: 10px;
        margin-bottom: 40px;
        padding: 0;
        border: none;
        text-align: center;
        color: white;
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

    button h3 {
        font-size: 20px;
        padding: 0;
        margin: 0;
    }

    button.exit {
        background: rgba(128, 0, 0);
        height: 50px;
    }

    button.exit:hover{
        background: rgba(97, 0, 0);
    }

    button.exit:active {
        background: rgba(153, 0, 0);
    }

    button.exit h3 {
        font-size: 20px;
        float: left;
        padding: 0;
        margin: 0;
        margin-left: 40%;
        margin-top: 3%;
    }

</style>