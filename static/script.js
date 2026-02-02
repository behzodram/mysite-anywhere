// Telegram kod tasdiqlash skripti
document.addEventListener('DOMContentLoaded', function() {
    // Kod kiritish maydonlarini boshqarish
    const inputs = document.querySelectorAll('.code-input');
    
    // Birinchi maydonga fokus
    if (inputs.length > 0) {
        document.getElementById('code1').focus();
        
        // Har bir kod kiritish maydoni uchun hodisalar
        inputs.forEach(input => {
            input.addEventListener('input', function(e) {
                // Faqat raqamlarni qabul qilish
                this.value = this.value.replace(/\D/g, '');
                
                // Raqam kiritilganda keyingi maydonga o'tish
                if (this.value.length === 1) {
                    this.classList.add('filled');
                    
                    const nextIndex = parseInt(this.dataset.index) + 1;
                    if (nextIndex < inputs.length) {
                        inputs[nextIndex].focus();
                    }
                }
                
                // To'liq kodni yangilash
                updateFullCode();
            });
            
            input.addEventListener('keydown', function(e) {
                // Backspace ni boshqarish
                if (e.key === 'Backspace' && this.value.length === 0) {
                    const prevIndex = parseInt(this.dataset.index) - 1;
                    if (prevIndex >= 0) {
                        inputs[prevIndex].focus();
                        inputs[prevIndex].classList.remove('filled');
                    }
                }
                
                // O'q tugmalarini boshqarish
                if (e.key === 'ArrowLeft') {
                    const prevIndex = parseInt(this.dataset.index) - 1;
                    if (prevIndex >= 0) {
                        inputs[prevIndex].focus();
                    }
                }
                
                if (e.key === 'ArrowRight') {
                    const nextIndex = parseInt(this.dataset.index) + 1;
                    if (nextIndex < inputs.length) {
                        inputs[nextIndex].focus();
                    }
                }
                
                // Enter tugmasi bilan tasdiqlash
                if (e.key === 'Enter') {
                    verify();
                }
                
                // To'liq kodni yangilash
                updateFullCode();
            });
            
            // Past qilish (paste) funksiyasi
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
                
                // Past qilingan ma'lumot bilan maydonlarni to'ldirish
                for (let i = 0; i < Math.min(pasteData.length, inputs.length); i++) {
                    inputs[i].value = pasteData[i];
                    inputs[i].classList.add('filled');
                }
                
                // Keyingi bo'sh maydonga fokus
                const nextEmptyIndex = Array.from(inputs).findIndex(input => input.value === '');
                if (nextEmptyIndex !== -1) {
                    inputs[nextEmptyIndex].focus();
                } else {
                    inputs[inputs.length - 1].focus();
                }
                
                updateFullCode();
            });
        });
    }
    
    // Taymerni boshlash
    startTimer();
});

// To'liq kodni yangilash funksiyasi
function updateFullCode() {
    const inputs = document.querySelectorAll('.code-input');
    let fullCode = '';
    inputs.forEach(input => {
        fullCode += input.value;
    });
    // Yashirin maydonga saqlash
    document.getElementById('full-code').value = fullCode;
    return fullCode;
}

// Taymer funksiyasi
function startTimer() {
    let timeLeft = 119; // 1 daqiqa 59 soniya
    
    const timerElement = document.getElementById('timer');
    const resendButton = document.querySelector('.btn-resend');
    
    if (!timerElement || !resendButton) return;
    
    const timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "00:00";
            resendButton.disabled = false;
            resendButton.innerHTML = '<i class="fas fa-redo"></i> Kodni qayta yuborish';
        } else {
            timeLeft--;
        }
    }, 1000);
}

