<script>
    import Router from 'svelte-spa-router';
    import Home from './Pages/Home.svelte';
    import About from './Pages/About.svelte';
    import News from './Pages/News/News.svelte';
    import Login from './Pages/Login.svelte';
    import Products from './Pages/Products/Products.svelte';
    import RegisterPage from './Pages/RegisterPage.svelte';
    import Profile from './Pages/Profile.svelte';
    import Header from './Pages/Header.svelte';
    import PageDescription from './Pages/PageDescription.svelte';
    import Basket from './Pages/Basket.svelte';

</script>

<Header/>
<PageDescription/>

<Router routes = {{
    '/': Home,
    '/about': About,
    '/news': News,
    '/login': Login,
    '/products': Products,
    '/register': RegisterPage,
    '/profile': Profile,
    '/basket': Basket
    }} />