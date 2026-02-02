/*==================== 
    BUNGA BALI - TOKO BUNGA PREMIUM
    Interactive JavaScript
====================*/

/*==================== NOTIFICATION SYSTEM (GLOBAL) ====================*/
window.showNotification = function(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i class="uil ${type === 'success' ? 'uil-check-circle' : 'uil-info-circle'}"></i>
        <span>${message}</span>
    `;

    // Notification styles
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: ${type === 'success' ? '#4CAF50' : '#c9a87c'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 9999;
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    /*==================== NAVIGATION ====================*/
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');
    const cartBtn = document.getElementById('cart-btn'); // Added declaration

    // Show mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    }

    // Hide mobile menu
    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show');
            document.body.style.overflow = '';
        });
    });

    /*==================== HEADER SCROLL ====================*/
    const header = document.getElementById('header');
    const scrollTop = document.getElementById('scroll-top');
    const whatsappFloat = document.getElementById('whatsapp-float');

    function handleScroll() {
        // Header background on scroll
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Scroll to top button
        if (scrollTop) {
            if (window.scrollY > 400) {
                scrollTop.classList.add('show');
            } else {
                scrollTop.classList.remove('show');
            }
        }
    }

    window.addEventListener('scroll', handleScroll);

    /*==================== ACTIVE NAV LINK ON SCROLL ====================*/
    const sections = document.querySelectorAll('section[id]');

    function scrollActiveLink() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav__link[href*="${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }

    window.addEventListener('scroll', scrollActiveLink);

    /*==================== SCROLL REVEAL ANIMATION ====================*/
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        const windowHeight = window.innerHeight;

        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const revealPoint = 150;

            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    /*==================== TESTIMONIALS SLIDER ====================*/
    const testimonials = [
        {
            text: "Bunga Bali sangat membantu untuk persiapan pernikahan adat saya! Rangkaiannya cantik sekali dan sesuai dengan tema upacara. Pengiriman tepat waktu dan tim-nya sangat ramah. Terima kasih Bunga Bali! 🙏",
            name: "Ni Kadek Ayu",
            role: "Denpasar",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            text: "Pesan bunga untuk ulang tahun istri, hasilnya melebihi ekspektasi! Bunga segar, wangi, dan packagingnya cantik banget. Istri saya sangat senang. Pasti order lagi! ⭐⭐⭐⭐⭐",
            name: "I Made Arya",
            role: "Badung",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            text: "Untuk keperluan odalan di pura, kami selalu pesan di Bunga Bali. Kualitasnya konsisten bagus dan harganya reasonable. Florist terpercaya di Bali!",
            name: "Ni Luh Sari",
            role: "Gianyar",
            avatar: "https://randomuser.me/api/portraits/women/68.jpg"
        },
        {
            text: "Baru pertama kali order dan langsung puas! Respon WhatsApp cepat, konsultasi gratis, dan bunga datang dalam kondisi sempurna. Recommended banget! 💐",
            name: "Gede Putra",
            role: "Tabanan",
            avatar: "https://randomuser.me/api/portraits/men/45.jpg"
        }
    ];

    let currentTestimonial = 0;
    const testimonialContent = document.getElementById('testimonial-content');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    function updateTestimonial(index) {
        if (!testimonialContent) return;

        const testimonial = testimonials[index];
        testimonialContent.style.opacity = '0';
        testimonialContent.style.transform = 'translateY(20px)';

        setTimeout(() => {
            testimonialContent.innerHTML = `
                <p class="testimonial__text">"${testimonial.text}"</p>
                <div class="testimonial__author">
                    <img src="${testimonial.avatar}" alt="${testimonial.name}" class="testimonial__avatar">
                    <div class="testimonial__info">
                        <h4>${testimonial.name}</h4>
                        <span>${testimonial.role}</span>
                    </div>
                </div>
            `;
            testimonialContent.style.opacity = '1';
            testimonialContent.style.transform = 'translateY(0)';
        }, 300);
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
            updateTestimonial(currentTestimonial);
        });

        nextBtn.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            updateTestimonial(currentTestimonial);
        });

        // Auto-rotate testimonials
        setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            updateTestimonial(currentTestimonial);
        }, 6000);
    }

    /*==================== PRODUCT INTERACTIONS ====================*/
    const productActions = document.querySelectorAll('.product__action');
    const cartCountEl = document.querySelector('.nav__cart-count');
    let cartCount = 0;

    async function syncCartCount() {
        if (!currentUser) return;
        try {
            const response = await fetch('/api/cart');
            const result = await response.json();
            if (result.success) {
                cartCount = result.data.reduce((acc, item) => acc + item.quantity, 0);
                if (cartCountEl) cartCountEl.textContent = cartCount;
            }
        } catch (e) { console.error('Error syncing cart:', e); }
    }

    productActions.forEach(action => {
        action.addEventListener('click', async (e) => {
            e.preventDefault();
            const card = action.closest('.product__card');
            const productId = card.dataset.productId || 1; // Assuming data-product-id exists or fallback
            const icon = action.querySelector('i');

            // Add to cart
            if (icon.classList.contains('uil-shopping-bag')) {
                if (!currentUser) {
                    showNotification('Silakan login untuk belanja! 🛒', 'info');
                    return setTimeout(() => window.location.href = '/api/auth/login', 1500);
                }

                try {
                    const response = await fetch('/api/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId, quantity: 1 })
                    });
                    const result = await response.json();
                    if (result.success) {
                        cartCount++;
                        if (cartCountEl) {
                            cartCountEl.textContent = cartCount;
                            cartCountEl.style.transform = 'scale(1.3)';
                            setTimeout(() => cartCountEl.style.transform = 'scale(1)', 200);
                        }
                        showNotification('Berhasil ditambahkan ke keranjang! 🛒', 'success');
                    }
                } catch (err) { showNotification('Gagal menambahkan ke keranjang', 'error'); }
            }

            // Add to wishlist
            if (icon.classList.contains('uil-heart')) {
                if (!currentUser) {
                    showNotification('Silakan login untuk wishlist! ❤️', 'info');
                    return setTimeout(() => window.location.href = '/api/auth/login', 1500);
                }

                const isAdding = icon.classList.contains('uil-heart');
                try {
                    const method = isAdding ? 'POST' : 'DELETE';
                    const url = isAdding ? '/api/wishlist' : `/api/wishlist/${productId}`;
                    const response = await fetch(url, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: isAdding ? JSON.stringify({ productId }) : null
                    });
                    const result = await response.json();
                    
                    if (result.success) {
                        icon.classList.toggle('uil-heart');
                        icon.classList.toggle('uis-heart');
                        action.style.background = icon.classList.contains('uis-heart') ? 'var(--primary)' : '#fff';
                        action.style.color = icon.classList.contains('uis-heart') ? '#fff' : '#1a1a1a';
                        showNotification(isAdding ? 'Ditambahkan ke wishlist! ❤️' : 'Dihapus dari wishlist', 'info');
                    }
                } catch (err) { showNotification('Gagal memperbarui wishlist', 'error'); }
            }

            // Quick view
            if (icon.classList.contains('uil-eye')) {
                showNotification('Fitur Quick View segera hadir!', 'info');
            }
        });
    });


    /*==================== NEWSLETTER FORM ====================*/
    const newsletterForm = document.getElementById('newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('.newsletter__input');

            if (input.value) {
                showNotification('Terima kasih telah berlangganan! 🎉', 'success');
                input.value = '';
            }
        });
    }

    /*==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================*/
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /*==================== PARALLAX EFFECT ON HERO ====================*/
    const heroImg = document.querySelector('.hero__img');

    if (heroImg) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < 800) {
                heroImg.style.transform = `translateY(${scrollY * 0.1}px)`;
            }
        });
    }

    /*==================== CART BUTTON INTERACTION ====================*/
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            if (cartCount === 0) {
                showNotification('Keranjang Anda masih kosong. Yuk belanja! 🛒', 'info');
            } else {
                showNotification(`Anda memiliki ${cartCount} item di keranjang`, 'info');
            }
        });
    }

    /*==================== SEARCH BUTTON ====================*/
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            showNotification('Fitur pencarian segera hadir!', 'info');
        });
    }

    /*==================== CATEGORY PILLS ====================*/
    // Category pills now have direct WhatsApp links, no need for click handler

    /*==================== FORMAT RUPIAH (UTILITY) ====================*/
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    }

    /*==================== INITIALIZE ====================*/
    console.log('🌺 Bunga Bali - Website Loaded Successfully!');
    console.log('📍 Melayani seluruh wilayah Bali');
});

/*==================== ORDER PRODUCT FUNCTION ====================*/
// This function is called when clicking on a product card
function orderProduct(element) {
    const productName = element.dataset.product;
    const productPrice = element.dataset.price;

    // Format the price for display
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(productPrice);

    // Create WhatsApp message
    const message = `Halo Bunga Bali! 🌺\n\nSaya tertarik dengan produk:\n📦 *${productName}*\n💰 Harga: ${formattedPrice}\n\nBoleh minta info lebih lanjut?`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // WhatsApp number (Indonesia format)
    const waNumber = '6287867439014';

    // Open WhatsApp
    window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
}

/*==================== AUTHENTICATION LOGIC ====================*/
// Modal functions removed as auth is now a dedicated page

// Close history modal when clicking outside
window.onclick = function (event) {
    const historyModal = document.getElementById('history-modal');
    if (event.target == historyModal) closeHistoryModal();
}

// Auth State
let currentUser = null;

async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me');
        const result = await response.json();

        if (result.success) {
            currentUser = result.data;
            updateAuthUI(true);
            syncCartCount();
        } else {
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Auth check user error:', error);
    }
}

function updateAuthUI(isLoggedIn) {
    const authNav = document.getElementById('auth-nav-item');
    const userNav = document.getElementById('user-nav-item');
    const userName = document.getElementById('user-name');

    if (isLoggedIn && currentUser) {
        if (authNav) authNav.style.display = 'none';
        if (userNav) userNav.style.display = 'block';
        if (userName) userName.textContent = currentUser.name.split(' ')[0]; // Show first name
    } else {
        if (authNav) authNav.style.display = 'block';
        if (userNav) userNav.style.display = 'none';
    }
}

// User Dropdown Toggle
const userMenuBtn = document.getElementById('user-menu-btn');
const userMenu = document.getElementById('user-menu');

if (userMenuBtn && userMenu) {
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
        userMenu.classList.remove('show');
    });
}

// Profile and Wishlist Navigation
function openProfile() {
    window.location.href = '/customer/profile';
}

function openWishlist() {
    // Scroll to products and show wishlist or open modal/page
    // For now let's assume it's a separate section or page
    showNotification('Halaman Wishlist sedang dikembangkan!', 'info');
}

// Authentication is now handled on the dedicated login page (/auth/login)

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        updateAuthUI(false);
        showNotification('Logout berhasil. Sampai jumpa! 👋', 'info');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Order History
function openHistoryModal() {
    document.getElementById('history-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    fetchOrderHistory();
}

function closeHistoryModal() {
    document.getElementById('history-modal').classList.remove('active');
    document.body.style.overflow = '';
}

function openOrderHistory() {
    openHistoryModal();
}

async function fetchOrderHistory() {
    const listContainer = document.getElementById('order-history-list');
    listContainer.innerHTML = '<p style="text-align: center;">Memuat riwayat...</p>';

    try {
        const response = await fetch('/api/orders/my-orders');
        const result = await response.json();

        if (result.success) {
            if (result.data.length === 0) {
                listContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="uil uil-shopping-bag" style="font-size: 3rem; color: var(--text-color-light);"></i>
                        <p style="margin-top: 1rem;">Belum ada pesanan.</p>
                        <a href="#products" onclick="closeHistoryModal()" class="button button--small" style="margin-top: 1rem;">Belanja Sekarang</a>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = result.data.map(order => `
                <div class="history__item">
                    <div class="history__header">
                        <span>#${order.order_number}</span>
                        <span>Rp ${order.total_amount.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="history__details">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span>${new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <span class="status-badge status-${order.status}">${order.status}</span>
                        </div>
                        <ul class="history__products" style="list-style: none; padding-left: 0;">
                            ${order.items.map(item => `
                                <li>${item.quantity}x ${item.product_name}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `).join('');
        } else {
            listContainer.innerHTML = '<p style="text-align: center;">Gagal memuat riwayat.</p>';
        }
    } catch (error) {
        listContainer.innerHTML = '<p style="text-align: center;">Terjadi kesalahan.</p>';
    }
}

    // Initialize Auth
    document.addEventListener('DOMContentLoaded', () => {
        checkAuth();
    });
