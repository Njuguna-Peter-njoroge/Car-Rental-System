/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

export interface EmailOptions {
    to: string;
    subject: string;
    template?: string;
    context?: Record<string, any>;
    html?: string;
    text?: string;
}

export interface WelcomeEmailContext {
    name: string;
    email: string;
    companyName?: string;
    supportEmail?: string;
    loginUrl?: string;
}

@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);

    constructor(
        private mailerService: NestMailerService,
        private configService: ConfigService,
    ) {}

    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const mailOptions: any = {
                to: options.to,
                subject: options.subject,
            };

            if (options.template && options.context) {
                mailOptions.template = options.template;
                mailOptions.context = options.context;
            } else if (options.html) {
                mailOptions.html = options.html;
            } else if (options.text) {
                mailOptions.text = options.text;
            }

            const result = await this.mailerService.sendMail(mailOptions);
            this.logger.log(
                `Email sent successfully to ${options.to}: ${result.messageId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to send email to ${options.to}: ${error.message}`,
            );
            throw error;
        }
    }

    async sendWelcomeEmail(email: string, name: string, verificationToken?: string): Promise<void> {
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const verificationUrl = verificationToken 
            ? `${baseUrl}/verify-email?token=${verificationToken}`
            : null;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Welcome to Car Rental Service',
            template: 'welcome',
            context: {
                name,
                verificationUrl,
                baseUrl,
                currentYear: new Date().getFullYear(),
            },
        });
    }

    async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Password Reset Request',
            template: 'password-reset',
            context: {
                name,
                resetUrl,
                baseUrl,
                currentYear: new Date().getFullYear(),
            },
        });
    }

    async sendEmailVerification(email: string, name: string, verificationToken: string): Promise<void> {
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Verify Your Email Address',
            template: 'email-verification',
            context: {
                name,
                verificationUrl,
                baseUrl,
            },
        });
    }

    async sendBookingConfirmation(email: string, name: string, bookingDetails: any): Promise<void> {
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        await this.mailerService.sendMail({
            to: email,
            subject: 'Booking Confirmation',
            template: 'booking-confirmation',
            context: {
                name,
                bookingDetails,
                baseUrl,
            },
        });
    }

    async sendBookingCancellation(email: string, name: string, bookingDetails: any): Promise<void> {
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        await this.mailerService.sendMail({
            to: email,
            subject: 'Booking Cancellation',
            template: 'booking-cancellation',
            context: {
                name,
                bookingDetails,
                baseUrl,
            },
        });
    }
}