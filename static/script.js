document.addEventListener('DOMContentLoaded', function() {
    // Code input management
    const inputs = document.querySelectorAll('.code-input');
    const sessionId = document.getElementById('session-id').value;
    
    // Auto-focus first input
    if (inputs.length > 0) {
        inputs[0].focus();
        
        inputs.forEach(input => {
            input.addEventListener('input', function(e) {
                // Only allow numbers
                this.value = this.value.replace(/\D/g, '');
                
                // Move to next input
                if (this.value.length === 1) {
                    const nextIndex = parseInt(this.dataset.index) + 1;
                    if (nextIndex < inputs.length) {
                        inputs[nextIndex].focus();
                    }
                }
            });
            
            input.addEventListener('keydown', function(e) {
                // Handle backspace
                if (e.key === 'Backspace' && this.value.length === 0) {
                    const prevIndex = parseInt(this.dataset.index) - 1;
                    if (prevIndex >= 0) {
                        inputs[prevIndex].focus();
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
                
                // Enter to verify
                if (e.key === 'Enter') {
                    verify();
                }
            });
            
            // Handle paste
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
                
                // Fill inputs with pasted data
                for (let i = 0; i < Math.min(pasteData.length, inputs.length); i++) {
                    inputs[i].value = pasteData[i];
                }
                
                // Focus next empty input
                const nextEmptyIndex = Array.from(inputs).findIndex(input => input.value === '');
                if (nextEmptyIndex !== -1) {
                    inputs[nextEmptyIndex].focus();
                } else {
                    inputs[inputs.length - 1].focus();
                }
            });
        });
    }
    
    // Start timer
    startTimer();
});

// Get full code
function getFullCode() {
    const inputs = document.querySelectorAll('.code-input');
    let fullCode = '';
    inputs.forEach(input => {
        fullCode += input.value;
    });
    return fullCode;
}

// Timer function
function startTimer() {
    let timeLeft = 300; // 5 minutes
    
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
            resendButton.innerHTML = '<i class="fas fa-redo"></i> Get New Code';
        } else {
            timeLeft--;
        }
    }, 1000);
}

// Resend code
function resendCode() {
    const resendButton = document.querySelector('.btn-resend');
    const statusElement = document.getElementById('status');
    
    if (!resendButton || !statusElement) return;
    
    // Disable button temporarily
    resendButton.disabled = true;
    resendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Show status
    statusElement.textContent = "Please get new code from the bot";
    statusElement.className = "status-message";
    
    // Reload page to get new session
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// Verify code
async function verify() {
    const code = getFullCode();
    const sessionId = document.getElementById('session-id').value;
    const statusElement = document.getElementById('status');
    
    // Validation
    if (code.length !== 4) {
        statusElement.textContent = "Please enter 4-digit code";
        statusElement.className = "status-message error";
        
        // Shake animation
        const inputs = document.querySelectorAll('.code-input');
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
    
    // Disable verify button
    const verifyButton = document.querySelector('.btn-verify');
    const originalText = verifyButton.innerHTML;
    verifyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    verifyButton.disabled = true;
    
    try {
        const response = await fetch("/verify", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ code: code, session_id: sessionId })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            statusElement.textContent = "Verification successful! Redirecting...";
            statusElement.className = "status-message success";
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1500);
        } else {
            statusElement.textContent = data.msg || "Invalid code";
            statusElement.className = "status-message error";
            
            // Clear inputs
            const inputs = document.querySelectorAll('.code-input');
            inputs.forEach(input => {
                input.value = '';
            });
            inputs[0].focus();
            
            // Restore button
            verifyButton.innerHTML = originalText;
            verifyButton.disabled = false;
        }
    } catch (error) {
        console.error("Error:", error);
        statusElement.textContent = "Connection error";
        statusElement.className = "status-message error";
        
        verifyButton.innerHTML = originalText;
        verifyButton.disabled = false;
    }
}