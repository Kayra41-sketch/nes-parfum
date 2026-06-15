// Ürünler Veritabanı (localStorage)
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Sayfayı Yükleme
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
});

// ÜRÜN EKLEME (Admin)
function addProduct() {
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const imageInput = document.getElementById('productImage');

    if (!name || !price || !imageInput.files[0]) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const product = {
            id: Date.now(),
            name: name,
            price: price,
            image: e.target.result
        };

        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));

        // Formu Temizle
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productImage').value = '';

        alert('✅ Ürün başarıyla eklendi!');
        loadProducts();
    };
    reader.readAsDataURL(imageInput.files[0]);
}

// ÜRÜNLERI YÜKLEME
function loadProducts() {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';

    if (products.length === 0) {
        productsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Henüz ürün eklenmemiş.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">₺${product.price.toFixed(2)}</div>
                <div class="product-quantity">
                    <input type="number" id="qty-${product.id}" value="1" min="1" max="100">
                    <button onclick="addToCart(${product.id})">Sepete Ekle</button>
                </div>
            </div>
        `;
        productsList.appendChild(productCard);
    });
}

// SEPETİ EKLE
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);

    if (quantity < 1) {
        alert('Lütfen geçerli bir miktar girin!');
        return;
    }

    // Sepette var mı kontrol et
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    alert(`✅ ${product.name} sepete eklendi!`);
    updateCartCount();
}

// SEPETİ GÖSTERİ/GİZLE
function toggleCart() {
    const cartSection = document.getElementById('cartSection');
    cartSection.classList.toggle('hidden');

    if (!cartSection.classList.contains('hidden')) {
        displayCart();
    }
}

// SEPETİ GÖRÜNTÜLE
function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');

    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #999;">Sepetiniz boş.</p>';
        totalPrice.textContent = '0₺';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₺${item.price.toFixed(2)} × ${item.quantity} = <strong>₺${itemTotal.toFixed(2)}</strong></p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">Sil</button>
        `;
        cartItems.appendChild(cartItem);
    });

    totalPrice.textContent = `${total.toFixed(2)}₺`;
}

// SEPETTENKALDIRMA
function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
    updateCartCount();
}

// SEPETİ GÜNCELLE
function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// SİPARİŞİ HAZIRLA
function prepareOrder() {
    if (cart.length === 0) {
        alert('Sepetiniz boş! Lütfen ürün ekleyin.');
        return;
    }

    // Sipariş Özeti Göster
    const orderReview = document.getElementById('orderReview');
    let total = 0;
    let html = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="order-review-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>₺${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });

    html += `<div class="order-review-total">TOPLAM: ₺${total.toFixed(2)}</div>`;
    orderReview.innerHTML = html;

    // Panelleri Değiştir
    document.getElementById('cartSection').classList.add('hidden');
    document.getElementById('confirmSection').classList.remove('hidden');
}

// SİPARİŞİ ONAYLA
function confirmOrder() {
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();

    if (!name || !email || !phone) {
        alert('Lütfen tüm bilgileri girin!');
        return;
    }

    const orderNumber = 'NES-' + Date.now();
    let total = 0;
    const items = [];

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        items.push({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: itemTotal
        });
    });

    const order = {
        orderNumber: orderNumber,
        date: new Date().toLocaleString('tr-TR'),
        customer: {
            name: name,
            email: email,
            phone: phone
        },
        items: items,
        total: total,
        status: 'Yeni Sipariş'
    };

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Başarı Mesajı Göster
    document.getElementById('orderNumber').textContent = orderNumber;
    document.getElementById('confirmSection').classList.add('hidden');
    document.getElementById('successSection').classList.remove('hidden');

    // Siparişi WhatsApp'a Gönder
    sendToWhatsApp(order);
}

// WHATSAPP'A GÖNDERİ
function sendToWhatsApp(order) {
    let message = `*NES PARFUM - YENİ SİPARİŞ*\n\n`;
    message += `📦 *Sipariş No:* ${order.orderNumber}\n`;
    message += `📅 *Tarih:* ${order.date}\n\n`;
    message += `👤 *Müşteri Bilgisi*\n`;
    message += `Ad: ${order.customer.name}\n`;
    message += `Email: ${order.customer.email}\n`;
    message += `Telefon: ${order.customer.phone}\n\n`;
    message += `📝 *Siparişin İçeriği*\n`;
    
    order.items.forEach(item => {
        message += `• ${item.name} × ${item.quantity} = ₺${item.total.toFixed(2)}\n`;
    });

    message += `\n💰 *TOPLAM: ₺${order.total.toFixed(2)}*\n\n`;
    message += `Siparişi hazırlamak için aşağıdaki linke tıklayın:`;

    const whatsappNumber = '905551234567'; // Kendi numaran ile değiştir
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Otomatik Gönder
    window.open(whatsappLink, '_blank');
}

// GERİ GIT
function goBack() {
    document.getElementById('confirmSection').classList.add('hidden');
    document.getElementById('cartSection').classList.remove('hidden');
}

// YENİ SİPARİŞ
function newOrder() {
    cart = [];
    document.getElementById('successSection').classList.add('hidden');
    document.getElementById('cartSection').classList.add('hidden');
    document.getElementById('confirmSection').classList.add('hidden');
    updateCartCount();
    loadProducts();
}

// ADMIN PANELİ
function toggleAdmin() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.toggle('hidden');
}

// SİPARİŞLERİ GÖRÜNTÜLE (Console'dan)
function viewOrders() {
    console.log('📦 Tüm Siparişler:', orders);
    return orders;
}

// Örnek Ürün Ekle (Başlangıç)
if (products.length === 0) {
    console.log('📢 Ürün eklemek için admin paneli açın (sağ alttaki ⚙️ butonu)');
}