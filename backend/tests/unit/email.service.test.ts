import { EmailService } from '../../src/services/email.service';

jest.mock('../../src/config/env.config', () => ({
  __esModule: true,
  default: {
    smtpHost: 'smtp.test.local',
    smtpPort: 587,
    smtpUser: 'user@test.local',
    smtpPassword: 'test-password',
    smtpFromName: 'FoodBridge AI',
    smtpFromEmail: 'noreply@foodbridge.ai',
    clientUrl: 'http://localhost:3000',
  },
}));
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// Mock nodemailer — factory-style to avoid TDZ issues
const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-msg-id' });
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockImplementation(() => ({
      sendMail: (...args: any[]) => mockSendMail(...args),
    })),
  };
});

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail.mockResolvedValue({ messageId: 'test-msg-id' });
    emailService = new EmailService();
  });

  // ── renderTemplate ────────────────────────────────────

  describe('renderTemplate', () => {
    it('should render verify-email template with verification link', () => {
      const result = emailService.renderTemplate('verify-email', {
        name: 'Vraj',
        verificationToken: 'abc123',
        clientUrl: 'http://localhost:3000',
      });

      expect(result.html).toContain('Vraj');
      expect(result.html).toContain('http://localhost:3000/verify-email?token=abc123');
      expect(result.text).toContain('verify your email');
    });

    it('should render password-reset template with reset link', () => {
      const result = emailService.renderTemplate('reset-password', {
        name: 'Test User',
        resetToken: 'reset-xyz',
        clientUrl: 'http://localhost:3000',
      });

      expect(result.html).toContain('Reset Your Password');
      expect(result.html).toContain('http://localhost:3000/reset-password?token=reset-xyz');
      expect(result.text).toContain('reset your FoodBridge AI password');
    });

    it('should handle verification_email alias (underscore variant)', () => {
      const result = emailService.renderTemplate('VERIFICATION_EMAIL', {
        name: 'Alias Test',
        verificationToken: 'tok-alias',
      });

      expect(result.html).toContain('Alias Test');
      expect(result.html).toContain('verify-email?token=tok-alias');
    });

    it('should return fallback template for unknown template names', () => {
      const result = emailService.renderTemplate('unknown-template', {
        name: 'Fallback User',
      });

      expect(result.html).toContain('Fallback User');
      expect(result.text).toContain('notification from FoodBridge AI');
    });
  });

  // ── sendEmail ─────────────────────────────────────────

  describe('sendEmail', () => {
    it('should send email via transporter', async () => {
      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Hello</p>',
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Test Subject',
          html: '<p>Hello</p>',
        }),
      );
    });

    it('should rethrow errors for BullMQ retry', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP timeout'));

      await expect(
        emailService.sendEmail({
          to: 'user@example.com',
          subject: 'Fail',
          html: '<p>Fail</p>',
        }),
      ).rejects.toThrow('SMTP timeout');
    });
  });
});
