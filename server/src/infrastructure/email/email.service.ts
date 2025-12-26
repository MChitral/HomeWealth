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
        console.warn(
          "[Email Service] Failed to initialize Resend, falling back to local SMTP:",
          error
        );
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
    currentRate: number,
    options?: {
      estimatedPenalty?: { amount: number; method: string };
      marketRate?: number;
      mortgageId?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Mortgage Renewal Reminder: ${daysUntil} days until renewal`;
    const htmlContent = this.generateRenewalReminderEmail(
      userName,
      renewalDate,
      daysUntil,
      currentRate,
      options
    );
    return this.sendEmail(to, subject, htmlContent);
  }

  async sendTriggerRateAlert(
    to: string,
    userName: string,
    mortgageName: string,
    currentRate: number,
    triggerRate: number,
    balance: number,
    options?: {
      alertType?: "trigger_rate_approaching" | "trigger_rate_close" | "trigger_rate_hit";
      distanceToTrigger?: number;
      monthlyBalanceIncrease?: number;
      projectedBalanceAtTermEnd?: number;
      requiredPayment?: number;
      mortgageId?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const alertType = options?.alertType || "trigger_rate_alert";
    const subject = `Trigger Rate Alert: ${mortgageName}`;
    const htmlContent = this.generateTriggerRateAlertEmail(
      userName,
      mortgageName,
      currentRate,
      triggerRate,
      balance,
      options
    );
    return this.sendEmail(to, subject, htmlContent);
  }

  private generateRenewalReminderEmail(
    userName: string,
    renewalDate: string,
    daysUntil: number,
    currentRate: number,
    options?: {
      estimatedPenalty?: { amount: number; method: string };
      marketRate?: number;
      mortgageId?: string;
    }
  ): string {
    const appUrl = process.env.APP_URL || "http://localhost:5000";
    const renewalDateFormatted = new Date(renewalDate).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Determine urgency and action items based on days until renewal
    let urgencyClass = "info";
    let urgencyMessage = "";
    let actionItems: string[] = [];

    if (daysUntil === 180) {
      urgencyClass = "info";
      urgencyMessage = "Early Planning Reminder";
      actionItems = [
        "Review your current mortgage terms and rates",
        "Start researching current market rates",
        "Consider your long-term financial goals",
        "Plan for potential rate changes",
      ];
    } else if (daysUntil === 90) {
      urgencyClass = "warning";
      urgencyMessage = "Time to Start Planning";
      actionItems = [
        "Compare current market rates with your rate",
        "Calculate potential penalties if breaking early",
        "Explore blend-and-extend options",
        "Begin negotiations with your lender",
      ];
    } else if (daysUntil === 30) {
      urgencyClass = "urgent";
      urgencyMessage = "Action Needed - 1 Month Remaining";
      actionItems = [
        "Finalize your renewal decision",
        "Calculate exact penalties",
        "Compare all renewal options",
        "Contact your lender to negotiate",
      ];
    } else if (daysUntil === 7) {
      urgencyClass = "critical";
      urgencyMessage = "Urgent - Final Week";
      actionItems = [
        "Make your renewal decision immediately",
        "Finalize new term details",
        "Complete any required paperwork",
        "Ensure smooth transition to new term",
      ];
    }

    // Rate comparison section
    let rateComparisonHtml = "";
    if (options?.marketRate !== undefined) {
      const marketRatePercent = options.marketRate * 100;
      const currentRatePercent = currentRate * 100;
      const rateDiff = marketRatePercent - currentRatePercent;
      const rateDiffAbs = Math.abs(rateDiff);
      const isHigher = rateDiff > 0;

      rateComparisonHtml = `
        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #1e40af;">Rate Comparison</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;"><strong>Your Current Rate:</strong></td>
              <td style="padding: 8px 0; text-align: right;"><strong>${currentRatePercent.toFixed(2)}%</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Current Market Rate:</td>
              <td style="padding: 8px 0; text-align: right;">${marketRatePercent.toFixed(2)}%</td>
            </tr>
            <tr style="border-top: 1px solid #cbd5e1;">
              <td style="padding: 8px 0;"><strong>Difference:</strong></td>
              <td style="padding: 8px 0; text-align: right; color: ${isHigher ? "#dc2626" : "#16a34a"};">
                <strong>${isHigher ? "+" : ""}${rateDiff.toFixed(2)}%</strong>
              </td>
            </tr>
          </table>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">
            ${isHigher ? `Market rates are ${rateDiffAbs.toFixed(2)}% higher than your current rate. Renewing now may result in higher payments.` : `Market rates are ${rateDiffAbs.toFixed(2)}% lower than your current rate. You may be able to secure a better rate.`}
          </p>
        </div>
      `;
    }

    // Penalty information section
    let penaltyHtml = "";
    if (options?.estimatedPenalty) {
      const penalty = options.estimatedPenalty;
      penaltyHtml = `
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #991b1b;">Estimated Early Break Penalty</h3>
          <p style="font-size: 18px; margin: 10px 0;">
            <strong>$${penalty.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            <span style="font-size: 14px; color: #64748b;"> (${penalty.method})</span>
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">
            This is an estimate. Actual penalties may vary. Use our penalty calculator for a detailed breakdown.
          </p>
        </div>
      `;
    }

    // Build mortgage link
    const mortgageLink = options?.mortgageId
      ? `${appUrl}/mortgages/${options.mortgageId}`
      : `${appUrl}/mortgages`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background-color: #2563eb; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px 20px; background-color: #ffffff; }
            .urgency-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 15px; }
            .urgency-info { background-color: #dbeafe; color: #1e40af; }
            .urgency-warning { background-color: #fef3c7; color: #92400e; }
            .urgency-urgent { background-color: #fed7aa; color: #9a3412; }
            .urgency-critical { background-color: #fee2e2; color: #991b1b; }
            .highlight-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px 0 0; font-weight: 600; }
            .button-secondary { background-color: #64748b; }
            .action-list { margin: 15px 0; padding-left: 20px; }
            .action-list li { margin: 8px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; }
              .content { padding: 20px 15px !important; }
              .button { display: block; text-align: center; margin: 10px 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Mortgage Renewal Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <div class="urgency-badge urgency-${urgencyClass}">${urgencyMessage}</div>
              
              <div class="highlight-box">
                <p style="font-size: 20px; margin: 0 0 10px 0;">
                  Your mortgage term is renewing in <strong style="color: #2563eb;">${daysUntil} days</strong>
                </p>
                <p style="margin: 0; color: #64748b;">
                  Renewal Date: <strong>${renewalDateFormatted}</strong>
                </p>
                <p style="margin: 10px 0 0 0;">
                  Current Rate: <strong style="font-size: 18px;">${(currentRate * 100).toFixed(2)}%</strong>
                </p>
              </div>

              ${rateComparisonHtml}

              ${penaltyHtml}

              <div style="margin: 25px 0;">
                <h3 style="margin-top: 0; color: #1e293b;">Recommended Actions</h3>
                <ul class="action-list">
                  ${actionItems.map((item) => `<li>${item}</li>`).join("")}
                </ul>
              </div>

              <div style="margin: 30px 0; text-align: center;">
                <a href="${mortgageLink}" class="button">View Mortgage Details</a>
                ${options?.estimatedPenalty ? `<a href="${mortgageLink}?tab=renewals" class="button button-secondary">Calculate Penalty</a>` : ""}
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
                <p style="margin: 0 0 10px 0;"><strong>Quick Links:</strong></p>
                <p style="margin: 5px 0;">
                  <a href="${appUrl}/mortgages" style="color: #2563eb; text-decoration: none;">View All Mortgages</a> | 
                  <a href="${appUrl}/mortgages?tab=renewals" style="color: #2563eb; text-decoration: none;">Renewal Planning</a> | 
                  <a href="${appUrl}/notifications/preferences" style="color: #2563eb; text-decoration: none;">Notification Settings</a>
                </p>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0;">This is an automated reminder from HomeWealth Mortgage Strategy</p>
              <p style="margin: 5px 0 0 0;">
                <a href="${appUrl}/notifications/preferences" style="color: #64748b; text-decoration: underline;">Manage notification preferences</a>
              </p>
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
    balance: number,
    options?: {
      alertType?: "trigger_rate_approaching" | "trigger_rate_close" | "trigger_rate_hit";
      distanceToTrigger?: number;
      monthlyBalanceIncrease?: number;
      projectedBalanceAtTermEnd?: number;
      requiredPayment?: number;
      mortgageId?: string;
    }
  ): string {
    const appUrl = process.env.APP_URL || "http://localhost:5000";
    const alertType = options?.alertType || "trigger_rate_hit";
    const currentRatePercent = currentRate * 100;
    const triggerRatePercent = triggerRate * 100;
    const distancePercent = options?.distanceToTrigger
      ? (options.distanceToTrigger * 100).toFixed(2)
      : ((triggerRate - currentRate) * 100).toFixed(2);

    // Determine urgency and styling based on alert type
    let urgencyClass = "critical";
    let urgencyMessage = "";
    let headerColor = "#dc2626"; // Red
    let actionItems: string[] = [];

    if (alertType === "trigger_rate_hit") {
      urgencyClass = "critical";
      urgencyMessage = "Critical - Trigger Rate Hit";
      headerColor = "#dc2626"; // Red
      actionItems = [
        "Contact your lender immediately to discuss options",
        "Consider making a lump-sum prepayment to reduce balance",
        "Increase your regular payment amount to cover interest",
        "Review your mortgage strategy and consider refinancing",
      ];
    } else if (alertType === "trigger_rate_close") {
      urgencyClass = "urgent";
      urgencyMessage = "Urgent - Very Close to Trigger Rate";
      headerColor = "#ea580c"; // Orange
      actionItems = [
        "Take immediate action to prevent negative amortization",
        "Make a prepayment to reduce your balance",
        "Increase your regular payment amount",
        "Contact your lender to discuss payment increase options",
      ];
    } else {
      urgencyClass = "warning";
      urgencyMessage = "Warning - Approaching Trigger Rate";
      headerColor = "#f59e0b"; // Amber
      actionItems = [
        "Monitor your rate closely",
        "Consider making a prepayment to build a buffer",
        "Review your payment amount and consider increasing it",
        "Plan for potential rate increases",
      ];
    }

    // Impact analysis section (for hit and close alerts)
    let impactHtml = "";
    if (
      (alertType === "trigger_rate_hit" || alertType === "trigger_rate_close") &&
      options?.monthlyBalanceIncrease !== undefined
    ) {
      impactHtml = `
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #991b1b;">Impact Analysis</h3>
          <div style="space-y-2">
            <p style="margin: 8px 0;">
              <strong>Monthly Balance Increase:</strong> 
              <span style="color: #dc2626; font-size: 18px;">
                $${options.monthlyBalanceIncrease.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
            ${
              options.projectedBalanceAtTermEnd !== undefined
                ? `
                <p style="margin: 8px 0;">
                  <strong>Projected Balance at Term End:</strong> 
                  <span style="color: #dc2626; font-size: 18px;">
                    $${options.projectedBalanceAtTermEnd.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
              `
                : ""
            }
            ${
              options.requiredPayment !== undefined
                ? `
                <p style="margin: 8px 0;">
                  <strong>Required Payment to Prevent Increase:</strong> 
                  <span style="color: #16a34a; font-size: 18px;">
                    $${options.requiredPayment.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
              `
                : ""
            }
          </div>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">
            ${
              alertType === "trigger_rate_hit"
                ? "Your mortgage balance is now increasing each month. Take action immediately."
                : "If your rate hits the trigger rate, your balance will start increasing."
            }
          </p>
        </div>
      `;
    }

    // Build mortgage link
    const mortgageLink = options?.mortgageId
      ? `${appUrl}/mortgages/${options.mortgageId}`
      : `${appUrl}/mortgages`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background-color: ${headerColor}; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px 20px; background-color: #ffffff; }
            .urgency-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 15px; }
            .urgency-critical { background-color: #fee2e2; color: #991b1b; }
            .urgency-urgent { background-color: #fed7aa; color: #9a3412; }
            .urgency-warning { background-color: #fef3c7; color: #92400e; }
            .highlight-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; padding: 14px 28px; background-color: ${headerColor}; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px 0 0; font-weight: 600; }
            .button-secondary { background-color: #64748b; }
            .action-list { margin: 15px 0; padding-left: 20px; }
            .action-list li { margin: 8px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; }
              .content { padding: 20px 15px !important; }
              .button { display: block; text-align: center; margin: 10px 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Trigger Rate Alert</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <div class="urgency-badge urgency-${urgencyClass}">${urgencyMessage}</div>
              
              <div class="highlight-box">
                <p style="font-size: 20px; margin: 0 0 10px 0;">
                  <strong style="color: ${headerColor};">
                    ${
                      alertType === "trigger_rate_hit"
                        ? "Your trigger rate has been hit"
                        : `You are ${distancePercent}% away from your trigger rate`
                    }
                  </strong>
                </p>
                <div style="margin-top: 15px; space-y-2">
                  <p style="margin: 8px 0;">
                    <strong>Current Rate:</strong> 
                    <span style="font-size: 18px; color: ${headerColor};">
                      ${currentRatePercent.toFixed(2)}%
                    </span>
                  </p>
                  <p style="margin: 8px 0;">
                    <strong>Trigger Rate:</strong> 
                    <span style="font-size: 18px;">
                      ${triggerRatePercent.toFixed(2)}%
                    </span>
                  </p>
                  <p style="margin: 8px 0;">
                    <strong>Current Balance:</strong> 
                    <span style="font-size: 18px;">
                      $${balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                </div>
              </div>

              ${impactHtml}

              <div style="margin: 25px 0;">
                <h3 style="margin-top: 0; color: #1e293b;">Recommended Actions</h3>
                <ul class="action-list">
                  ${actionItems.map((item) => `<li>${item}</li>`).join("")}
                </ul>
              </div>

              <div style="margin: 30px 0; text-align: center;">
                <a href="${mortgageLink}" class="button">View Mortgage Details</a>
                <a href="${appUrl}/mortgages" class="button button-secondary">View All Mortgages</a>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
                <p style="margin: 0 0 10px 0;"><strong>What is a Trigger Rate?</strong></p>
                <p style="margin: 0;">
                  For variable-rate mortgages with fixed payments, the trigger rate is the interest rate at which your payment no longer covers the interest. When this happens, your mortgage balance starts increasing (negative amortization).
                </p>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0;">This is an automated alert from HomeWealth Mortgage Strategy</p>
              <p style="margin: 5px 0 0 0;">
                <a href="${appUrl}/notifications/preferences" style="color: #64748b; text-decoration: underline;">Manage notification preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
