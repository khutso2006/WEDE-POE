/* =========================================================
   ELEVATED STEPS - SNEAKER STORE JAVASCRIPT
   Features:
   1. Active navigation highlighting
   2. Toast notification system
   3. Live product search & instant filtering
   4. Add to cart, LocalStorage sync & cart badge
   5. Shopping cart page rendering & management
   6. Inquiry form validation & dynamic automated response
   7. Contact form validation & email compilation (mailto)
   8. Lightbox image zoom modal
   9. Scroll reveal & button ripple effects
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    console.log("Elevated Steps JavaScript initialized.");

    const CART_KEY = "elevated_steps_cart";
    const DELIVERY_FEE = 150.00; // flat delivery fee in ZAR

    // ==========================================
    // HELPERS
    // ==========================================
    function getCart() {
        try {
            const cart = JSON.parse(localStorage.getItem(CART_KEY));
            return Array.isArray(cart) ? cart : [];
        } catch (err) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function formatRand(amount) {
        return "R " + Number(amount).toFixed(2).replace(".", ",");
    }

    function escapeHTML(value) {
        const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return String(value).replace(/[&<>"']/g, ch => map[ch]);
    }

    // Keyframes used by animations
    if (!document.getElementById("elevated-steps-styles")) {
        const style = document.createElement("style");
        style.id = "elevated-steps-styles";
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
            @keyframes pulseBadge { 0% { transform: scale(1); } 50% { transform: scale(1.25); } 100% { transform: scale(1); } }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // 1. ACTIVE NAVIGATION HIGHLIGHTING
    // ==========================================
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => link.classList.remove("active"));
    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });

    // ==========================================
    // 2. TOAST NOTIFICATION SYSTEM
    // ==========================================
    function showToast(message, type = "success") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.style.cssText = "position:fixed;bottom:25px;right:25px;z-index:9999;display:flex;flex-direction:column;gap:10px;";
            document.body.appendChild(container);
        }

        const colors = { success: "#27ae60", error: "#c0392b", info: "#2563eb" };
        const toast = document.createElement("div");
        toast.style.cssText = `background:${colors[type] || colors.info};color:#fff;padding:12px 22px;border-radius:8px;font-weight:600;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,0.18);opacity:0;transform:translateY(20px);transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        }, 10);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(20px)";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==========================================
    // 3. LIVE PRODUCT SEARCH & INSTANT FILTERING
    // ==========================================
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    function performSearch() {
        if (!searchInput) return;
        const query = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll(".product-card, .product-showcase-card");

        let matchCount = 0;
        cards.forEach(card => {
            const titleEl = card.querySelector("h3, h4");
            const brandEl = card.querySelector(".product-brand");
            const tagEl = card.querySelector(".product-tag");

            const searchableText = [
                titleEl ? titleEl.textContent : "",
                brandEl ? brandEl.textContent : "",
                tagEl ? tagEl.textContent : ""
            ].join(" ").toLowerCase();

            if (query === "" || searchableText.includes(query)) {
                card.style.display = "";
                card.style.animation = "fadeIn 0.4s ease";
                matchCount++;
            } else {
                card.style.display = "none";
            }
        });

        let noResultMsg = document.getElementById("no-results-message");
        if (matchCount === 0 && query !== "") {
            const grid = document.querySelector(".product-grid, .featured-products-grid");
            if (grid) {
                if (!noResultMsg) {
                    noResultMsg = document.createElement("div");
                    noResultMsg.id = "no-results-message";
                    noResultMsg.style.cssText = "text-align:center;padding:40px;font-size:18px;color:#666;grid-column:1/-1;";
                    grid.appendChild(noResultMsg);
                }
                noResultMsg.textContent = `❌ No sneakers found matching "${query}". Try searching for Air Force, Low Dunk, Shox, or New Balance.`;
            }
        } else if (noResultMsg) {
            noResultMsg.remove();
        }
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            performSearch();
        });
        searchInput.addEventListener("input", performSearch);
    }

    // ==========================================
    // 4. ADD TO CART & CART BADGE
    // ==========================================
    function updateCartBadge() {
        const totalItems = getCart().reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
        const cartNav = document.querySelector('nav a[href="cart.html"] span');
        if (cartNav) {
            cartNav.textContent = totalItems > 0 ? `Cart (${totalItems})` : "Cart";
            cartNav.style.animation = "pulseBadge 0.4s ease";
            setTimeout(() => cartNav.style.animation = "", 400);
        }
    }

    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", function () {
            const card = button.closest(".product-card, .product-showcase-card");
            if (!card) return;

            const nameEl = card.querySelector("h3, h4");
            const priceEl = card.querySelector(".product-price");
            const brandEl = card.querySelector(".product-brand");
            const imgEl = card.querySelector("img");
            const sizeSelect = card.querySelector("select");

            const productName = nameEl ? nameEl.textContent.trim() : "Premium Sneaker";
            const productPriceText = priceEl ? priceEl.textContent.trim() : "R1 500,00";
            const productBrand = brandEl ? brandEl.textContent.trim() : "NIKE";
            const productImage = imgEl ? imgEl.getAttribute("src") : "images/Logo.png";
            const productSize = sizeSelect ? sizeSelect.value : "8";

            const numericPrice = parseFloat(
                productPriceText.replace(/[^\d,]/g, "").replace(",", ".")
            ) || 1500.00;

            const cartItem = {
                id: `${productName}-${productSize}`,
                name: productName,
                brand: productBrand,
                image: productImage,
                size: productSize,
                price: numericPrice,
                priceText: productPriceText,
                quantity: 1
            };

            const cart = getCart();
            const existing = cart.find(item => item.id === cartItem.id);

            if (existing) {
                existing.quantity = (Number(existing.quantity) || 1) + 1;
            } else {
                cart.push(cartItem);
            }

            saveCart(cart);
            updateCartBadge();
            showToast(`🛒 Added ${productName} (Size ${productSize}) to cart!`);

            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent;
            }
            button.textContent = "Added ✓";
            button.style.background = "var(--green, #27ae60)";
            button.style.color = "#ffffff";
            button.style.transform = "scale(0.95)";
            setTimeout(() => button.style.transform = "", 150);

            clearTimeout(button._resetTimer);
            button._resetTimer = setTimeout(() => {
                button.textContent = button.dataset.originalText;
                button.style.background = "";
                button.style.color = "";
            }, 1500);
        });
    });

    updateCartBadge();

    // ==========================================
    // 5. SHOPPING CART PAGE RENDERING & MANAGEMENT
    // ==========================================
    const cartItemsSection = document.querySelector(".cart-items-section");

    function updateCartSummary(cart) {
        const summaryBox = document.querySelector(".order-summary-box");
        if (!summaryBox) return;

        const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
        const deliveryFee = cart.length > 0 ? DELIVERY_FEE : 0;
        const discount = 0;
        const total = subtotal + deliveryFee - discount;

        const itemNames = cart.map(item => `${item.name} (x${item.quantity})`);

        const summaryItemsEl = document.getElementById("summary-items");
        if (summaryItemsEl) {
            summaryItemsEl.textContent = itemNames.length > 0 ? itemNames.join(", ") : "No items in cart";
        }

        const deliveryEl = document.getElementById("delivery-fee");
        if (deliveryEl) {
            deliveryEl.textContent = formatRand(deliveryFee);
        }

        const discountEl = document.getElementById("discount-amount");
        if (discountEl) {
            discountEl.textContent = "-" + formatRand(discount);
        }

        const totalEl = document.getElementById("order-total");
        if (totalEl) {
            totalEl.textContent = formatRand(total);
        }
    }

    function renderCartPage() {
        if (!cartItemsSection) return;
        const cart = getCart();

        if (cart.length === 0) {
            cartItemsSection.innerHTML = `
                <div style="text-align:center;padding:50px;background:#fff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.05);animation:fadeIn 0.5s ease;">
                    <h3>Your cart is currently empty 🛒</h3>
                    <p style="color:#666;margin:15px 0 25px;">Explore our collection and add your favorite sneakers to the cart.</p>
                    <a href="product.html" style="background:var(--blue,#2563eb);color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block;transition:transform 0.2s;">Browse Products</a>
                </div>
            `;
            updateCartSummary(cart);
            return;
        }

        let html = "<h3>Items in Cart</h3>";
        cart.forEach((item, index) => {
            const qty = Number(item.quantity) || 1;
            const itemTotal = (Number(item.price) || 0) * qty;
            html += `
                <article class="cart-item-card" data-index="${index}" style="display:flex;align-items:center;gap:20px;background:#fff;padding:15px;border-radius:10px;margin-bottom:15px;box-shadow:0 2px 8px rgba(0,0,0,0.06);animation:fadeIn 0.4s ease;">
                    <div class="cart-img-wrapper" style="width:100px;height:100px;flex-shrink:0;background:#f9f9f9;border-radius:8px;overflow:hidden;">
                        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s ease;">
                    </div>

                    <div class="cart-item-details" style="flex-grow:1;">
                        <h4 class="cart-item-name" style="font-size:16px;font-weight:700;margin-bottom:4px;">${escapeHTML(item.name)}</h4>
                        <p class="cart-item-price" style="color:#555;font-size:14px;margin-bottom:4px;">Price: ${escapeHTML(item.priceText)}</p>
                        <p class="cart-item-size" style="font-size:14px;margin-bottom:8px;">Size: <strong>${escapeHTML(item.size)}</strong></p>

                        <div class="cart-item-inputs" style="display:flex;align-items:center;gap:15px;">
                            <div class="input-group" style="display:flex;align-items:center;gap:6px;">
                                <label for="qty-${index}" style="font-size:13px;font-weight:600;">Qty:</label>
                                <input type="number" id="qty-${index}" class="cart-qty-input" value="${qty}" min="1" data-index="${index}" style="width:60px;padding:4px 8px;border:1px solid #ccc;border-radius:4px;">
                            </div>
                        </div>

                        <p class="cart-item-total" style="font-weight:700;margin-top:6px;color:#111;">Total: ${formatRand(itemTotal)}</p>
                    </div>

                    <button type="button" class="remove-btn" data-index="${index}" style="background:#c0392b;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-weight:600;transition:all 0.2s;">Remove</button>
                </article>
            `;
        });

        cartItemsSection.innerHTML = html;
        updateCartSummary(cart);
    }

    if (cartItemsSection) {
        cartItemsSection.addEventListener("change", function (e) {
            const input = e.target.closest(".cart-qty-input");
            if (!input) return;

            const index = parseInt(input.dataset.index, 10);
            const cart = getCart();
            if (!cart[index]) return;

            let newQty = parseInt(input.value, 10);
            if (isNaN(newQty) || newQty < 1) newQty = 1;

            cart[index].quantity = newQty;
            saveCart(cart);
            renderCartPage();
            updateCartBadge();
            showToast("Cart updated successfully!");
        });

        cartItemsSection.addEventListener("click", function (e) {
            const btn = e.target.closest(".remove-btn");
            if (!btn) return;

            const index = parseInt(btn.dataset.index, 10);
            const cart = getCart();
            if (!cart[index]) return;

            const removed = cart.splice(index, 1)[0];
            saveCart(cart);
            renderCartPage();
            updateCartBadge();
            showToast(`Removed ${removed.name} from cart.`, "info");
        });

        renderCartPage();
    }

    // ==========================================
    // 6. INQUIRY FORM VALIDATION & DYNAMIC AUTOMATED RESPONSE (`enquiry.html`)
    // ==========================================
    const enquiryForm = document.querySelector(".inquiry-form");

    if (enquiryForm) {
        enquiryForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("user-name")?.value.trim();
            const email = document.getElementById("user-email")?.value.trim();
            const topic = document.getElementById("enquiry-topic")?.value;
            const message = document.getElementById("user-message")?.value.trim();

            if (!name || !email || !message) {
                showToast("Please fill in all required fields.", "error");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showToast("Please enter a valid email address.", "error");
                return;
            }

            // Post-Validation Action: Return tailored response regarding costs, availability, or organization details
            const responseBox = document.getElementById("enquiry-response-box");
            const responseText = document.getElementById("enquiry-response-text");

            let replyDetails = "";
            switch (topic) {
                case "product":
                    replyDetails = `Thank you ${name}! Regarding sneaker pricing, our Nike Low Dunk models range from R1 450,00, Air Force 1 from R1 600,00, and Shox from R1 900,00. All prices include quality assurance.`;
                    break;
                case "availability":
                    replyDetails = `Thank you ${name}! Stock is currently available across sizes 3 to 10 in our Botlokwa Plaza store and online catalog. Orders ship within 2-3 business days.`;
                    break;
                case "delivery":
                    replyDetails = `Thank you ${name}! Standard flat-rate delivery is R150,00 nationwide across South Africa. Free delivery applies to orders over R3 000,00.`;
                    break;
                case "volunteer":
                    replyDetails = `Thank you ${name} for your interest in volunteering or sponsoring Elevated Steps! Our community outreach and partnership coordinator will reach out to ${email} within 24 hours.`;
                    break;
                default:
                    replyDetails = `Thank you ${name}! We have received your inquiry and will reply to ${email} shortly.`;
            }

            if (responseText && responseBox) {
                responseText.textContent = replyDetails;
                responseBox.style.display = "block";
                responseBox.style.animation = "fadeIn 0.5s ease";
            }

            showToast(`Inquiry successfully validated and processed for ${name}!`);
            enquiryForm.reset();
        });
    }

    // ==========================================
    // 7. CONTACT FORM VALIDATION & EMAIL COMPILATION (`contact.html`)
    // ==========================================
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("contact-name")?.value.trim();
            const email = document.getElementById("contact-email")?.value.trim();
            const type = document.getElementById("contact-type")?.value;
            const message = document.getElementById("contact-message")?.value.trim();

            if (!name || !email || !message) {
                showToast("Please fill in all required fields.", "error");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showToast("Please enter a valid email address.", "error");
                return;
            }

            // Post-Validation Action: Compile into an email format (mailto:)
            const recipient = "elevatedsteps@gmail.com";
            const subject = encodeURIComponent(`[${type}] Message from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nMessage Type: ${type}\n\nMessage:\n${message}`);

            showToast("Compiling email message... Opening mail client.");
            
            setTimeout(() => {
                window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
            }, 800);
        });
    }

    // ==========================================
    // 8. LIGHTBOX IMAGE ZOOM MODAL
    // ==========================================
    function openLightbox(src, alt) {
        const overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:10000;cursor:pointer;animation:fadeIn 0.3s ease;";

        const modalImg = document.createElement("img");
        modalImg.src = src;
        modalImg.alt = alt || "";
        modalImg.style.cssText = "max-width:85%;max-height:85%;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);object-fit:contain;background:#fff;padding:10px;transform:scale(0.9);transition:transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);";

        overlay.appendChild(modalImg);
        document.body.appendChild(overlay);

        setTimeout(() => modalImg.style.transform = "scale(1)", 10);

        function close() {
            overlay.style.opacity = "0";
            setTimeout(() => overlay.remove(), 250);
            document.removeEventListener("keydown", onKey);
        }
        function onKey(e) {
            if (e.key === "Escape") close();
        }

        overlay.addEventListener("click", close);
        document.addEventListener("keydown", onKey);
    }

    document.querySelectorAll(".product-card img, .product-showcase-card img").forEach(img => {
        img.style.cursor = "pointer";
        img.title = "Click to zoom image";
        img.addEventListener("click", () => openLightbox(img.src, img.alt));
    });

    // ==========================================
    // 9. DYNAMIC MOTION & RIPPLE EFFECTS
    // ==========================================
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".product-card, .product-showcase-card, .contact-card, .form-section, .cart-item-card").forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(25px)";
        el.style.transition = "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
        observer.observe(el);
    });

    // Button Click Ripple Effect
    document.querySelectorAll("button, .view-more-btn, nav a").forEach(btn => {
        btn.addEventListener("click", function (e) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement("span");
            ripple.style.cssText = `position:absolute;top:${y}px;left:${x}px;width:0;height:0;background:rgba(255,255,255,0.4);border-radius:50%;transform:translate(-50%, -50%);pointer-events:none;transition:width 0.4s ease-out, height 0.4s ease-out, opacity 0.4s ease-out;`;
            
            if (getComputedStyle(btn).position === "static") {
                btn.style.position = "relative";
            }
            btn.style.overflow = "hidden";
            btn.appendChild(ripple);

            setTimeout(() => {
                ripple.style.width = "180px";
                ripple.style.height = "180px";
                ripple.style.opacity = "0";
            }, 10);

            setTimeout(() => ripple.remove(), 400);
        });
    });
});