// Kodni qayta yuborish funksiyasi
function resendCode() {
    const resendButton = document.querySelector('.btn-resend');
    const statusElement = document.getElementById('status');
    
    if (!resendButton || !statusElement) return;
    
    // Qayta yuborish tugmasini vaqtincha o'chirish
    resendButton.disabled = true;
    resendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuborilmoqda...';
    
    // Holat xabarini ko'rsatish
    statusElement.textContent = "Yangi kod yuborilmoqda...";
    statusElement.className = "status-message";
    
    // API so'rovini simulyatsiya qilish
    setTimeout(() => {
        // API so'rovini amalga oshirish
        fetch('/resend-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                // Kirish maydonlarini tozalash
                const inputs = document.querySelectorAll('.code-input');
                inputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('filled');
                });
                
                // Birinchi maydonga fokus
                document.getElementById('code1').focus();
                
                // Muvaffaqiyat xabarini ko'rsatish
                statusElement.textContent = data.msg || "Yangi 4 xonali kod Telegram hisobingizga yuborildi.";
                statusElement.classList.add('success');
                
                // Taymerni qayta boshlash
                startTimer();
                
                // Tugma holatini yangilash
                setTimeout(() => {
                    resendButton.innerHTML = '<i class="fas fa-redo"></i> Kodni qayta yuborish';
                    resendButton.disabled = true;
                }, 100);
                
                // Holat xabarini 5 soniyadan keyin yashirish
                setTimeout(() => {
                    statusElement.className = "status-message";
                }, 5000);
            } else {
                // Xato xabarini ko'rsatish
                statusElement.textContent = data.msg || "Kod yuborishda xatolik yuz berdi.";
                statusElement.classList.add('error');
                
                // Tugma holatini tiklash
                resendButton.innerHTML = '<i class="fas fa-redo"></i> Kodni qayta yuborish';
                resendButton.disabled = false;
                
                // Xato xabarini 5 soniyadan keyin yashirish
                setTimeout(() => {
                    statusElement.className = "status-message";
                }, 5000);
            }
        })
        .catch(error => {
            console.error('Xatolik:', error);
            statusElement.textContent = "Server bilan aloqa qilishda xatolik yuz berdi.";
            statusElement.classList.add('error');
            
            // Tugma holatini tiklash
            resendButton.innerHTML = '<i class="fas fa-redo"></i> Kodni qayta yuborish';
            resendButton.disabled = false;
            
            // Xato xabarini 5 soniyadan keyin yashirish
            setTimeout(() => {
                statusElement.className = "status-message";
            }, 5000);
        });
    }, 1000);
}

// Asosiy tasdiqlash funksiyasi (sizning bergan kodga mos)
async function verify() {
    // To'liq kodni olish
    const code = updateFullCode();
    const statusElement = document.getElementById('status');
    
    // Asosiy validatsiya
    if (code.length !== 4) {
        statusElement.textContent = "Iltimos, to'liq 4 xonali kodni kiriting.";
        statusElement.classList.add('error');
        
        // Kirish maydonlarini chayqatish animatsiyasi
        const inputs = document.querySelectorAll('.code-input');
        inputs.forEach(input => {
            input.classList.add('shake');
            setTimeout(() => {
                input.classList.remove('shake');
            }, 500);
        });
        
        return;
    }
    
    // Tasdiqlash jarayonini ko'rsatish
    statusElement.textContent = "Kod tekshirilmoqda...";
    statusElement.className = "status-message";
    
    // Tasdiqlash tugmasini o'chirish
    const verifyButton = document.querySelector('.btn-verify');
    if (verifyButton) {
        const originalText = verifyButton.innerHTML;
        verifyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tekshirilmoqda...';
        verifyButton.disabled = true;
        
        // API so'rovini amalga oshirish
        try {
            const res = await fetch("/verify", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ code })
            });

            const data = await res.json();

            if (data.ok) {
                // Muvaffaqiyat xabarini ko'rsatish
                statusElement.textContent = data.msg || "Tasdiqlash muvaffaqiyatli! Yo'naltirilmoqda...";
                statusElement.classList.add('success');
                
                // Dashboard sahifasiga yo'naltirish
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1500);
            } else {
                // Xato xabarini ko'rsatish
                statusElement.textContent = data.msg || "Noto'g'ri tasdiqlash kodi.";
                statusElement.classList.add('error');
                
                // Kirish maydonlarini tozalash
                const inputs = document.querySelectorAll('.code-input');
                inputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('filled');
                });
                
                // Birinchi maydonga fokus
                document.getElementById('code1').focus();
                
                // Tugma holatini tiklash
                verifyButton.innerHTML = originalText;
                verifyButton.disabled = false;
                
                // Xato xabarini 5 soniyadan keyin yashirish
                setTimeout(() => {
                    statusElement.className = "status-message";
                }, 5000);
            }
        } catch (error) {
            console.error('Xatolik:', error);
            statusElement.textContent = "Server bilan aloqa qilishda xatolik yuz berdi.";
            statusElement.classList.add('error');
            
            // Tugma holatini tiklash
            verifyButton.innerHTML = originalText;
            verifyButton.disabled = false;
            
            // Xato xabarini 5 soniyadan keyin yashirish
            setTimeout(() => {
                statusElement.className = "status-message";
            }, 5000);
        }
    } else {
        // Agar tasdiqlash tugmasi topilmasa, oddiy API so'rovini amalga oshirish
        try {
            const res = await fetch("/verify", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ code })
            });

            const data = await res.json();

            if (data.ok) {
                // Muvaffaqiyat xabarini ko'rsatish
                statusElement.textContent = data.msg || "Tasdiqlash muvaffaqiyatli! Yo'naltirilmoqda...";
                statusElement.classList.add('success');
                
                // Dashboard sahifasiga yo'naltirish
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1500);
            } else {
                // Xato xabarini ko'rsatish
                statusElement.textContent = data.msg;
                statusElement.classList.add('error');
                
                // Kirish maydonlarini tozalash
                const inputs = document.querySelectorAll('.code-input');
                inputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('filled');
                });
                
                // Birinchi maydonga fokus
                document.getElementById('code1').focus();
                
                // Xato xabarini 5 soniyadan keyin yashirish
                setTimeout(() => {
                    statusElement.className = "status-message";
                }, 5000);
            }
        } catch (error) {
            console.error('Xatolik:', error);
            statusElement.textContent = "Server bilan aloqa qilishda xatolik yuz berdi.";
            statusElement.classList.add('error');
            
            // Xato xabarini 5 soniyadan keyin yashirish
            setTimeout(() => {
                statusElement.className = "status-message";
            }, 5000);
        }
    }
}

