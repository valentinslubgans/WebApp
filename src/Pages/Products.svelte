<script>
    import { beforeUpdate, afterUpdate } from 'svelte';
    import Header from './Header.svelte';
    import PageDescription from './PageDescription.svelte';
    import {ActualPageDescription} from './Stores';

    beforeUpdate( ()=> {
        $ActualPageDescription.r = 0;
        $ActualPageDescription.g = 0;
        $ActualPageDescription.b = 0;
        $ActualPageDescription.t = "Products page";
    } );

</script>

<Header/>
<PageDescription/>