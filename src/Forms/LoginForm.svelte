<script>

    function LoginButton() {
        console.log( 'login: ' + document.getElementById( 'loginCheck' ).value );
        console.log( 'password: ' + document.getElementById( 'passwordCheck' ).value );
    }

    const onKeyPress = e => {
        if (e.charCode === 13) LoginButton();
    };

</script>

<body>
    <div>

        <span>
            <h1>Hello</h1>
            <a href="#/register"> If you are new, press here to register. </a> 
        </span>

        <ul>
            <li><h2>Login</h2></li>
            <li><input type="text" placeholder="Enter your login name" id='loginCheck' on:keypress={onKeyPress}></li>
            <li><h2>Password</h2></li>
            <li><input type="password" placeholder="Enter your password" id='passwordCheck' on:keypress={onKeyPress}></li>
            <li><button on:click= {LoginButton} ><h3>Login</h3></button></li>
        </ul>


    </div>
</body>


<style>

    input {
        box-shadow: 2px 2px 2px rgba(0,0,0,0.5);
        border-radius: 5px;
        outline-style: none;
    }

    input:focus {
        background-color: rgba(0,0,0,0.25);
        border-color: rgba(0,0,0,0.1);
    }

    button {
        margin-top: 25%;
        width: 100%;
        height: 8%;
        color: white;
        background: rgb(0,0,0);
        background: linear-gradient(167deg, rgba(0,0,0,1) 0%, rgba(14,19,73,1) 42%, rgba(135,26,123,1) 100%);
        border-radius: 5px;
        border: none;
        box-shadow: 2px 2px 2px black;
    }

    button:active {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid black;
        color: black;
    }

    h3 {
        margin: 0;
        text-shadow: 3px 3px 10px black;
    }

    h2 {
        color: rgba(0,0,0,0.5);
        text-shadow: 2px 2px 5px rgba(0,0,0,0.6);
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
        background: rgb(0,0,0);
        background: linear-gradient(167deg, rgba(0,0,0,1) 0%, rgba(14,19,73,1) 42%, rgba(135,26,123,1) 100%);
        border-radius: 5px 0 0 5px;
    }

    h1 {
        margin: auto;
        margin-top: 60px;
        color: white;
        font-size: 200%;
        text-shadow: 3px 3px 10px black;

    }

    a {
        margin: 0;
        margin-left: 5%;
        margin-right: 5%;
        font-size: 100%;
        color: white;
        text-shadow: 3px 3px 5px black;
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
        border-radius: 5px;
        background-color: white;
        box-shadow: 2px 0 2px rgba(0, 0, 0, 0.25), -2px 0 2px rgba(0, 0, 0, 0.25), 0 2px 2px rgba(0, 0, 0, 0.25), 0 2px 2px rgba(0, 0, 0, 0.25);
    }

</style>