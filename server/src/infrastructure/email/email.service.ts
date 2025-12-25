import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Email service interface
interface IEmailService {
  sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

// Local SMTP adapter (for development)
class LocalSMTPEmailService implements IEmailService {
  private transporter: Transporter;

  constructor() {
    // Use MailHog or local SMTP server
    // MailHog default: smtp://localhost:1025
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "1025", 10),
      secure: false, // true for 465, false for other ports
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@localhost",
        to,
        subject,
        html: htmlContent,
        text: textContent || this.htmlToText(htmlContent),
      });

      console.log(`[Local SMTP] Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("[Local SMTP] Email send error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }
}

// Resend adapter (for production) - lazy loaded
class ResendEmailService implements IEmailService {
  private resend: any;

  constructor() {
    // Dynamically import Resend to make it optional
    const Resend = require("resend").Resend;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required when EMAIL_MODE=resend");
    }
    this.resend = new Resend(apiKey);
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || "noreply@homewealth.app",
        to,
        subject,
        html: htmlContent,
        text: textContent || this.htmlToText(htmlContent),
      });

      if (error) {
        console.error("Resend email error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Resend service error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }
}

// Main email service (factory pattern)
export class EmailService {
  private service: IEmailService;

  constructor() {
    const emailMode = process.env.EMAIL_MODE || "local"; // "local" | "resend"

    if (emailMode === "resend") {
      try {
        this.service = new ResendEmailService();
        console.log("[Email Service] Using Resend (production mode)");
      } catch (error) {
        console.warn("[Email Service] Failed to initialize Resend, falling back to local SMTP:", error);
        this.service = new LocalSMTPEmailService();
        console.log("[Email Service] Using local SMTP (fallback mode)");
      }
    } else {
      this.service = new LocalSMTPEmailService();
      console.log("[Email Service] Using local SMTP (development mode)");
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.service.sendEmail(to, subject, htmlContent, textContent);
  }

  async sendRenewalReminder(
    to: string,
    userName: string,
    renewalDate: string,
    daysUntil: number,
    currentRate: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Mortgage Renewal Reminder: ${daysUntil} days until renewal`;
    const htmlContent = this.generateRenewalReminderEmail(userName, renewalDate, daysUntil, currentRate);
    return this.sendEmail(to, subject, htmlContent);
  }

  async sendTriggerRateAlert(
    to: string,
    userName: string,
    mortgageName: string,
    currentRate: number,
    triggerRate: number,
    balance: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Trigger Rate Alert: ${mortgageName}`;
    const htmlContent = this.generateTriggerRateAlertEmail(userName, mortgageName, currentRate, triggerRate, balance);
    return this.sendEmail(to, subject, htmlContent);
  }

  private generateRenewalReminderEmail(
    userName: string,
    renewalDate: string,
    daysUntil: number,
    currentRate: number
  ): string {
    const appUrl = process.env.APP_URL || "http://localhost:5000";
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Mortgage Renewal Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Your mortgage term is renewing in <strong>${daysUntil} days</strong> on ${renewalDate}.</p>
              <p>Current rate: <strong>${(currentRate * 100).toFixed(2)}%</strong></p>
              <p>Now is a good time to:</p>
              <ul>
                <li>Review current market rates</li>
                <li>Calculate potential penalties</li>
                <li>Consider blend-and-extend options</li>
                <li>Negotiate with your lender</li>
              </ul>
              <a href="${appUrl}/mortgages" class="button">View Your Mortgages</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateTriggerRateAlertEmail(
    userName: string,
    mortgageName: string,
    currentRate: number,
    triggerRate: number,
    balance: number
  ): string {
    const appUrl = process.env.APP_URL || "http://localhost:5000";
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .alert { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Trigger Rate Alert</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <div class="alert">
                <p><strong>Alert:</strong> Your mortgage "${mortgageName}" has hit or is approaching its trigger rate.</p>
                <p>Current Rate: <strong>${(currentRate * 100).toFixed(2)}%</strong></p>
                <p>Trigger Rate: <strong>${(triggerRate * 100).toFixed(2)}%</strong></p>
                <p>Balance: <strong>$${balance.toLocaleString()}</strong></p>
              </div>
              <p>When your rate exceeds the trigger rate, your payments may no longer cover the interest, leading to negative amortization.</p>
              <p>Consider:</p>
              <ul>
                <li>Making a lump-sum prepayment</li>
                <li>Increasing your regular payment amount</li>
                <li>Reviewing your mortgage strategy</li>
              </ul>
              <a href="${appUrl}/mortgages" class="button">View Your Mortgage</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();

