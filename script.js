document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                // Handle non-hash links like admin login
                window.location.href = targetId;
            }
        });
    });

    // Handle order modal
    const orderModal = document.getElementById('order-modal');
    const closeButton = orderModal.querySelector('.close-button');
    const orderButtons = document.querySelectorAll('.order-btn');
    const modalProductName = document.getElementById('modal-product-name');
    const modalProductPrice = document.getElementById('modal-product-price');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const cancelOrderBtn = document.getElementById('cancel-order-btn');
    const paymentOptionsContainer = document.getElementById('modal-step-2');
    const paymentButtons = paymentOptionsContainer.querySelectorAll('.payment-btn');
    const paymentProcessContainer = document.getElementById('modal-step-3');
    const paymentInstruction = document.getElementById('payment-instruction');
    const qrCodeDisplay = document.getElementById('qr-code-display');
    const downloadQrBtn = document.getElementById('download-qr-btn');
    const paymentStatusMessage = document.getElementById('payment-status-message');
    const checkPaymentBtn = document.getElementById('check-payment-btn');
    const failedPaymentBtn = document.getElementById('failed-payment-btn');
    const finalStatusContainer = document.getElementById('modal-step-4');
    const finalStatusTitle = document.getElementById('final-status-title');
    const finalStatusMessage = document.getElementById('final-status-message');
    const transferDetailsArea = document.getElementById('transfer-details-area');
    const transferDetailsOutput = document.getElementById('transfer-details-output');
    const printReceiptBtn = document.getElementById('print-receipt-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const loadingSpinner = orderModal.querySelector('.loading-spinner');

    const backToStep1Btn = document.getElementById('back-to-step-1');
    const backToStep2Btn = document.getElementById('back-to-step-2');

    let currentProduct = null;
    let paymentCheckInterval = null; // Interval for simulating payment status check
    let currentPaymentMethod = null;

    const showStep = (stepNumber) => {
        document.querySelectorAll('[id^="modal-step-"]').forEach(step => {
            step.style.display = 'none';
            step.classList.remove('fade-in'); // Remove animation class for smooth transitions
        });
        document.getElementById(`modal-step-${stepNumber}`).style.display = 'block';
        document.getElementById(`modal-step-${stepNumber}`).classList.add('fade-in'); // Add animation
        
        // Hide spinner by default unless needed
        loadingSpinner.classList.remove('active');
        qrCodeDisplay.style.display = 'none';
        downloadQrBtn.style.display = 'none';
        paymentStatusMessage.textContent = '';
        paymentStatusMessage.classList.remove('success', 'error');

        // Clear any ongoing payment checks
        clearInterval(paymentCheckInterval);
    };

    const resetModal = () => {
        orderModal.classList.remove('active');
        setTimeout(() => {
            orderModal.style.display = 'none'; // Hide completely after animation
            showStep(1); // Always go back to step 1
        }, 300); // Wait for fade-out animation
    };

    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentProduct = {
                id: this.dataset.productId,
                name: this.dataset.productName,
                price: this.dataset.productPrice
            };
            modalProductName.textContent = currentProduct.name;
            modalProductPrice.textContent = currentProduct.price;
            orderModal.style.display = 'flex'; // Display flex to center
            setTimeout(() => orderModal.classList.add('active'), 10); // Trigger fade-in
            showStep(1);
        });
    });

    closeButton.addEventListener('click', resetModal);
    closeModalBtn.addEventListener('click', resetModal);
    window.addEventListener('click', (event) => {
        if (event.target === orderModal) {
            resetModal();
        }
    });

    confirmOrderBtn.addEventListener('click', () => {
        showStep(2);
    });

    cancelOrderBtn.addEventListener('click', () => {
        alert('Pesanan dibatalkan.');
        resetModal();
    });

    backToStep1Btn.addEventListener('click', () => showStep(1));
    backToStep2Btn.addEventListener('click', () => showStep(2));

    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentPaymentMethod = this.dataset.payment;
            showStep(3);
            paymentInstruction.textContent = `Menyiapkan detail pembayaran untuk ${currentProduct.name} melalui ${currentPaymentMethod.toUpperCase()}...`;
            loadingSpinner.classList.add('active'); // Show spinner for process effect

            // Simulate API call to get QR/payment details
            setTimeout(() => {
                loadingSpinner.classList.remove('active');
                let qrData = '';
                let instText = '';
                let transferDetailFormat = '';

                switch (currentPaymentMethod) {
                    case 'dana':
                        qrData = `PAY:DANA_ANNASSHCOLLITE_${currentProduct.price.replace(/\D/g,'')}`;
                        instText = `Scan QR ini dengan aplikasi DANA atau transfer ke nomor DANA: +6281234567890 (Annasshcollite).`;
                        transferDetailFormat = `
Metode Pembayaran: DANA
Jumlah: ${currentProduct.price}
Nomor Tujuan: +6281234567890
Nama Penerima: Annasshcollite Official
Status: Menunggu Konfirmasi
Tanggal: ${new Date().toLocaleDateString()}
Waktu: ${new Date().toLocaleTimeString()}
`;
                        break;
                    case 'ovo':
                        qrData = `PAY:OVO_ANNASSHCOLLITE_${currentProduct.price.replace(/\D/g,'')}`;
                        instText = `Scan QR ini dengan aplikasi OVO atau transfer ke nomor OVO: +6289876543210 (Annasshcollite).`;
                        transferDetailFormat = `
Metode Pembayaran: OVO
Jumlah: ${currentProduct.price}
Nomor Tujuan: +6289876543210
Nama Penerima: Annasshcollite Official
Status: Menunggu Konfirmasi
Tanggal: ${new Date().toLocaleDateString()}
Waktu: ${new Date().toLocaleTimeString()}
`;
                        break;
                    case 'gopay':
                        qrData = `PAY:GOPAY_ANNASSHCOLLITE_${currentProduct.price.replace(/\D/g,'')}`;
                        instText = `Scan QR ini dengan aplikasi GoPay atau transfer ke nomor GoPay: +6287654321098 (Annasshcollite).`;
                        transferDetailFormat = `
Metode Pembayaran: GoPay
Jumlah: ${currentProduct.price}
Nomor Tujuan: +6287654321098
Nama Penerima: Annasshcollite Official
Status: Menunggu Konfirmasi
Tanggal: ${new Date().toLocaleDateString()}
Waktu: ${new Date().toLocaleTimeString()}
`;
                        break;
                    case 'qris':
                        qrData = `QRIS_PAYMENT_SIMULATION_ANNASSHCOLLITE_${currentProduct.price.replace(/\D/g,'')}_ORDER_${currentProduct.id}`;
                        instText = `Scan QRIS ini dengan aplikasi pembayaran (DANA, OVO, GoPay, LinkAja, dll.).`;
                        transferDetailFormat = `
Metode Pembayaran: QRIS (Universal)
Jumlah: ${currentProduct.price}
Merchant ID: ANNSCHOLITE_QRIS_MERCH
Status: Menunggu Konfirmasi
Tanggal: ${new Date().toLocaleDateString()}
Waktu: ${new Date().toLocaleTimeString()}
`;
                        break;
                }

                qrCodeDisplay.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
                qrCodeDisplay.style.display = 'block';
                downloadQrBtn.style.display = 'block';
                paymentInstruction.textContent = instText;
                paymentStatusMessage.textContent = "Menunggu pembayaran Anda...";
                paymentStatusMessage.classList.add('status-message');

                // Simulate payment check
                startPaymentCheck(transferDetailFormat);

            }, 1500); // Simulate network delay for QR generation
        });
    });

    downloadQrBtn.addEventListener('click', () => {
        const qrImage = qrCodeDisplay.src;
        if (qrImage) {
            const a = document.createElement('a');
            a.href = qrImage;
            a.download = `Annasshcollite_${currentPaymentMethod}_QR_Payment_${currentProduct.id}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert('QR Code belum tersedia.');
        }
    });

    const startPaymentCheck = (transferDetailFormat) => {
        clearInterval(paymentCheckInterval); // Clear any existing interval
        paymentCheckInterval = setInterval(() => {
            console.log("Checking payment status...");
            // In a real app, this would be an AJAX call to your backend to check payment gateway status
            const isSuccess = Math.random() > 0.7; // 30% chance of success per check

            if (isSuccess) {
                clearInterval(paymentCheckInterval);
                showPaymentSuccess(transferDetailFormat);
            } else {
                paymentStatusMessage.textContent = "Pembayaran belum terdeteksi. Silakan pastikan Anda sudah melakukan transfer.";
                paymentStatusMessage.classList.remove('success', 'error');
            }
        }, 5000); // Check every 5 seconds
    };

    checkPaymentBtn.addEventListener('click', () => {
        paymentStatusMessage.textContent = "Memeriksa status pembayaran secara manual...";
        paymentStatusMessage.classList.remove('success', 'error');
        // Simulate immediate check
        setTimeout(() => {
            const isSuccess = Math.random() > 0.5; // Higher chance on manual check
            if (isSuccess) {
                clearInterval(paymentCheckInterval);
                // Placeholder transfer details, would be from backend in real app
                const tempTransferDetails = `
Pembayaran Berhasil!
Produk: ${currentProduct.name}
Jumlah: ${currentProduct.price}
Metode: ${currentPaymentMethod.toUpperCase()}
Status: Lunas
ID Transaksi: TRX${Date.now()}
`;
                showPaymentSuccess(tempTransferDetails);
            } else {
                paymentStatusMessage.textContent = "Pembayaran belum terdeteksi. Mohon cek kembali status transfer Anda.";
                paymentStatusMessage.classList.add('error');
            }
        }, 1500);
    });

    failedPaymentBtn.addEventListener('click', () => {
        clearInterval(paymentCheckInterval); // Stop automatic checks
        showPaymentFailed();
    });

    const showPaymentSuccess = (transferDetailFormat) => {
        showStep(4);
        finalStatusTitle.textContent = "Pembayaran Berhasil!";
        finalStatusMessage.textContent = "Terima kasih atas pesanan Anda. Produk akan segera diproses oleh admin.";
        finalStatusTitle.style.color = '#28a745';
        transferDetailsArea.style.display = 'block';
        transferDetailsOutput.textContent = transferDetailFormat.replace('Menunggu Konfirmasi', 'BERHASIL');
        paymentStatusMessage.classList.remove('error');
        paymentStatusMessage.classList.add('success');
        alert("Pembayaran Berhasil! Detail transfer tersedia.");
    };

    const showPaymentFailed = () => {
        showStep(4);
        finalStatusTitle.textContent = "Pembayaran Gagal!";
        finalStatusMessage.textContent = "Terjadi kesalahan pada pembayaran atau pembayaran dibatalkan. Silakan coba lagi atau hubungi admin.";
        finalStatusTitle.style.color = '#dc3545';
        transferDetailsArea.style.display = 'none'; // Hide transfer details for failed payment
        paymentStatusMessage.classList.remove('success');
        paymentStatusMessage.classList.add('error');
    };

    printReceiptBtn.addEventListener('click', () => {
        window.print();
    });

    // AI Bot floating action button
    const aiBotFab = document.getElementById('ai-bot-fab');
    aiBotFab.addEventListener('click', () => {
        alert('Fitur AI Bot akan membawa Anda ke halaman chat dengan AI kami. (Ini adalah simulasi)');
        // In a real app, you would redirect to a chat page:
        // window.location.href = 'chat-with-ai.html';
    });

    // Admin Login Modal
    const adminLoginLink = document.getElementById('admin-login-link');
    const adminModal = document.getElementById('admin-modal');
    const adminCloseButton = adminModal.querySelector('.close-button');
    const adminLoginForm = document.getElementById('admin-login-form');

    adminLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        adminModal.style.display = 'flex';
        setTimeout(() => adminModal.classList.add('active'), 10);
    });

    adminCloseButton.addEventListener('click', () => {
        adminModal.classList.remove('active');
        setTimeout(() => adminModal.style.display = 'none', 300);
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = adminLoginForm.querySelector('input[type="text"]').value;
        const password = adminLoginForm.querySelector('input[type="password"]').value;

        if (username === "Annas" && password === "pw 1") {
            alert('Login Admin Berhasil! (Simulasi)\nAnda sekarang memiliki akses ke panel admin.');
            // In a real app, you would redirect to the admin dashboard:
            // window.location.href = '/admin/dashboard.html';
            adminModal.classList.remove('active');
            setTimeout(() => adminModal.style.display = 'none', 300);
            adminLoginForm.reset();
        } else {
            alert('Username atau Password salah!');
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === adminModal) {
            adminModal.classList.remove('active');
            setTimeout(() => adminModal.style.display = 'none', 300);
        }
    });

    // Basic Contact Form submission (no backend)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.');
            this.reset();
        });
    }

    // Intersection Observer for scroll animations
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.classList.add('hidden-section'); // Add a class to initially hide
        observer.observe(section);
    });

    // Initial load animations for specific elements
    document.querySelector('.hero-content h2').classList.add('fade-in');
    document.querySelector('.hero-content p').classList.add('fade-in');
    document.querySelector('.hero-content .btn').classList.add('fade-in');
});
