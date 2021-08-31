<script>
    import { ActualPageDescription } from './Stores';
</script>

<h3 style = "color:rgb( { $ActualPageDescription.r }, { $ActualPageDescription.g }, { $ActualPageDescription.b } )" > { $ActualPageDescription.t } </h3>
<hr>

<style>

hr {
    border: 0;
    height: 1px;
    width: 90%;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}

    h3 {
        width: 90%;
        text-align: center;
        font-size: 15px;
        margin: auto;
        padding-top: 10px;
        padding-bottom: 20px;
    }
</style>