<script>
import Icon from '../Icons/LoginIcon.svelte';
import BasketIcon from '../Icons/BasketIcon.svelte';
import {basketMap} from './Stores';
import {userAcc} from './Stores';
import {basketSizeHolder} from './Stores';

</script>

<body>
    <header>
        <ul>
            <li> <a href="/#/"> <h1>Home</h1> </a> </li>
            <li> <a href="/#/about"> <h1>About</h1> </a> </li>
            <li> <a href="/#/news"> <h1>News</h1> </a> </li>
            <li> <a href="/#/products"> <h1>Products</h1> </a> </li>
            <li style="float:right"> <a href={$userAcc.profLink}>
                <h1 style="float:left"> Hi, {$userAcc.name} ! </h1>
                    {#if !$userAcc.logon } <Icon/> {/if} </a> </li>
            {#if $userAcc.logon}
            <li style="float:right"> <a href="/#/basket"> <BasketIcon w="30px" h="30px" ml="5px"/>  <h6>{$basketSizeHolder}</h6> </a> </li>
            {/if}
        </ul>
    </header>
</body>

<style>

    body {
        height: auto;
        margin: 0;
        padding: 0;
    }

    h6 {
        margin: 0;
        padding: 0;
        color: white;
    }

    h1 {
        font-size: 22px;
        color: white;
        margin: 0;
    }

    ul {
        padding: 0;
        margin: 0;
        overflow: hidden;
        background: TEAL;
    }

    a {
        text-decoration: none;
        padding: 10px 20px 10px 20px;
        display: flex;
        align-items: flex-end;
    }

    li {
        display: inline;
        float: left;
    }

    header {
        height: 60px;
    }
    
    a:hover {
        background: rgba(255, 255, 255, 0.1);
    }

</style>