import ProductSheet from "./ProductSheet.svelte";

function productListCreating( productFile ) {

    let productDiv = document.createElement( "div" );
    document.getElementById("productListDiv").prepend(productDiv);
    AddStyleToProductDiv( productDiv );

    productDiv.value = productFile;

    let productImg = document.createElement( "img" );
    productDiv.append( productImg );
    AddProductImageStyle( productImg );

    let spanPHolder = document.createElement( "span" );
    productDiv.append( spanPHolder );

    let priceP = document.createElement( "p" );
    spanPHolder.append( priceP );
    priceP.innerHTML = "Price: " + productFile.productPrice + "$";
    priceP.style.color = "MAROON";
    AddPStyle( priceP );

    let nameP = document.createElement( "p" );
    spanPHolder.append( nameP );
    nameP.innerHTML = productFile.productName;
    AddPStyle( nameP );

    
        fetch("http://localhost:5000/imageGet/" + productFile.productPictureName )
        .then( response => response.blob() )
        .then( imageURL => {
            let imageBlob = URL.createObjectURL( imageURL );
            productImg.src = imageBlob;
        })
        .catch( err => console.log( err ) );

    productDiv.onclick = () => {
        const prSheet = new ProductSheet({
            target: document.getElementById("porductBody"),
            props: {
                productObject: productDiv.value,
                productPicture: productImg.src,
                parentElement: productDiv
            }
        });
    }
}


function AddPStyle( element ) {
    element.style.margin = "0";
    element.style.marginBottom = "10px";
    element.style.marginLeft = "10px";
    element.style.maxWidth = "180px";
    element.style.fontWeight = "bolder";
}


function AddProductImageStyle( element ) {
    element.style.marginBottom = "20px";
    element.style.width = "100%";
    element.style.height = "auto";
    element.style.maxHeight = "75%";
    element.style.top = "0";
    element.style.left = "0";
}


function AddStyleToProductDiv( element ) {

    element.style.margin = "50px 2% 0 2%";
    element.style.padding = "0";
    element.style.width = "200px";
    element.style.height = "300px";
    element.style.backgroundColor = "white";
    element.style.cursor = "pointer";
    element.style.display = "flex";
    element.style.flexDirection = "column";
    element.style.alignItems = "flex-start";
    element.style.justifyContent = "space-between";


    element.onmouseover = () => {
        element.style.transform = "scale(1.2)";
        element.style.boxShadow = "rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px";
    }

    element.onmouseout = () => {
        element.style.transform = "scale(1)";
        element.style.boxShadow = "none";
    }
}

export { productListCreating };