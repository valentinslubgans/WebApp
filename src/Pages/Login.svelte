<script>
    import { beforeUpdate, afterUpdate } from 'svelte';
    import Header from './Header.svelte';
    import PageDescription from './PageDescription.svelte';
    import {ActualPageDescription} from './Stores';
    import LoginForm from '../Forms/LoginForm.svelte';

    beforeUpdate( ()=> {
        $ActualPageDescription.r = 0;
        $ActualPageDescription.g = 0;
        $ActualPageDescription.b = 0;
        $ActualPageDescription.t = "Login page";
    } );

</script>

<Header/>
<PageDescription/>
<LoginForm/>