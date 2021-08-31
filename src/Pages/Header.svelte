<script>
    import Icon from '../Icons/LoginIcon.svelte';
</script>

<header>
    <ul>
        <li> <a href="/#/"> <h1>Home</h1> </a> </li>
        <li> <a href="/#/news"> <h1>News</h1> </a> </li>
        <li> <a href="/#/products"> <h1>Products</h1> </a> </li>
        <li> <a href="/#/about"> <h1>About</h1> </a> </li>
        <li style="float:right"> <a href="/#/login">  <Icon/> </a> </li>
    </ul>
</header>

<style>

    h1 {
        font-size: 20px;
        color: white;
        margin: 0;
        text-shadow: 7px 7px 10px rgba(0,0,0,0.5);
    }

    ul {
        padding: 0;
        margin: 0;
        overflow: hidden;
        background: rgb(0,0,0);
        background: linear-gradient(167deg, rgba(0,0,0,1) 0%, rgba(14,19,73,1) 42%, rgba(135,26,123,1) 100%);
    }

    a {
        text-decoration: none;
        padding: 10px 20px 10px 20px;
        display: block;
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