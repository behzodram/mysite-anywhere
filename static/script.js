// Initialize code input handling and timer
document.addEventListener('DOMContentLoaded', function() {
    // Focus the first input on load
    document.getElementById('code1').focus();
    
    // Set up code input handling
    const inputs = document.querySelectorAll('.code-input');
    
    inputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Only allow digits
            this.value = this.value.replace(/\D/g, '');
            
            // Move to next input if a digit is entered
            if (this.value.length === 1) {
                this.classList.add('filled');
                
                const nextIndex = parseInt(this.dataset.index) + 1;
                if (nextIndex < inputs.length) {
                    inputs[nextIndex].focus();
                }
            }
            
            // Update the hidden full code field
            updateFullCode();
        });
        
        input.addEventListener('keydown', function(e) {
            // Handle backspace
            if (e.key === 'Backspace' && this.value.length === 0) {
                const prevIndex = parseInt(this.dataset.index) - 1;
                if (prevIndex >= 0) {
                    inputs[prevIndex].focus();
                    inputs[prevIndex].classList.remove('filled');
                }
            }
            
            // Handle arrow keys
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
            
            // Update the hidden full code field
            updateFullCode();
        });
        
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
            
            // Fill inputs with pasted data
            for (let i = 0; i < Math.min(pasteData.length, inputs.length); i++) {
                inputs[i].value = pasteData[i];
                inputs[i].classList.add('filled');
            }
            
            // Focus the next empty input or last one
            const nextEmptyIndex = Array.from(inputs).findIndex(input => input.value === '');
            if (nextEmptyIndex !== -1) {
                inputs[nextEmptyIndex].focus();
            } else {
                inputs[inputs.length - 1].focus();
            }
            
            updateFullCode();
        });
    });
    
    // Start the countdown timer
    startTimer();
});

// Update the hidden full code field
function updateFullCode() {
    const inputs = document.querySelectorAll('.code-input');
    let fullCode = '';
    inputs.forEach(input => {
        fullCode += input.value;
    });
    document.getElementById('full-code').value = fullCode;
}

// Timer functionality
function startTimer() {
    let timeLeft = 119; // 1 minute 59 seconds
    
    const timerElement = document.getElementById('timer');
    const resendButton = document.querySelector('.btn-resend');
    
    const timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "00:00";
            resendButton.disabled = false;
            resendButton.innerHTML = '<i class="fas fa-redo"></i> Resend Code';
        } else {
            timeLeft--;
        }
    }, 1000);
}

// Resend code function
function resendCode() {
    const resendButton = document.querySelector('.btn-resend');
    const statusElement = document.getElementById('status');
    
    // Disable resend button temporarily
    resendButton.disabled = true;
    resendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Show status message
    statusElement.textContent = "Sending new code...";
    statusElement.className = "status-message";
    
    // Simulate API call delay
    setTimeout(() => {
        // Clear input fields
        const inputs = document.querySelectorAll('.code-input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
        document.getElementById('code1').focus();
        
        // Show success message
        statusElement.textContent = "A new 4-digit code has been sent to your Telegram account.";
        statusElement.classList.add('success');
        
        // Restart timer
        startTimer();
        
        // Update button state after timer starts
        setTimeout(() => {
            resendButton.innerHTML = '<i class="fas fa-redo"></i> Resend Code';
            resendButton.disabled = true;
        }, 100);
        
        // Hide status after 5 seconds
        setTimeout(() => {
            statusElement.className = "status-message";
        }, 5000);
    }, 1500);
}

// Verification function
async function verify() {
    const inputs = document.querySelectorAll('.code-input');
    let code = '';
    inputs.forEach(input => {
        code += input.value;
    });
    
    const statusElement = document.getElementById('status');
    
    // Basic validation
    if (code.length !== 4) {
        statusElement.textContent = "Please enter a complete 4-digit code.";
        statusElement.classList.add('error');
        
        // Add shake animation to inputs
        inputs.forEach(input => {
            input.classList.add('shake');
            setTimeout(() => {
                input.classList.remove('shake');
            }, 500);
        });
        
        return;
    }
    
    // Show verifying status
    statusElement.textContent = "Verifying code...";
    statusElement.className = "status-message";
    
    // Simulate API call
    setTimeout(async () => {
        // In a real app, you would make an actual fetch call here
        // For demo purposes, we'll simulate a response
        const res = await mockVerifyAPI(code);
        
        if (res.ok) {
            // Show success message
            statusElement.textContent = "Verification successful! Redirecting...";
            statusElement.classList.add('success');
            
            // Simulate redirect to dashboard
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1500);
        } else {
            // Show error message
            statusElement.textContent = res.msg;
            statusElement.classList.add('error');
            
            // Clear input fields on error
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('filled');
            });
            document.getElementById('code1').focus();
            
            // Hide error after 5 seconds
            setTimeout(() => {
                statusElement.className = "status-message";
            }, 5000);
        }
    }, 1500);
}

// Mock API function for demo
async function mockVerifyAPI(code) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo purposes, accept any 4-digit code except "0000"
    if (code === "0000") {
        return {
            ok: false,
            msg: "Invalid verification code. Please try again."
        };
    } else if (code === "1234") {
        return {
            ok: false,
            msg: "This code has expired. Please request a new one."
        };
    } else {
        return {
            ok: true,
            msg: "Verification successful!"
        };
    }
}