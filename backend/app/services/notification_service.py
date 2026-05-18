import smtplib
from email.message import EmailMessage
from app.core.config import settings


def send_email(to_email: str, subject: str, body: str, is_html: bool = False):
    if not settings.smtp_username or not settings.smtp_password:
        print(f"[MOCK EMAIL] To: {to_email} | Subj: {subject} | Body: {body}")
        return

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = f"{settings.smtp_from_name} <{settings.smtp_from_email or settings.smtp_username}>"
    msg['To'] = to_email

    if is_html:
        msg.set_content("Please enable HTML to view this email.")
        msg.add_alternative(body, subtype='html')
    else:
        msg.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
        print(f"[EMAIL SENT] Successfully sent to {to_email}")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")


def send_payment_success_email(customer_email: str, customer_name: str, booking_id: int):
    subject = f"Booking Confirmation #{booking_id}"
    body = f"""
    <html>
        <body>
            <h2>Hello {customer_name},</h2>
            <p>Your payment for booking <b>#{booking_id}</b> has been successfully processed.</p>
            <p>You can view and download your E-Tickets by clicking the link below:</p>
            <a href="{settings.frontend_url}/booking/{booking_id}/tickets">View E-Tickets</a>
            <p>Thank you for choosing Event Booking Platform!</p>
        </body>
    </html>
    """
    send_email(customer_email, subject, body, is_html=True)
