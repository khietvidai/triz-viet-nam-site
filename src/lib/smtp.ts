import { connect } from 'cloudflare:sockets';

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    smtpUser?: string;
    smtpPass?: string;
}

/**
 * Gửi email qua SMTP Gmail bảo mật (Port 465 SSL/TLS) sử dụng cloudflare:sockets.
 * Tương thích 100% với Cloudflare Workers Edge Runtime.
 */
export async function sendEmail({
    to,
    subject,
    html,
    smtpUser = 'khietvidai@gmail.com',
    smtpPass = 'xxhqykiqphrcpjgj',
}: SendEmailParams): Promise<boolean> {
    if (!smtpUser || !smtpPass) {
        console.error('SMTP credentials missing');
        return false;
    }

    let socket;
    try {
        socket = connect(
            { hostname: 'smtp.gmail.com', port: 465 },
            { secureTransport: 'on', allowHalfOpen: false }
        );
    } catch (err) {
        console.error('Failed to connect to SMTP server via cloudflare:sockets:', err);
        return false;
    }

    const reader = socket.readable.getReader();
    const writer = socket.writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    async function readSMTPResponse(): Promise<string> {
        let buffer = '';
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value);
            const lines = buffer.split('\r\n');
            if (lines.length > 1) {
                const lastLine = lines[lines.length - 2];
                const match = lastLine.match(/^(\d{3})( |-)/);
                if (match && match[2] === ' ') {
                    break;
                }
            }
        }
        return buffer;
    }

    async function sendCmd(cmd: string): Promise<string> {
        await writer.write(encoder.encode(cmd + '\r\n'));
        return await readSMTPResponse();
    }

    try {
        const greeting = await readSMTPResponse();
        if (!greeting.startsWith('220')) {
            throw new Error('SMTP greeting failed: ' + greeting);
        }

        const ehloRes = await sendCmd('EHLO localhost');
        if (!ehloRes.startsWith('250')) {
            throw new Error('EHLO failed: ' + ehloRes);
        }

        const authRes = await sendCmd('AUTH LOGIN');
        if (!authRes.startsWith('334')) {
            throw new Error('AUTH LOGIN failed: ' + authRes);
        }

        const userBase64 = btoa(smtpUser);
        const userRes = await sendCmd(userBase64);
        if (!userRes.startsWith('334')) {
            throw new Error('Username authentication failed: ' + userRes);
        }

        const passBase64 = btoa(smtpPass);
        const passRes = await sendCmd(passBase64);
        if (!passRes.startsWith('235')) {
            throw new Error('Password authentication failed: ' + passRes);
        }

        const mailFromRes = await sendCmd(`MAIL FROM:<${smtpUser}>`);
        if (!mailFromRes.startsWith('250')) {
            throw new Error('MAIL FROM command failed: ' + mailFromRes);
        }

        const rcptToRes = await sendCmd(`RCPT TO:<${to}>`);
        if (!rcptToRes.startsWith('250')) {
            throw new Error('RCPT TO command failed: ' + rcptToRes);
        }

        const dataRes = await sendCmd('DATA');
        if (!dataRes.startsWith('354')) {
            throw new Error('DATA command failed: ' + dataRes);
        }

        const safeBtoa = (str: string) => {
            try {
                return btoa(unescape(encodeURIComponent(str)));
            } catch (_) {
                return btoa(str);
            }
        };

        const mimeSubject = `=?utf-8?B?${safeBtoa(subject)}?=`;
        const mimeBody = safeBtoa(html);

        const message = [
            `Subject: ${mimeSubject}`,
            `From: TRIZ Việt Nam <${smtpUser}>`,
            `To: <${to}>`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: base64',
            '',
            mimeBody,
            '.',
        ].join('\r\n');

        await writer.write(encoder.encode(message + '\r\n'));
        const sendRes = await readSMTPResponse();
        if (!sendRes.startsWith('250')) {
            throw new Error('Sending email body failed: ' + sendRes);
        }

        await sendCmd('QUIT');
        return true;
    } catch (err) {
        console.error('Error during SMTP transaction:', err);
        return false;
    } finally {
        try {
            reader.releaseLock();
            writer.releaseLock();
            await socket.close();
        } catch (_) {}
    }
}

