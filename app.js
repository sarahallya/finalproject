let wishlist = JSON.parse(localStorage.getItem('wishlist')) || []; 
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to add a product to the cart
function addToCart(product) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1; 
        alert(`${product.name} quantity has been updated to ${cart[existingProductIndex].quantity}!`);
    } else {
        product.quantity = 1; 
        cart.push(product);
        alert(`${product.name} has been added to your cart!`);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to open the cart page
function openCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'cart.html';
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartDiv = document.getElementById("cart");
    cartDiv.innerHTML = '';

    cart.forEach((product, index) => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");
        productDiv.innerHTML = `
            <h2>${product.name}</h2>
            <p>Brand: ${product.brand}</p>
            <p>Price: $${product.price}</p>
            <img src="${product.image_link}" alt="${product.name}" width="100">
            <p>Description: ${product.description}</p>
            <p>Rating: ${product.rating ? product.rating : 'Not rated'}</p>
            <p>Type: ${product.product_type ? product.product_type : 'Unknown type'}</p>
            <div class="button-container">
                <button onclick="decreaseQuantity(${index})">-</button>
                <span class="quantity-display">${product.quantity}</span>
                <button onclick="increaseQuantity(${index})">+</button>
                <button onclick="removeFromCart(${index})">Remove from Cart</button>
            </div>
        `;
        cartDiv.appendChild(productDiv);
    });

    displayTotalPrice();
}


// Function to calculate total price
function calculateTotalPrice() {
    let total = 0;
    cart.forEach(product => {
        total += product.price * product.quantity; 
    });
    return total; 
}

// Function to display total price
function displayTotalPrice() {
    const totalPriceDiv = document.getElementById("total-price");
    const total = calculateTotalPrice(); 
    totalPriceDiv.innerHTML = `Total Price: $${total.toFixed(2)}`; 
}

// Function to increase product quantity
function increaseQuantity(index) {
    cart[index].quantity += 1; 
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart(); 
}

// Function to decrease product quantity
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1; 
    } else {
        removeFromCart(index);
        return; 
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart(); 
}

