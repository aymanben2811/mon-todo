import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Envoie l'email de bienvenue à un nouvel utilisateur
export async function POST(request: Request) {
  const { email, firstName } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email manquant" }, { status: 400 });
  }

  const prenom = firstName || email.split("@")[0];

  const texte = `Salut ${prenom} !

Merci d'avoir essayé ma petite application, c'est pas ouf comme application mais bon c'était pour m'amuser

En tout cas teste-la, si t'aimes bien tu me le dis, et si t'aimes pas envoie un mail à : jeMenFou@gmail.com

Merci et à bientôt ${prenom} !`;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Salut, Beaugosse / Bellegosse !",
      text: texte,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