/**
 * Gửi email thông báo tới Admin trizungdung2023@gmail.com khi có thành viên mới đăng ký.
 */
export async function notifyAdminNewUserRegistration(params: {
    userEmail: string;
    userName?: string | null;
    smtpUser?: string;
    smtpPass?: string;
}): Promise<boolean> {
    const { userEmail, userName, smtpUser, smtpPass } = params;
    const adminEmail = 'trizungdung2023@gmail.com';
    const timeVN = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thành viên mới đăng ký TRIZ Việt Nam</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.025em; }
            .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.95; }
            .body { padding: 28px 24px; font-size: 14px; line-height: 1.6; }
            .card { background: #f8fafc; border-radius: 12px; padding: 18px; margin: 18px 0; border: 1px solid #e2e8f0; }
            .row { margin-bottom: 10px; display: flex; }
            .row:last-child { margin-bottom: 0; }
            .label { font-weight: 600; color: #64748b; width: 140px; flex-shrink: 0; }
            .value { font-weight: 700; color: #0f172a; word-break: break-all; }
            .status-badge { display: inline-block; padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 9999px; font-weight: 700; font-size: 12px; border: 1px solid #fde68a; }
            .btn-wrapper { text-align: center; margin: 28px 0 16px 0; }
            .btn { display: inline-block; background: #7c3aed; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.3); }
            .footer { padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #f8fafc; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 THÀNH VIÊN MỚI ĐĂNG KÝ</h1>
                <p>Hệ thống Video Đào tạo Nội bộ TRIZ Việt Nam</p>
            </div>
            <div class="body">
                <p>Kính gửi <strong>Admin TRIZ Ứng Dụng</strong>,</p>
                <p>Hệ thống vừa ghi nhận một thành viên mới hoàn tất đăng ký tài khoản qua Google OAuth:</p>
                
                <div class="card">
                    <div class="row"><span class="label">Họ và tên:</span> <span class="value">${userName || 'Chưa cung cấp'}</span></div>
                    <div class="row"><span class="label">Email đăng ký:</span> <span class="value" style="color: #7c3aed; font-family: monospace;">${userEmail}</span></div>
                    <div class="row"><span class="label">Thời gian:</span> <span class="value">${timeVN}</span></div>
                    <div class="row"><span class="label">Phương thức:</span> <span class="value">Google Account</span></div>
                    <div class="row" style="margin-top: 12px;"><span class="label">Trạng thái hiện tại:</span> <span class="status-badge">⏳ Chờ duyệt mở khóa</span></div>
                </div>

                <p style="color: #475569; font-size: 13px; line-height: 1.5;">
                    💡 <strong>Ghi chú quyền hạn:</strong> Thành viên này hiện chỉ có thể xem tự do <strong>Bài 1 &amp; 2</strong>. Các bài giảng từ <strong>Bài 3 đến Bài 7</strong> đang được khóa an toàn. Bạn có thể bấm vào nút bên dưới để duyệt kích hoạt cho thành viên này bất kỳ lúc nào.
                </p>

                <div class="btn-wrapper">
                    <a href="https://trizvietnam.com/vi/admin/users" class="btn" target="_blank">
                        👉 Vào Trang Quản Lý Duyệt Thành Viên
                    </a>
                </div>
            </div>
            <div class="footer">
                Email thông báo tự động từ trizvietnam.com • Được gửi qua hạ tầng khietvidai@gmail.com
            </div>
        </div>
    </body>
    </html>
    `;

    return await sendEmail({
        to: adminEmail,
        subject: `[TRIZ Việt Nam] 🔔 Có thành viên mới đăng ký: ${userEmail}`,
        html,
        smtpUser,
        smtpPass,
    });
}
