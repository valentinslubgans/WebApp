<script>
import { onMount } from 'svelte';
import ProfileForm from '../Forms/ProfileForm.svelte';
import {simpleMessage} from "../Forms/messages";
import {userAcc} from './Stores';


    onMount( () => {
        if ( $userAcc.logon ){
            simpleMessage( "Hi, this is Your account profile. <br> Here you can change your password and e-mail." );
        } else {
            window.location.href = './#/login';
        }

    } );
</script>

<ProfileForm/>