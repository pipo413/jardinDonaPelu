// contentful -> https://contentful.github.io/contentful.js/contentful/8.3.7/
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "z3bhzsm47g2t",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "mKknk0tmc0DLlISAXKVpvj11wg7m91FuhGijxt2yWv8"
});




//Seleccionando los elementos 

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
var sellCartBtn = document.querySelector(".whastapp-btn-sell");

const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const ofertsDOM = document.querySelector(".offers-center");

const phoneContact = 5493513722328


//cart

let cart = [];
// buttons 
let buttonsDOM = []
// getting the products

class Products {
    async getProducts() {
        try {

            let contentful = await client.getEntries({ content_type: "jardinDonaPelu" }); //esto es de la API contentful
            console.log(contentful);

            let result = await fetch("products.json")
            // return result
            let data = await result.json();
            let products = contentful.items;
            products = products.map(item => {
                const { title, clase, description, price, riego, cuidado, luz} = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, clase, description, price, riego, cuidado, luz, id, image };
            })
            console.log(products);
            return products
        } catch (error) {
            console.log(error);

        }
        console.log(products);
    }
    

}

// display products

var totalSell = ""

class UI {
     
    displayProducts(products) {
        
        let productResult = '';
        let offerResult = '';

        products.forEach(product => {
            if (product.clase == "planta") {
                
                productResult += `
                <!-- single products -->
                <article class="product">
                <div class="img-container">
                <img src=${product.image} alt="${product.title}" class="product-img">
                <button class="bag-btn" data-id=${product.id} >
                <i class="fas fa-cart-arrow-down"></i>
                Agregar a carrito
                </button>
                </div>
                <h3>${product.title} </h3>
                <h4>$${product.price} </h4>
                </article>
                <!-- End of single products -->
                
                `
                
            }else if (product.clase == "oferta") {
                offerResult += `
                <!-- single products -->
                    <article class="product">
                    <div class="ribbon-wrapper">
                        <div class="ribbon">OFF</div>
                    </div>
                    <div class="img-container">
                        <img src="${product.image}" alt="${product.title}" class="product-img" />
                        <button class="bag-btn" data-id="${product.id}">
                        <i class="fas fa-cart-arrow-down"></i>
                        Agregar a carrito
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                    </article>
                    <!-- End of single products -->
                
                `
                

            }
            }
            );
            productsDOM.innerHTML = productResult;
            ofertsDOM.innerHTML = offerResult;
            
        }
    
    getBagButton() {
        const buttons = [...document.querySelectorAll(".bag-btn")]
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id)
            if (inCart) {
                button.innerText = "En Carrito"
                button.disabled = true
            }
            button.addEventListener("click", (event) => {
                event.target.innerText = "En Carrito"
                event.target.disabled = true
                // get product from products
                let cartItem = { ...Storage.getProduct(id), amount: 1 }
                // add product to the cart
                cart = [...cart, cartItem]
                // save cart in local storage 
                Storage.saveCart(cart)
                // set cart value
                this.setCartValues(cart)
                // display cart item 
                this.addCartItem(cartItem)
                // show the cart 
                // this.showCart()
            })

            // console.log(id);
        })
    }
    setCartValues(cart) {
        let tempTotal = 0
        let itemsTotal = 0
        cart.map(item => {
            tempTotal += item.price * item.amount
            itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal;
        // set SellCart
        totalSell = tempTotal
        this.sellCart()


        // console.log(cartTotal, cartItems);

    }



    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `
        <img src="${item.image}"
              alt="${item.title}"
            />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>Quitar</span>
            </div>
            <div>
              <i class="fas fa-chevron-up"  data-id=${item.id} ></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down"  data-id=${item.id}></i>
            </div>
        `
        cartContent.appendChild(div)


    }
    showCart() {
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    setupAPP() {
        // aca hacemos un update del carrito (si tiene o no los items) y con el this llamamos a setCartValues mandandole ese cart
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populate(cart);
        // agregamos el boton para abrir el carrito
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);

    }
    populate(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic() {
        // clear cart button

        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
            // console.log("Clear cart");
        });

        // buy cart button
        // sellCartBtn.addEventListener('click', () =>{
        //     this.sellCart(), 
        //     console.log("sell button")
        // });

     
            
        

        // cart functionality
        cartContent.addEventListener('click', event => {
            // console.log(event.target);
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                // como el "remove-item" esta en un div que esta dentro del cart-item, debo eliminar el padre del padre de donde esta la clase remove-item -> para poder eliminar el item completo
                // console.log(removeItem.parentElement.parentElement);
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id)

            } else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                // console.log(addAmount);
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                // actualizando el numero 
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                // console.log(lowerAmount);
                let tempItem = cart.find(item => item.id === id);

                tempItem.amount = tempItem.amount - 1;
                // si el item es = 0 no debería bajar más.
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)


                }

            }

        }
        )

    }
    clearCart() {
        // debugger
        // lo primero que hago es encontrar todos los id de los items que tiene el carrito
        let cartItems = cart.map(item => item.id);
        // console.log(cartItems);
        // Aca: Por cada id que encontremos en el map de cartItems vamos a remover el id
        cartItems.forEach(id => this.removeItem(id));
        // console.log(cartContent.children);
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id) {

        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false
        button.innerHTML = `<i class=<i class="fas fa-cart-arrow-down"></i>
        Agregar a carrito`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id)
    };

    // // sell button 
    sellCart() {
        // debugger
        let cartSells = cart.map(item => item.title);
        let cartAmounts = cart.map(item => item.amount);
        let Sellmessage = ""
        console.log(cartSells);
        console.log(cartAmounts);

        for (let i = 0; i < cart.length; i++) {
            
            Sellmessage = Sellmessage+"%0A%20%20*%20"+cartSells[i]+"%20~%20Cantidad:%20"+cartAmounts[i]
        }

        // console.log(Sellmessage)
        sellCartBtn.innerHTML = `<a target="_blank" href="https://wa.me/${phoneContact}?text=Solicitud%20de%20pedido:%0A${Sellmessage}%0A%0ATotal:%20${totalSell}">Solicitar</a`

        // %0A -> salto de línea
        
    }
}





//local storage 

class Storage {
    // Creamos un metodo statyc
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        // vamos a usar el operador ternario
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []; //Existen item en el carrito? si el carrito tiene elementos, entonces existe. Si existe me devuelve el cart con los items, si no existe me devuelve un array vacío (que es el valor por default que tiene asignado )

    }

}

document.addEventListener("DOMContentLoaded", () => {

    const ui = new UI;
    const products = new Products;
    // setuup APP
    ui.setupAPP()
    //get all products  
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.getBagButton()
        ui.cartLogic()

    })
});



















