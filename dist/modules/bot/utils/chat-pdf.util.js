"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChatPdf = generateChatPdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
function getSystemFont() {
    const candidates = [
        'C:/Windows/Fonts/arial.ttf',
        'C:/Windows/Fonts/segoeui.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    return undefined;
}
function formatDate(d) {
    if (!d)
        return 'N/A';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime()))
        return 'N/A';
    return dateObj.toLocaleString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
function formatShortDate(d) {
    if (!d)
        return 'N/A';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime()))
        return 'N/A';
    return dateObj.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}
function sanitizeText(str) {
    if (!str)
        return '';
    return str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}
async function generateChatPdf(options) {
    return new Promise((resolve, reject) => {
        try {
            const sanitizedTitle = (options.chatTitle || `chat_${options.chatId}`)
                .replace(/[^a-zA-Z0-9_\-]/g, '_')
                .substring(0, 25);
            const fileName = `chat_${options.chatId}_${Date.now()}_audit.pdf`;
            const outPath = path.join(os.tmpdir(), fileName);
            const writeStream = fs.createWriteStream(outPath);
            const doc = new pdfkit_1.default({
                margin: 36,
                size: 'A4',
                bufferPages: true,
            });
            doc.pipe(writeStream);
            const fontPath = getSystemFont();
            if (fontPath) {
                doc.font(fontPath);
            }
            const totalCount = options.messages.length;
            const deletedCount = options.messages.filter((m) => m.is_deleted).length;
            const editedCount = options.messages.filter((m) => m.is_edited).length;
            const fromStr = options.fromDate ? formatShortDate(options.fromDate) : 'Boshlang\'ich';
            const toStr = options.toDate ? formatShortDate(options.toDate) : formatShortDate(new Date());
            doc.rect(36, 36, 523, 76).fill('#0f172a');
            doc.fillColor('#38bdf8').fontSize(14).text('TrackMyChatBot — Chat Tarixi (Audit Log)', 50, 48);
            doc.fillColor('#f8fafc').fontSize(10).text(`Chat: ${sanitizeText(options.chatTitle)} | ID: ${options.chatId}`, 50, 68);
            doc.fillColor('#94a3b8').fontSize(9).text(`Davr: ${fromStr} — ${toStr} (Oxirgi 7 kun) | Jami: ${totalCount} ta | O'chirilgan: ${deletedCount} ta | Tahrirlangan: ${editedCount} ta`, 50, 84);
            doc.y = 125;
            if (totalCount === 0) {
                doc.moveDown(2);
                doc.fillColor('#64748b').fontSize(11).text('Ushbu chat bo\'yicha oxirgi 7 kunda xabarlar topilmadi.', { align: 'center' });
            }
            else {
                for (let i = 0; i < options.messages.length; i++) {
                    const msg = options.messages[i];
                    const isDeleted = !!msg.is_deleted;
                    const isEdited = !!msg.is_edited;
                    const msgDate = msg.date || msg.createdAt || new Date();
                    const timeStr = formatDate(msgDate);
                    const senderName = msg.sender_first_name
                        ? `${msg.sender_first_name}${msg.sender_last_name ? ' ' + msg.sender_last_name : ''}${msg.sender_username ? ` (@${msg.sender_username})` : ''}`
                        : (msg.sender_id === options.ownerId ? 'Siz (Owner)' : `User ${msg.sender_id || 'Unknown'}`);
                    const mediaInfo = msg.media_type ? `[Media: ${msg.media_type}] ` : '';
                    const textContent = sanitizeText(msg.text || (msg.media_type ? '[Media fayl]' : '[Bo\'sh xabar]'));
                    let textHeight = doc.heightOfString(mediaInfo + textContent, { width: 500 });
                    if (textHeight < 14)
                        textHeight = 14;
                    let editHistoryHeight = 0;
                    if (isEdited && msg.edit_history && msg.edit_history.length > 0) {
                        editHistoryHeight = msg.edit_history.length * 14 + 16;
                    }
                    const cardHeight = 28 + textHeight + editHistoryHeight + 10;
                    if (doc.y + cardHeight > 780) {
                        doc.addPage();
                        doc.y = 40;
                    }
                    const cardY = doc.y;
                    let bgFill = '#f8fafc';
                    let borderColor = '#e2e8f0';
                    if (isDeleted) {
                        bgFill = '#fef2f2';
                        borderColor = '#fca5a5';
                    }
                    else if (isEdited) {
                        bgFill = '#fffbeb';
                        borderColor = '#fcd34d';
                    }
                    doc.rect(36, cardY, 523, cardHeight).fill(bgFill).stroke(borderColor);
                    doc.fillColor('#0284c7').fontSize(9).text(`${i + 1}. ${senderName} — ${timeStr}`, 46, cardY + 8);
                    if (isDeleted) {
                        doc.fillColor('#dc2626').fontSize(8).text('[O\'CHIRILGAN / DELETED]', 410, cardY + 8, { width: 140, align: 'right' });
                    }
                    else if (isEdited) {
                        doc.fillColor('#d97706').fontSize(8).text('[TAHRIRLANGAN / EDITED]', 410, cardY + 8, { width: 140, align: 'right' });
                    }
                    else {
                        doc.fillColor('#10b981').fontSize(8).text('[Oddiy]', 460, cardY + 8, { width: 90, align: 'right' });
                    }
                    doc.fillColor('#1e293b').fontSize(9.5).text(`${mediaInfo}${textContent}`, 46, cardY + 24, { width: 500 });
                    if (isEdited && msg.edit_history && msg.edit_history.length > 0) {
                        let histY = cardY + 28 + textHeight;
                        doc.fillColor('#92400e').fontSize(8).text('Tahrirlanishdan oldingi asl matnlar:', 46, histY);
                        histY += 12;
                        for (const h of msg.edit_history) {
                            const hDate = h.date ? formatDate(h.date) : '';
                            doc.fillColor('#78350f').fontSize(8).text(`• "${sanitizeText(h.text)}" ${hDate ? `(${hDate})` : ''}`, 54, histY, { width: 490 });
                            histY += 14;
                        }
                    }
                    doc.y = cardY + cardHeight + 6;
                }
            }
            const pages = doc.bufferedPageRange();
            for (let p = 0; p < pages.count; p++) {
                doc.switchToPage(p);
                doc.rect(36, 805, 523, 1).fill('#e2e8f0');
                doc.fillColor('#94a3b8').fontSize(8).text('TrackMyChatBot — Xavfsiz Shaxsiy Audit Hisoboti', 36, 812, { align: 'left' });
                doc.fillColor('#94a3b8').fontSize(8).text(`Sahifa ${p + 1} / ${pages.count}`, 36, 812, { align: 'right' });
            }
            doc.end();
            writeStream.on('finish', () => {
                resolve(outPath);
            });
            writeStream.on('error', (err) => {
                reject(err);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
//# sourceMappingURL=chat-pdf.util.js.map