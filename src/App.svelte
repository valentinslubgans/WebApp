<script>
    import Router from 'svelte-spa-router';
    import Home from './Pages/Home.svelte';
    import About from './Pages/About.svelte';
    import News from './Pages/News.svelte';
    import Login from './Pages/Login.svelte';
    import Products from './Pages/Products.svelte';
    import RegisterPage from './Pages/RegisterPage.svelte';

</script>


<Router routes = {{
    '/': Home,
    '/about': About,
    '/news': News,
    '/login': Login,
    '/products': Products,
    '/register': RegisterPage
}} />