// Demo maqsadida: qo'shimcha funksiyalar
// Sizning asl funksiyangizni saqlab qolish (agar kerak bo'lsa)
async function originalVerify() {
    const code = document.getElementById("code").value;
    const res = await fetch("/verify", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (data.ok) {
        window.location.href = "/dashboard";
    } else {
        document.getElementById("status").innerText = data.msg;
    }
}

// Demo maqsadida: tekshirish API simulyatsiyasi
async function mockVerifyAPI(code) {
    // Tarmoq kechikishini simulyatsiya qilish
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Demo maqsadida, "0000" dan boshqa har qanday 4 xonali kodni qabul qilish
    if (code === "0000") {
        return {
            ok: false,
            msg: "Noto'g'ri tasdiqlash kodi. Iltimos, qayta urinib ko'ring."
        };
    } else if (code === "1234") {
        return {
            ok: false,
            msg: "Bu kodning amal qilish muddati tugagan. Iltimos, yangi kod so'rang."
        };
    } else {
        return {
            ok: true,
            msg: "Tasdiqlash muvaffaqiyatli!"
        };
    }
}

// Sahifa elementlariga qo'shimcha hodisalar qo'shish
window.addEventListener('load', function() {
    // Enter tugmasi bilan sahifada har qanday joyda tasdiqlash
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            // Faqat kod kiritish maydonlarida emas, balki sahifaning istalgan joyida
            const activeElement = document.activeElement;
            const isCodeInput = activeElement.classList.contains('code-input');
            
            if (!isCodeInput) {
                verify();
            }
        }
    });
    
    // Automatik kod to'ldirish (demo maqsadida)
    // Haqiqiy loyihada bu qismni o'chirib qo'yishingiz mumkin
    const demoAutoFill = sessionStorage.getItem('demoAutoFill');
    if (!demoAutoFill && window.location.href.includes('localhost')) {
        setTimeout(() => {
            const inputs = document.querySelectorAll('.code-input');
            const demoCode = "5689"; // Demo kod
            for (let i = 0; i < Math.min(demoCode.length, inputs.length); i++) {
                inputs[i].value = demoCode[i];
                inputs[i].classList.add('filled');
            }
            updateFullCode();
            sessionStorage.setItem('demoAutoFill', 'true');
        }, 1000);
    }
});