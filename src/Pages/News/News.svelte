<script>
    import { beforeUpdate, afterUpdate, onMount } from 'svelte';
    import {simpleMessage} from "../../Forms/messages";
    import {userAcc} from "../../Pages/Stores";
    import AddNews from "./AddNews.svelte";
    import {NewsDisplay} from "./NewsDisplay";

    onMount( async ()=> {
        if ( $userAcc.logon ) simpleMessage( "Now you can add news" );
        else simpleMessage("To add news you need to login");
        
        await fetch("http://localhost:5000/newsReading", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        })
        .then( response => response.json() )
        .then( ( data ) => {
            data.forEach( element => {
                NewsDisplay( element );
            })
        })

    } );

</script>

{#if $userAcc.logon}
    <AddNews/>
{/if}
    
<body id="newsBody"></body>

<style>
</style>