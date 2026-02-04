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
            statusElement.textContent = "Verification successful! Redirecting to dashboard...";
            statusElement.className = "status-message success";
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1000);
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