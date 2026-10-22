# Import smtplib for sending emails using SMTP
import smtplib
# Import MIME modules to create formatted multipart HTML emails
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
# Import threading to send emails in background without slowing down the HTTP response
import threading
# Import Config to access email server credentials
from config import Config

# Helper function to send email via SMTP in a separate thread
def _send_smtp_email(to_email, subject, html_content):
    # Check if mail username is configured before attempting to send
    if not Config.MAIL_USERNAME or Config.MAIL_USERNAME == 'your_email@gmail.com':
        print(f"[MAIL MOCK LOG] SMTP not configured. Order email simulated for: {to_email}")
        print(f"[MAIL MOCK LOG] Subject: {subject}")
        return True

    try:
        # Create a multipart message container
        msg = MIMEMultipart('alternative')
        # Set email subject line
        msg['Subject'] = subject
        # Set sender email address
        sender_email = Config.MAIL_DEFAULT_SENDER or Config.MAIL_USERNAME
        msg['From'] = f"FoodieBite Orders <{sender_email}>"
        # Set recipient email address
        msg['To'] = to_email

        # Attach HTML body to the message
        part = MIMEText(html_content, 'html')
        msg.attach(part)

        # Connect to the SMTP server with host and port
        server = smtplib.SMTP(Config.MAIL_SERVER, Config.MAIL_PORT, timeout=15)
        # Enable TLS encryption if configured
        if Config.MAIL_USE_TLS:
            server.starttls()
        # Login using SMTP credentials
        server.login(Config.MAIL_USERNAME, Config.MAIL_PASSWORD)
        # Send the email to the recipient
        server.sendmail(sender_email, [to_email], msg.as_string())
        # Close connection to server
        server.quit()
        print(f"[MAIL SUCCESS] Order confirmation email successfully sent to {to_email}")
        return True
    except Exception as e:
        # Print error log without crashing the application
        print(f"[MAIL ERROR] Failed to send email to {to_email}: {str(e)}")
        return False

# Function to build and dispatch order confirmation email to the customer
def send_order_confirmation_email(user_email, user_name, order):
    # Generate list items HTML for all ordered dishes
    items_html = ""
    for item in order.items:
        items_html += f"""
        <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">{item.food_name}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">{item.quantity}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price:.2f}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${item.subtotal:.2f}</td>
        </tr>
        """

    # Build clean HTML email template
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #ea580c; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold;">FoodieBite</h1>
                <p style="margin: 8px 0 0 0; font-size: 16px;">Order Confirmed &bull; #{order.order_number}</p>
            </div>
            <div style="padding: 24px;">
                <p style="font-size: 16px; color: #374151;">Hello <strong>{user_name}</strong>,</p>
                <p style="font-size: 15px; color: #4b5563; line-height: 1.5;">
                    Thank you for your order! Your delicious meal is being prepared and will be delivered soon.
                </p>
                <div style="background-color: #f3f4f6; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
                    <p style="margin: 4px 0; font-size: 14px; color: #374151;"><strong>Order ID:</strong> {order.order_number}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #374151;"><strong>Status:</strong> {order.status}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #374151;"><strong>Delivery Address:</strong> {order.delivery_address or 'Standard Delivery'}</p>
                </div>
                <h3 style="color: #1f2937; margin-top: 20px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 14px;">
                    <thead>
                        <tr style="background-color: #f9fafb; color: #6b7280; text-align: left;">
                            <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb;">Item</th>
                            <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; text-align: center;">Qty</th>
                            <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; text-align: right;">Price</th>
                            <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px; color: #111827;">Grand Total:</td>
                            <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #ea580c;">${order.total_amount:.2f}</td>
                        </tr>
                    </tfoot>
                </table>
                <p style="margin-top: 24px; font-size: 13px; color: #9ca3af; text-align: center;">
                    If you have questions about your order, please reply directly to this email. Bon Appétit!
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    # Dispatch email in background thread so client request is not blocked
    email_thread = threading.Thread(
        target=_send_smtp_email,
        args=(user_email, f"Order Confirmed! #{order.order_number}", html_content)
    )
    # Start the background thread
    email_thread.start()
