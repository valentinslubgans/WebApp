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
            If You red <a href="/#/">home page</a>, You already know, my name is Valentins Lubgans and i am 32 year old.
            First time i face with programming when i was 15. That time were popular game "Ultima Online", i played on 
            private server where were legal software, witch allowed automatizate avery process in a game via scripts.
            As I`m lazy person, I start to lear script language and in some time i could automatizate everything. 
            Year after, i join to a project, where we made own private server for this game. It wasn`t popular, 
            as well it used script language, but it gave me good experience.
        </p>

        <p> 
            After I finished technical school and moved to England. All this time i dropped off programming,
            before, leaving in England, i start to play "World of Warcraft" ( WoW forward ). As You remember, i`m lazy person, 
            and didn`t want to press all buttons by myself, it was kind a playing piano... So i made the addon (using LUA languge),
            learned Java to make software, witch could communicate with my addon and pressed buttons my place. After i start 
            to use C++ for softwares. After i dropped off programming once again till i came back to Latvia.
        </p>

        <p>
            Year ago i deside: i will change my life, and first - i will change my job, i want to do, what i like to do!
            I really enjoy with developing, solutions founding. So i start to learn Java Script. Every day after hard job, 
            at leas hour i learned JS. At the end of summer, i finished my job, and concentrated on this project creating.
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