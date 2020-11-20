// guardar o recoger el evento del local storage 
const CART_PRODUCTOS = "cartProductsId";
// cuando el DOM se rederice --- osea cuando las funciones se ejecuten por completo 
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadProductCart(); // al recargar la pagina carga el carrito de compras 
});
// funcion del fetch 
function getProductsDb() {
    const url = "../dbProducts.json";

    return fetch(url)
        .then(response => {
        // para el retorno de los productos
        return response.json();
        })
        .then(result => {
            // obtenemos los resultados 
            return result;
        })
        .catch(err => {
            console.log(err);
        });
}
// funcion asincrona para cargar los productos una vez que el documento HTML ha sido completamente cargado y parseado, 
//sin esperar hojas de estilo, images y subframes para  finalizar la carga ("DOMContentLoaded").
async function loadProducts() {
    
    const products = await getProductsDb();
    //generar los productos
    let html = '';
    products.forEach(product => {
        html += `
            <div class="col-3 product-container">
                <div class="card product">
                    <img
                        src="${product.image}"
                        class="card-img-top"
                        alt="${product.name}"
                    />
                    <div class="card-body">
                        <div class="card-title-div"><h5 class="card-title">${product.name}</h5></div>
                        <p class="card-text">${product.extraInfo}</p>
                        <p class="card-text">$ ${product.price} / Unidad</p>
                        <button type="button" class="btn btn-primary btn-cart" onClick=(addProductCart(${product.id}))>Añadir al carrito</button>
                    </div>
                </div>
            </div>    
        `;  
    });
    // hacer que se cargue el html en la pagina web
    document.getElementsByClassName("products")[0].innerHTML =  html;
}
// cuando se presione el boton del carrito se despliegue el contenido (abrir y cerrar)
function openCloseCart() {
    // variable para saber las clases del html y css (hidden o active)
    const containerCart = document.getElementsByClassName("cart-products")[0];
    containerCart.classList.forEach(item => {
        if(item === "hidden") {
            containerCart.classList.remove("hidden");
            containerCart.classList.add('active');
        }

        if(item === "active") {
            containerCart.classList.remove("active");
            containerCart.classList.add("hidden");
        }
    });
}

// añadir los productos al carrito
function addProductCart(idProduct) {
    let arrayProductsId = [];
    // solo se guardara el ID de los productos que estan en el carro en el localStorage
    let localStorageItems = localStorage.getItem(CART_PRODUCTOS);
    if(localStorageItems === null) {
        arrayProductsId.push(idProduct);
        localStorage.setItem(CART_PRODUCTOS, arrayProductsId);
    }else {
        let productsId = localStorage.getItem(CART_PRODUCTOS);
        if(productsId.length > 0) {
            productsId +=',' + idProduct;
        }else {
            productsId = productsId;
        }
        localStorage.setItem(CART_PRODUCTOS, productsId);
    }
    loadProductCart()
}

//añadiendo todos los ID del localStorage en el carrito
async function loadProductCart() {
    const products = await getProductsDb();

    // convertimos el resultado del localStorage en un array obtenemos en valor ID 
    const localStorageItems = localStorage.getItem(CART_PRODUCTOS);
    let html = "";
    // si el carro esta vacio 
    if(!localStorageItems) {
        html = `
            <div class="cart-product empty">
                <p>Carrito vacio.</p>
            </div>`;
    }else {
        const idProductsSplit = localStorageItems.split(',');

        // eliminamos los ID duplicados 
        const idProductsCart = Array.from(new Set(idProductsSplit));

        //crear la estructura
        idProductsCart.forEach(id => {
            products.forEach(product => {
                if(id == product.id) {
                    // para agregar cantidad de productos repetidos
                    const quantity = countDuplicatesID(id, idProductsSplit);
                    // multiplicar el producto por la candidad de veces seleccinado
                    const totalPrice = product.price * quantity;  
                    html += `
                        <div class="cart-product">
                            <img src="${product.image}" alt="${product.name}" />
                            <div class="cart-product-info">
                                <span class="quantity">${quantity}</span>
                                <p>${product.name}</p>
                                <p>${totalPrice.toFixed(2)}</p>
                                <p class="change-quantity">
                                    <button onClick=(decreaseQuantify(${product.id}))>-</button>
                                    <button onClick=(increaseQuantify(${product.id}))>+</button>
                                </p>
                                <p class="cart-product-delete">
                                    <button onClick=(deleteProductCart(${product.id}))>Eliminar</button>
                                </p>
                            </div>
                        </div>`;
                }
            });
        });
    }

    // añadir la tarjeta al carrito solo una tarjeta por producto agregado
    document.getElementsByClassName("cart-products")[0].innerHTML = html; 
}

// función para eliminar los productos del carrito
function deleteProductCart(idProduct) {
    const idProductsCart = localStorage.getItem(CART_PRODUCTOS);
    const arrayIdProductsCart = idProductsCart.split(','); // los ID del localStorage  se pasaron a un array
    const resultIDDelete = deleteAllIds(idProduct, arrayIdProductsCart); // se van a quitar las ID 
    // hacer desaparecer la cart del carrito
    if(resultIDDelete) {
        let count = 0;
        let idsString = "";

        resultIDDelete.forEach(id => {
            count++;
            if(count < resultIDDelete.length){
                idsString += id + ",";
            }else {
                idsString += id;
            }
        });
        localStorage.setItem(CART_PRODUCTOS, idsString);
    }
    //cuando el carrito queda vacio (para que pueda dejar agregar nuevamente productos)
    const idsLocalStorage = localStorage.getItem(CART_PRODUCTOS);
    if(!idsLocalStorage) {
        localStorage.removeItem(CART_PRODUCTOS);
    }

    loadProductCart(); 
}

// para quitar elementos de un array (solo va retornar los ID que no le han dado eliminar)
function deleteAllIds(id, arrayIds) {
    return arrayIds.filter(itemId => {
        return itemId != id;
    });
}

// funcion para obtener cantidad del mismo productos 
function countDuplicatesID(value, arrayIds) {
    let count = 0;

    arrayIds.forEach(id => {
        if(value == id) {
            count++;
        }
    });
    return count;
}

//función para restar productos dentro del carrito 
function decreaseQuantify(idProduct) {
    const idProductsCart = localStorage.getItem(CART_PRODUCTOS);
    const arrayIdProductsCart = idProductsCart.split(",");
    
    const deleteItem = idProduct.toString();
    let index = arrayIdProductsCart.indexOf(deleteItem);
    if(index > -1) {
        arrayIdProductsCart.splice(index, 1);
    }

    let count = 0;
    let idsString = "";
    arrayIdProductsCart.forEach(id => {
        count++;
        if(count < arrayIdProductsCart.length) {
            idsString += id + ",";
        }else {
            idsString += id;
        }
    });
    localStorage.setItem(CART_PRODUCTOS, idsString);
    loadProductCart();
}

//función para sumar productos dentro del carrito 
function increaseQuantify(idProduct) {
    const idProductsCart = localStorage.getItem(CART_PRODUCTOS);
    const arrayIdProductsCart = idProductsCart.split(",");
    arrayIdProductsCart.push(idProduct);

    let count = 0;
    let idsString = "";
    arrayIdProductsCart.forEach(id => {
        count++;
        if(count < arrayIdProductsCart.length) {
            idsString += id + ",";
        }else {
            idsString += id;
        }
    });
    localStorage.setItem(CART_PRODUCTOS, idsString);
    loadProductCart();
}

