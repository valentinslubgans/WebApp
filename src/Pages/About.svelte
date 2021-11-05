<script>
    import { beforeUpdate, afterUpdate, onMount } from 'svelte';
    import {simpleMessage} from "../Forms/messages";

    onMount( ()=> {
        simpleMessage( "On this page i want to tell you a bit more about my." )
    } );

</script>


<body>
    <span>
        <p>
            If you read <a href="/#/">home page</a>, you already know that my name is Valentins Lubgans and I am 32 years old. My diploma says I am a 
            professional chef, but my passion is programming. 
            My first programming experience was when I was 15 - back then there was a popular game "Ultima Online" that I used to play on a
            private server with a legal software, allowing to automize any process in the game via scripts.
            A big advantage of being a lazy person is the will to automize everything in order to do less, so I started learning script language and 
            automized anything I could. A year later I joined a project where we made our private server for this game. The server used script language, but 
            it was a great experience for a beginner like me and I remember enjoying this project very much. 
            
        </p>

        <p> 
            Around the same time I finished highschool and moved to the UK. I put programming aside for a few years while I was managing my 
            work in a restaurant and my life in another country. But a few years later I started playing the WoW or "World of Warcraft". Again, being lazy 
            made me think of ways to avoid pressing buttons myself, so I made the addon (using LUA languge) and learned Java to make a software that 
            could communicate with my addon and press buttons in my place. Later I started using C++ for softwares. I remember enjoying every second of it.
            The part of programming I enjoy the most is the constant feeling of being challenged to do better, faster, more efficient. Every successful
            step in programming gives a great feeling of accomplishment, but it also naturally leads to the next thing to solve or improve. It is 
            a constant drive and I love it.
        </p>

        <p>
            Last year was a game changer for me. Partly because of moving back to Latvia and re-thinking my life choices and priorities, 
            partly because of the pandemics that made my job even more intense and made me wonder if that is something I enjoy enough to dedicate 
            all my time and strenghts to, and partly because of recently entering my thirties - age comes with much thinking and analyzing I guess. 
            Remembering the excitment I felt while programming, I spent my free time learning more about Java Script and challenged myself to start 
            this project. The more I read and programmed, the more interested I was to continue. The constant learning and seeking for solutions is 
            something I enjoy more than any job I have ever had. So the decision to change my job came naturally and I am ready to explore the 
            IT sector!  
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