<script>
    import { beforeUpdate, afterUpdate, onMount } from 'svelte';
    import {simpleMessage} from "../Forms/messages";
    import RegisterForm from '../Forms/RegisterForm.svelte';

    onMount( ()=> {
        simpleMessage( "You need to fill all fields" );
    } );

</script>

<RegisterForm/>