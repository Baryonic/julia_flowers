// Julia Flowers site scripts

(function () {
	// Year in footer
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	// Houseplant and accessory image navigation
	const houseplantImages = [
		'monstera_deliciosa.png',
		'peace_lily.png',
		'snake_plant.png',
		'lavender_dream.png',
		'rose_bliss.png',
		'sunny_daisies.png'
	];
	const accessoryImages = [
		'glass_vase.png',
		'plant_mister.png',
		'pruning_shears.png'
	];

	let houseplantIdx = 0;
	let accessoryIdx = 0;

	const houseplantImg = document.getElementById('houseplant-img');
	const houseplantPrev = document.getElementById('houseplant-prev');
	const houseplantNext = document.getElementById('houseplant-next');

	const accessoryImg = document.getElementById('accessory-img');
	const accessoryPrev = document.getElementById('accessory-prev');
	const accessoryNext = document.getElementById('accessory-next');

	// Fade transition image swap with simple guard and preload
	function swapImageWithFade(imgEl, newSrc) {
		if (!imgEl) return;
		const fullSrc = 'images/' + newSrc;
		if (imgEl.getAttribute('src') === fullSrc) return;
		if (imgEl.dataset.animating === '1') return;
		imgEl.dataset.animating = '1';

		const pre = new Image();
		pre.onload = () => {
			const onEnd = () => {
				imgEl.removeEventListener('transitionend', onEnd);
				imgEl.setAttribute('src', fullSrc);
				// Next frame: fade back in
				requestAnimationFrame(() => {
					imgEl.classList.remove('is-fading');
					imgEl.dataset.animating = '0';
				});
			};
			imgEl.addEventListener('transitionend', onEnd);
			// Start fade out
			imgEl.classList.add('is-fading');
		};
		pre.src = fullSrc;
	}

	function updateHouseplantImg() {
		swapImageWithFade(houseplantImg, houseplantImages[houseplantIdx]);
	}
	function updateAccessoryImg() {
		swapImageWithFade(accessoryImg, accessoryImages[accessoryIdx]);
	}

	houseplantPrev?.addEventListener('click', function () {
		houseplantIdx = (houseplantIdx - 1 + houseplantImages.length) % houseplantImages.length;
		updateHouseplantImg();
	});
	houseplantNext?.addEventListener('click', function () {
		houseplantIdx = (houseplantIdx + 1) % houseplantImages.length;
		updateHouseplantImg();
	});

	accessoryPrev?.addEventListener('click', function () {
		accessoryIdx = (accessoryIdx - 1 + accessoryImages.length) % accessoryImages.length;
		updateAccessoryImg();
	});
	accessoryNext?.addEventListener('click', function () {
		accessoryIdx = (accessoryIdx + 1) % accessoryImages.length;
		updateAccessoryImg();
	});

	// Initialize: add fade class and set initial images
	houseplantImg?.classList.add('img-fade');
	accessoryImg?.classList.add('img-fade');
	updateHouseplantImg();
	updateAccessoryImg();

	// Auto-advance every 5 seconds
	const AUTO_MS = 5000;
	if (houseplantImg) {
		setInterval(() => {
			houseplantIdx = (houseplantIdx + 1) % houseplantImages.length;
			updateHouseplantImg();
		}, AUTO_MS);
	}
	if (accessoryImg) {
		setInterval(() => {
			accessoryIdx = (accessoryIdx + 1) % accessoryImages.length;
			updateAccessoryImg();
		}, AUTO_MS);
	}

	// Active nav highlighting
	const path = location.pathname.replace(/\\/g, '/');
	document.querySelectorAll('.navbar .nav-link').forEach((link) => {
		const href = link.getAttribute('href');
		if (!href) return;
		const normalized = new URL(href, location.origin).pathname.replace(/\\/g, '/');
		if (path.endsWith(normalized)) {
			link.classList.add('active');
		}
	});

	// Products: search + filter
	const form = document.getElementById('productSearchForm');
	const input = document.getElementById('productSearchInput');
	const category = document.getElementById('categoryFilter');
	const list = document.getElementById('productList');
	const applyFilters = () => {
		if (!list) return;
		const q = (input?.value || '').trim().toLowerCase();
		const c = (category?.value || 'all');
		list.querySelectorAll('.col').forEach((item) => {
			const title = (item.getAttribute('data-title') || '').toLowerCase();
			const cat = item.getAttribute('data-category') || 'all';
			const matchesText = q ? title.includes(q) : true;
			const matchesCat = c === 'all' ? true : cat === c;
			item.classList.toggle('d-none', !(matchesText && matchesCat));
		});
	};
	if (form) {
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			applyFilters();
		});
		input?.addEventListener('input', applyFilters);
		category?.addEventListener('change', applyFilters);
	}

	// Contact form: simple validation + toast
	const contactForm = document.getElementById('contactForm');
	const toastEl = document.getElementById('contactToast');
	if (contactForm) {
		contactForm.addEventListener('submit', (e) => {
			e.preventDefault();
			if (!contactForm.checkValidity()) {
				contactForm.classList.add('was-validated');
				return;
			}
			// Show toast
			if (toastEl && window.bootstrap) {
				const toast = new window.bootstrap.Toast(toastEl);
				toast.show();
			} else {
				alert('Thanks! Your message has been sent.');
			}
			contactForm.reset();
			contactForm.classList.remove('was-validated');
		});
	}

		// Cart utilities
		const CART_KEY = 'jf_cart_v1';
		const readCart = () => {
			try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
		};
		const writeCart = (items) => {
			localStorage.setItem(CART_KEY, JSON.stringify(items));
			updateCartBadge();
		};
		const updateCartBadge = () => {
			const countEl = document.getElementById('cart-count');
			if (!countEl) return;
			const items = readCart();
			const totalQty = items.reduce((sum, it) => sum + (it.qty || 1), 0);
			countEl.textContent = String(totalQty);
		};
		updateCartBadge();

		// Add to cart buttons
		document.querySelectorAll('.add-to-cart').forEach((btn) => {
			btn.addEventListener('click', () => {
				const id = btn.getAttribute('data-id');
				const title = btn.getAttribute('data-title');
				const price = Number(btn.getAttribute('data-price') || '0');
				const image = btn.getAttribute('data-image');
				if (!id || !title) return;
				const items = readCart();
				const idx = items.findIndex((i) => i.id === id);
				if (idx >= 0) items[idx].qty = (items[idx].qty || 1) + 1;
				else items.push({ id, title, price, image, qty: 1 });
				writeCart(items);
				// Button feedback
				btn.disabled = true;
				const original = btn.textContent;
				btn.textContent = 'Added!';
				setTimeout(() => { btn.disabled = false; btn.textContent = original; }, 800);
			});
		});

		// Cart page rendering
		const cartContainer = document.getElementById('cartContainer');
		const cartTotalEl = document.getElementById('cartTotal');
		const clearCartBtn = document.getElementById('clearCartBtn');
		const checkoutBtn = document.getElementById('checkoutBtn');

		const renderCart = () => {
			if (!cartContainer) return;
			const items = readCart();
			cartContainer.innerHTML = '';
			if (!items.length) {
				cartContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">Your cart is empty.</div></div>';
				if (cartTotalEl) cartTotalEl.textContent = '$0';
				return;
			}
			let total = 0;
			items.forEach((it, i) => {
				const line = it.price * (it.qty || 1);
				total += line;
				const col = document.createElement('div');
				col.className = 'col-12';
				col.innerHTML = `
					<div class="card shadow-sm">
						<div class="card-body d-flex gap-3 align-items-center">
							<img src="${it.image || ''}" alt="${it.title}" class="rounded object-fit-cover" style="width:80px;height:80px;" />
							<div class="flex-grow-1">
								<div class="fw-semibold">${it.title}</div>
								<div class="text-secondary small">$${it.price.toFixed(2)} each</div>
							</div>
							<div class="input-group" style="width: 140px;">
								<button class="btn btn-outline-secondary btn-sm" data-action="dec" data-index="${i}">-</button>
								<input type="text" class="form-control form-control-sm text-center" value="${it.qty || 1}" aria-label="Quantity" data-index="${i}" />
								<button class="btn btn-outline-secondary btn-sm" data-action="inc" data-index="${i}">+</button>
							</div>
							<div class="fw-bold" style="width:90px; text-align:right;">$${line.toFixed(2)}</div>
							<button class="btn btn-outline-danger btn-sm" data-action="remove" data-index="${i}">Remove</button>
						</div>
					</div>`;
				cartContainer.appendChild(col);
			});
			if (cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;
		};
		renderCart();

		// Cart events (delegated)
		if (cartContainer) {
			cartContainer.addEventListener('click', (e) => {
				const t = e.target;
				if (!(t instanceof Element)) return;
				const action = t.getAttribute('data-action');
				const index = Number(t.getAttribute('data-index'));
				if (!Number.isFinite(index)) return;
				const items = readCart();
				if (!items[index]) return;
				if (action === 'remove') {
					items.splice(index, 1);
				} else if (action === 'inc') {
					items[index].qty = (items[index].qty || 1) + 1;
				} else if (action === 'dec') {
					items[index].qty = Math.max(1, (items[index].qty || 1) - 1);
				}
				writeCart(items);
				renderCart();
			});
			cartContainer.addEventListener('change', (e) => {
				const t = e.target;
				if (!(t instanceof HTMLInputElement)) return;
				const index = Number(t.getAttribute('data-index'));
				if (!Number.isFinite(index)) return;
				const qty = Math.max(1, parseInt(t.value || '1', 10) || 1);
				const items = readCart();
				if (!items[index]) return;
				items[index].qty = qty;
				writeCart(items);
				renderCart();
			});
		}

		clearCartBtn?.addEventListener('click', () => {
			writeCart([]);
			renderCart();
		});

		checkoutBtn?.addEventListener('click', () => {
			const items = readCart();
			if (!items.length) return;
			alert('This is a demo checkout. Implement payment later.');
		});
})();
