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
                Hi! My name is Valentins Lubgans and this is my project. At first I want to apologise for the design - working on this project I understood
                one thing: I am not a designer at all. Second thing - I am  new in programming and I am still learning. This project was made to show my 
                skills in JS, CSS and THML at this moment. Having a little experience in the IT sector for now, I am looking for a job as a junior developer where I could improve 
                my skills as an IT developer. 
            </p>

            <p>
                In this project I used  <a href="https://svelte.dev/">Svelte</a> framework for front-end development. Why Svelte? 
                It is a new and really powerfull framework, and I find it very used-friendly. But It is just a framework and I can quickly learn to operate with other 
                often used franeworks like Angular, React or Vue.js.
            </p>

            <p>
                For the server part I used Node.js with <a href="https://expressjs.com/">express.js</a> framework. For the database I used 
             <a href="https://www.mongodb.com/">mongoDB</a> with Mongoose library. All images are saved on the server. All passwords are hashed with 
             <a href="https://www.npmjs.com/package/bcrypt">bcrypt</a> library.
            </p>

            <p>
                I have never worked as an IT developer, but I do know that most IT companies use Angular, React and Vue.js frameworks and use different
                databases. This project is too small to show all the programming options, but It is big enough to show the most important part - I understand the programming structure and
                 I challenge myself in finding solutions to any problem. Self-learning process proved that I am self-disciplined and motivated to keep working until getting the result. 
                 I enjoyed every single challenge and brainstorming - I am now sure that learning, experimenting, exploring options and seeking the most suitable solution is something 
                 I know I can and want to do for living. 
            </p>
            <ul>
                <li> <h3> My code on GitHub: </h3>  </li>
                <li> <a href="https://github.com/valentinslubgans/WebApp.git"> <h3> Web app repository </h3> </a> </li>
                <li> <a href="https://github.com/valentinslubgans/Server.git"> <h3> Server part repository </h3> </a> </li>
            </ul>

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

    ul {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    h3 {
        margin: 0;
        padding: 0;
        font-weight: 400;
        font-size: 20px;
    }

</style>