<script>
    import { ActualPageDescription } from './Stores';
</script>

<body>
    <h3 style = "color:rgb( { $ActualPageDescription.r }, { $ActualPageDescription.g }, { $ActualPageDescription.b } )" > {@html $ActualPageDescription.t} </h3>
    
    <hr>
</body>


<style>

body {
        height: auto;
        margin: 0;
        padding: 0;
    }

hr {
    border: 0;
    height: 1px;
    width: 90%;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}

    h3 {
        width: 80%;
        max-width: 1000px;
        text-align: center;
        font-size: 20px;
        font-weight: 500;
        margin: auto;
        padding-top: 10px;
        padding-bottom: 20px;
    }
</style>