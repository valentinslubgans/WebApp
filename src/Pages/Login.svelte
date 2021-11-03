<script>
    import { beforeUpdate, afterUpdate, onMount } from 'svelte';
    import {simpleMessage} from "../Forms/messages";
    import LoginForm from '../Forms/LoginForm.svelte';

    onMount( ()=> {
        simpleMessage( "Login page" );
    } );

</script>

<LoginForm/>