// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer'; // Importação do Nodemailer
import { Transporter } from 'nodemailer'; // Tipo para o objeto de transporte

@Injectable()
export class EmailService {
    private transporter: Transporter; // Definindo o tipo

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Substitua pelo seu servidor SMTP
            port: 587,
            secure: false, // Use 'true' se for porta 465 com SSL
            auth: {
                user: 'alexandre.carvalho.dellanno@gmail.com', // Substitua pelo seu e-mail
                pass: 'xyzy yfkm umsa xoui', // Substitua pela sua senha de aplicativo
            },
        });
    }

    // ⚠️ MÉTODO ANTIGO: Envia um link de redefinição
    async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
        const mailOptions = {
            from: 'alexandre.carvalho.dellanno@gmail.com',
            to,
            subject: 'Redefinição de Senha',
            html: `
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetLink}">Redefinir Senha</a>
        <p>Se você não solicitou esta redefinição, por favor, ignore este e-mail.</p>
      `,
        };

        console.log('Enviando e-mail de redefinição para:', to);

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ E-mail de redefinição enviado para: ${to}`);
        } catch (error) {
            console.error(`❌ Erro ao enviar e-mail para ${to}:`, error);
            throw new Error('Falha ao enviar e-mail de redefinição.');
        }
    }

    // 🔥 NOVO MÉTODO: Envia um código de redefinição de 6 dígitos
    async sendPasswordResetCode(to: string, resetCode: string): Promise<void> {
        const mailOptions = {
            from: 'alexandre.carvalho.dellanno@gmail.com',
            to,
            subject: 'Código de Redefinição de Senha',
            html: `
        <p>Olá,</p>
        <p>Você solicitou a redefinição da sua senha. Use o código abaixo para continuar:</p>
        <h2 style="font-weight: bold; font-size: 24px;">${resetCode}</h2>
        <p>Este código é válido por 1 hora.</p>
        <p>Se você não solicitou esta redefinição, por favor, ignore este e-mail.</p>
      `,
        };

        console.log('Enviando e-mail com código de redefinição para:', to);

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ E-mail com código de redefinição enviado para: ${to}`);
        } catch (error) {
            console.error(`❌ Erro ao enviar e-mail com código para ${to}:`, error);
            throw new Error('Falha ao enviar e-mail de redefinição.');
        }
    }
}