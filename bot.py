from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
import random, json, logging
from RedisFB import FbaseRedis
from config import *

r = FbaseRedis(CRED_FB_Redis_PATH, DB_FB_Redis_URL, CLAUDE_VERIFY_NAMESPACE)

# Logging setup
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command"""
    try:
        user = update.effective_user
        command_text = update.message.text
        
        logger.info(f"Start command from user: {user.id}, text: {command_text}")
        
        # Check if command has session_id
        parts = command_text.split()
        if len(parts) < 2:
            await update.message.reply_text(
                "Hello! 👋 I'm the verification bot.\n\n"
                "Please use the link from the website to get your verification code."
            )
            return
        
        session_id = parts[1]
        logger.info(f"Session ID received: {session_id}")
        
        # Generate 4-digit code
        code = str(random.randint(1000, 9999))
        logger.info(f"Generated code: {code} for session: {session_id}")
        
        # Create hash key
        key = h_key(code)
        
        # Prepare data
        data = {
            "session_id": session_id,
            "telegram_id": user.id,
            "username": user.username
        }
        
        # Store in Redis
        r.setex(key, VERIFY_TTL, json.dumps(data))
        logger.info(f"Stored in Redis with key: {key}")
        
        # Send code to user
        message = (
            f"🔐 **Verification Code**\n\n"
            f"Your code: `{code}`\n"
            f"⚠️ Valid for 5 minutes\n\n"
            f"Enter this code on the website to continue."
        )
        
        await update.message.reply_text(message, parse_mode='Markdown')
        
    except Exception as e:
        logger.error(f"Error in start_command: {e}")
        await update.message.reply_text("❌ An error occurred. Please try again.")

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle errors"""
    logger.error(f"Update {update} caused error {context.error}")
    
    if update and update.effective_message:
        try:
            await update.effective_message.reply_text(
                "❌ Sorry, an error occurred. Please try again."
            )
        except:
            pass

def main():
    """Start the bot"""
    try:
        # Create Application
        app = Application.builder().token(TELEGRAM_TOKEN).build()
        
        # Add handlers
        app.add_handler(CommandHandler("start", start_command))
        
        # Add error handler
        app.add_error_handler(error_handler)
        
        logger.info("Bot is starting...")
        
        # Start polling
        app.run_polling(
            poll_interval=1.0,
            timeout=30,
            drop_pending_updates=True
        )
        
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")

if __name__ == "__main__":
    main()