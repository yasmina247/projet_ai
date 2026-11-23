import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import settings

log = logging.getLogger(__name__)


def send_email(to: str, subject: str, text: str, html: str) -> None:
    if not settings.BREVO_SMTP_KEY:
        print(f"\n[MAIL DEV] À: {to}\n{subject}\n{text}\n")
        return
    msg = EmailMessage()
    msg["Subject"], msg["From"], msg["To"] = subject, settings.MAIL_FROM, to
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")
    try:
        with smtplib.SMTP(settings.BREVO_SMTP_HOST, settings.BREVO_SMTP_PORT, timeout=15) as s:
            s.starttls(context=ssl.create_default_context())
            s.login(settings.BREVO_SMTP_LOGIN, settings.BREVO_SMTP_KEY)
            s.send_message(msg)
    except Exception:
        log.exception("Échec d'envoi d'e-mail à %s", to)


def _html(title: str, intro: str, label: str, link: str, note: str) -> str:
    return (
        f'<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">'
        f"<h2>{title}</h2><p>{intro}</p>"
        f'<p><a href="{link}" style="background:#2563eb;color:#fff;padding:12px 20px;'
        f'border-radius:8px;text-decoration:none;display:inline-block">{label}</a></p>'
        f'<p style="color:#64748b;font-size:12px">{note}</p></div>'
    )


def send_verification_email(to: str, name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/?verify={token}"
    send_email(
        to,
        "Vérifiez votre adresse e-mail – SmartSales AI",
        f"Bonjour {name}, confirmez votre e-mail : {link}",
        _html("Bienvenue sur SmartSales AI", f"Bonjour {name}, confirmez votre adresse e-mail.",
              "Vérifier mon e-mail", link,
              f"Lien valable {settings.VERIFY_TOKEN_EXPIRE_HOURS} h. Ignorez ce message si vous n'êtes pas à l'origine de cette demande."),
    )


def send_reset_email(to: str, name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/?reset={token}"
    send_email(
        to,
        "Réinitialisation de votre mot de passe – SmartSales AI",
        f"Bonjour {name}, réinitialisez votre mot de passe : {link}",
        _html("Réinitialisation du mot de passe", f"Bonjour {name}, cliquez pour choisir un nouveau mot de passe.",
              "Réinitialiser", link,
              f"Lien valable {settings.RESET_TOKEN_EXPIRE_MINUTES} min, à usage unique. Ignorez ce message si vous n'êtes pas à l'origine de cette demande."),
    )