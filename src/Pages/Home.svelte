<script>
    import { beforeUpdate, afterUpdate, onMount } from 'svelte';
    import {simpleMessage} from "../Forms/messages";

    onMount( ()=> {
        simpleMessage( "Hi, this is the Home page. <br> On this page i want to tell you a bit about this project and myself." )
    } );

</script>

<body>
        <span>

            <p>
                Hi, my name is Valentins Lubgans and this is my project. At first: i want to apologise for the design, working on project, I understood
                one thing: I`m not a designer at all. Seconds thing: im a new in programming and still learning. This project was made to show my 
                skills in JS, CSS and THML at this moment. Now i`m looking for a junior developer job, where i can improove myself 
                and my IT skills. I want to move forward as a IT developer.
            </p>

            <p>
                In this project i used  <a href="https://svelte.dev/">Svelte</a> framework for front-end development. Why Svelte? 
                It`s new and really powerfull framework, as well it`s very friendly for users. In a case, You wish me lear Angular, 
                React or Vue.js knowledge, i will lear it, it`s just a frameworks.
            </p>

            <p>
                For the server part i used Node.js with <a href="https://expressjs.com/">express.js</a> framework. For database i used 
             <a href="https://www.mongodb.com/">mongoDB</a> with Mongoose library. All images i`m savig on server. All passwords are hashed with 
             <a href="https://www.npmjs.com/package/bcrypt">bcrypt</a> library.
            </p>

            <p>
                I never worked as developer, i do understand, most companies use Angular, React and Vue.js. Working with different
                databases and so on... This project is only made to show: i do understand what i`m doing and i`m enough motivated to carry on.
                I`m ready to learn new, improoving myself and work hard as much, as it will be needed.
            </p>
            <p>
                My code on GitHub:
                <a href="https://github.com/valentinslubgans/WebApp.git">Web app repository</a>
                <a href="https://github.com/valentinslubgans/Server.git">Server part repository</a>
            </p>
        </span>
</body>


<style>

    body {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-wrap: nowrap;
        justify-content: flex-start;
    }

    span {
        margin: 0;
        margin-top: 20px;
        padding: 0;
        width: 80%;
        max-width: 1000px;
    }

    p {
        font-weight: 400;
        font-size: 20px;
        text-indent: 10px;
    }

</style>