// Function to remove a product from the cart
function removeFromCart(index) {
    const product = cart[index];

    const confirmationModal = document.getElementById("confirmationModal");
    const confirmationMessage = document.getElementById("confirmationMessage");
    confirmationMessage.innerText = `Are you sure you want to remove ${product.name} from your cart?`;
    confirmationModal.style.display = "flex";

    document.getElementById("confirmYes").onclick = function() {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} has been removed from your cart!`);
        loadCart();
        confirmationModal.style.display = "none";
    };

    document.getElementById("confirmNo").onclick = function() {
        alert(`Action canceled. ${product.name} remains in your cart.`);
        confirmationModal.style.display = "none";
    };
}


// Function to load popular products 
function loadPopularProducts() {
    // Array of brands to fetch popular products from
    const brands = ["maybelline", "l'oreal"];
    let promises = brands.map(brand => 
        fetch(`http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}`)
            .then(response => response.json())
            .then(data => {
                
                return [data[1], data[4], data[8]]; 
            })
    );

    // Wait for all brand fetches to complete
    Promise.all(promises).then(results => {
        
        const allPopularProducts = results.flat();
        displayPopularProducts(allPopularProducts);
    }).catch(error => {
        console.error('Error fetching popular products:', error);
    });
}

// Function to display popular products in the results div
function displayPopularProducts(products) {
    const popularDiv = document.getElementById("popular-products");
    popularDiv.innerHTML = ''; 
    products.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");

        productDiv.innerHTML = `
            <h2>${product.name}</h2>
            <p>Brand: ${product.brand}</p>
            <p>Price: $${product.price}</p>
            <img src="${product.image_link}" alt="${product.name}" width="100">
            <p>Description: ${product.description}</p>
            <p>Rating: ${product.rating ? product.rating : 'Not rated'}</p>
            <p>Type: ${product.product_type ? product.product_type : 'Unknown type'}</p>
            <div class="button-container">
                <button onclick="window.open('${product.product_link}', '_blank')">View Product</button>
                <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">Add to Cart</button>
                <button onclick="addToWishlist(${JSON.stringify(product).replace(/"/g, '&quot;')})">Add to Wishlist</button>
            </div>
        `;
        popularDiv.appendChild(productDiv);
    });
}

// Function to search products based on brand and price range
function searchProducts() {
    const brand = document.getElementById("brand_input").value;
    const minPrice = parseFloat(document.getElementById("min_price").value) || 0;
    const maxPrice = parseFloat(document.getElementById("max_price").value) || Infinity;

    fetch(`http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}`)
        .then(response => response.json())
        .then(data => {
            const filteredProducts = data.filter(product => {
                const price = parseFloat(product.price);
                return price >= minPrice && price <= maxPrice;
            });
            displayProducts(filteredProducts);
        });
}

// Function to display products in the results div
function displayProducts(products) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ''; 
    products.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");

        productDiv.innerHTML = `
            <h2>${product.name}</h2>
            <p>Brand: ${product.brand}</p>
            <p>Price: $${product.price}</p>
            <img src="${product.image_link}" alt="${product.name}" width="100">
            <p>Description: ${product.description}</p>
            <p>Rating: ${product.rating ? product.rating : 'Not rated'}</p>
            <p>Type: ${product.product_type ? product.product_type : 'Unknown type'}</p>
            <div class="button-container">
                <button onclick="window.open('${product.product_link}', '_blank')">View Product</button>
                <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">Add to Cart</button>
                <button onclick="addToWishlist(${JSON.stringify(product).replace(/"/g, '&quot;')})">Add to Wishlist</button>
            </div>
        `;
        resultsDiv.appendChild(productDiv);
    });
}

function goBack() {
    window.location.href = 'index.html';
}

// Function to add a product to the wishlist
function addToWishlist(product) {
    const exists = wishlist.some(item => item.id === product.id);
    
    if (exists) {
        alert(`${product.name} is already in your wishlist!`);
    } else {
        wishlist.push(product); 
        localStorage.setItem('wishlist', JSON.stringify(wishlist)); 
        alert(`${product.name} has been added to your wishlist!`);
    }
}

// Function to open the wishlist page
function openWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist)); 
    window.location.href = 'wishlist.html';
}

// Function to load the wishlist and display it
function loadWishlist() {
    wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistDiv = document.getElementById("wishlist");
    wishlistDiv.innerHTML = '';
    
    wishlist.forEach((product, index) => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");
        productDiv.innerHTML = `
            <h2>${product.name}</h2>
            <p>Brand: ${product.brand}</p>
            <p>Price: $${product.price}</p>
            <img src="${product.image_link}" alt="${product.name}" width="100">
            <p>Description: ${product.description}</p>
            <p>Rating: ${product.rating ? product.rating : 'Not rated'}</p>
            <p>Type: ${product.product_type ? product.product_type : 'Unknown type'}</p>
            <div class="button-container">
                <button onclick="window.open('${product.product_link}', '_blank')">View Product</button>
                <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">Add to Cart</button>
                <button onclick="removeFromWishlist(${index})">Remove from Wishlist</button>
            </div>
        `;
        wishlistDiv.appendChild(productDiv);
    });
}

// Function to remove a product from the wishlist
function removeFromWishlist(index) {
    const product = wishlist[index]; 

    const confirmationModal = document.getElementById("confirmationModal");
    const confirmationMessage = document.getElementById("confirmationMessage");
    confirmationMessage.innerText = `Are you sure you want to remove ${product.name} from your wishlist?`;
    confirmationModal.style.display = "flex"; 

    document.getElementById("confirmYes").onclick = function() {
        wishlist.splice(index, 1); 
        localStorage.setItem('wishlist', JSON.stringify(wishlist)); 
        alert(`${product.name} has been removed from your wishlist!`); 
        loadWishlist(); 
        confirmationModal.style.display = "none"; 
    };

    // Handle No button click
    document.getElementById("confirmNo").onclick = function() {
        alert(`Action canceled. ${product.name} remains in your wishlist.`); 
        confirmationModal.style.display = "none"; 
    };
}

function showModal() {
    const modal = document.getElementById("recommendationModal");
    modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("recommendationModal");
    modal.style.display = "none";
}

window.onload = function () {
    setTimeout(showModal, 2000); 
};


// Function to open the search page
function goToSearch() {
    window.location.href = 'search.html';
}

// Function to open the wishlist page
function openWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist)); 
    window.location.href = 'wishlist.html';
}


// Event listener for loading popular products on the search page
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.contains(document.getElementById("results"))) {
        loadPopularProducts(); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById("popular-products")) {
        loadPopularProducts(); 
    }
});

// Event listener to load the wishlist on the wishlist page
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.contains(document.getElementById("wishlist"))) {
        loadWishlist();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const greetingElement = document.getElementById("greetingMessage");
    const hour = new Date().getHours();

    let greeting = "Hello! Check out the latest trends!";
    if (hour < 12) greeting = "Good morning! Start your day with a new look!";
    else if (hour < 18) greeting = "Good afternoon! Discover your next beauty find!";
    else greeting = "Good evening! Pamper yourself with new products!";

    greetingElement.textContent = greeting;
});

// Ensure the cart is loaded as soon as the cart page content is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    loadCart(); 
});
