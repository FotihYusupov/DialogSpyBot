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
    return dateObj.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}
function formatTimeOnly(d) {
    if (!d)
        return '00:00';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime()))
        return '00:00';
    return dateObj.toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
    });
}
function formatDateTitle(d) {
    if (!d)
        return '';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime()))
        return '';
    const day = dateObj.getDate();
    const months = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    const month = months[dateObj.getMonth()] || '';
    const year = dateObj.getFullYear();
    return `${day}-${month}, ${year}`;
}
function sanitizeText(str) {
    if (!str)
        return '';
    return str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}
async function generateChatPdf(options) {
    return new Promise((resolve, reject) => {
        try {
            const fileName = `chat_${options.chatId}_${Date.now()}_tg_chat.pdf`;
            const outPath = path.join(os.tmpdir(), fileName);
            const writeStream = fs.createWriteStream(outPath);
            const pageWidth = 595.28;
            const pageHeight = 841.89;
            const margin = 36;
            const printableWidth = pageWidth - margin * 2;
            const doc = new pdfkit_1.default({
                margin,
                size: 'A4',
                bufferPages: true,
            });
            doc.pipe(writeStream);
            const fontPath = getSystemFont();
            if (fontPath) {
                doc.font(fontPath);
            }
            const drawWallpaper = () => {
                doc.rect(0, 0, pageWidth, pageHeight).fill('#eef3f8');
            };
            drawWallpaper();
            const totalCount = options.messages.length;
            const deletedCount = options.messages.filter((m) => m.is_deleted).length;
            const editedCount = options.messages.filter((m) => m.is_edited).length;
            const fromStr = options.fromDate ? formatDate(options.fromDate) : 'Boshlang\'ich';
            const toStr = options.toDate ? formatDate(options.toDate) : formatDate(new Date());
            doc.rect(0, 0, pageWidth, 74).fill('#242f3d');
            doc.fillColor('#ffffff').fontSize(13).text('TrackMyChatBot — Telegram Chat Tarixi', 36, 16);
            doc.fillColor('#7dd3fc').fontSize(9.5).text(`Chat: ${sanitizeText(options.chatTitle)} | Telegram ID: ${options.chatId}`, 36, 36);
            doc.fillColor('#94a3b8').fontSize(8).text(`Davr: ${fromStr} — ${toStr} | Jami xabarlar: ${totalCount} ta | O'chirilgan: ${deletedCount} ta | Tahrirlangan: ${editedCount} ta`, 36, 52);
            doc.y = 88;
            if (totalCount === 0) {
                doc.moveDown(3);
                doc.fillColor('#64748b').fontSize(11).text('Ushbu chat bo\'yicha saqlangan xabarlar topilmadi.', { align: 'center' });
            }
            else {
                let lastDateKey = '';
                for (let i = 0; i < options.messages.length; i++) {
                    const msg = options.messages[i];
                    const isOutgoing = msg.sender_id === options.ownerId;
                    const isDeleted = !!msg.is_deleted;
                    const isEdited = !!msg.is_edited;
                    const msgDate = msg.date || msg.createdAt || new Date();
                    const dateKey = formatDate(msgDate);
                    const timeStr = formatTimeOnly(msgDate);
                    if (dateKey !== lastDateKey) {
                        lastDateKey = dateKey;
                        const dateTitle = formatDateTitle(msgDate);
                        if (doc.y > 750) {
                            doc.addPage();
                            drawWallpaper();
                            doc.y = 36;
                        }
                        const pillWidth = Math.max(120, doc.widthOfString(dateTitle) + 24);
                        const pillX = (pageWidth - pillWidth) / 2;
                        const pillY = doc.y + 4;
                        doc.roundedRect(pillX, pillY, pillWidth, 18, 9).fill('#475569');
                        doc.fillColor('#f8fafc').fontSize(8.5).text(dateTitle, pillX, pillY + 4, {
                            width: pillWidth,
                            align: 'center',
                        });
                        doc.y = pillY + 24;
                    }
                    let senderLabel = '';
                    if (isOutgoing) {
                        senderLabel = 'Siz';
                    }
                    else if (msg.sender_first_name) {
                        senderLabel = `${msg.sender_first_name}${msg.sender_last_name ? ' ' + msg.sender_last_name : ''}${msg.sender_username ? ` (@${msg.sender_username})` : ''}`;
                    }
                    else {
                        senderLabel = sanitizeText(options.chatTitle) || `User ${msg.sender_id || ''}`;
                    }
                    const textContent = sanitizeText(msg.text || (msg.media_type ? '' : '[Bo\'sh xabar]'));
                    const padding = 10;
                    const maxBubbleWidth = 350;
                    const contentWidth = maxBubbleWidth - padding * 2;
                    let textHeight = 0;
                    if (textContent) {
                        textHeight = doc.heightOfString(textContent, { width: contentWidth });
                        if (textHeight < 14)
                            textHeight = 14;
                    }
                    const mediaHeight = msg.media_type ? 24 : 0;
                    let editHistoryHeight = 0;
                    if (isEdited && msg.edit_history && msg.edit_history.length > 0) {
                        editHistoryHeight = msg.edit_history.length * 13 + 18;
                    }
                    const bubbleHeight = 18 + mediaHeight + textHeight + editHistoryHeight + 16;
                    const textMeasuredWidth = doc.widthOfString(textContent || senderLabel);
                    const bubbleWidth = Math.max(170, Math.min(maxBubbleWidth, textMeasuredWidth + padding * 2 + 50));
                    if (doc.y + bubbleHeight > 780) {
                        doc.addPage();
                        drawWallpaper();
                        doc.y = 36;
                    }
                    const bubbleY = doc.y;
                    const bubbleX = isOutgoing ? (pageWidth - margin - bubbleWidth) : margin;
                    let bgFill = isOutgoing ? '#effdd9' : '#ffffff';
                    let borderColor = isOutgoing ? '#d1f4a5' : '#d9e2ec';
                    if (isDeleted) {
                        bgFill = isOutgoing ? '#fecdd3' : '#fee2e2';
                        borderColor = '#fca5a5';
                    }
                    doc.roundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8).fill(bgFill).stroke(borderColor);
                    const senderColor = isOutgoing ? '#15803d' : '#0284c7';
                    doc.fillColor(senderColor).fontSize(8.5).text(senderLabel, bubbleX + padding, bubbleY + 6, { width: bubbleWidth - padding * 2 - (isDeleted ? 80 : 0) });
                    if (isDeleted) {
                        doc.fillColor('#dc2626').fontSize(7.5).text('[O\'CHIRILGAN]', bubbleX + bubbleWidth - padding - 80, bubbleY + 6, { width: 80, align: 'right' });
                    }
                    let currentContentY = bubbleY + 20;
                    if (msg.media_type) {
                        const mediaBg = isOutgoing ? '#dcf7c5' : '#f1f5f9';
                        doc.rect(bubbleX + padding, currentContentY, bubbleWidth - padding * 2, 18).fill(mediaBg);
                        doc.fillColor('#334155').fontSize(8).text(`📎 ${sanitizeText(msg.media_type)}`, bubbleX + padding + 6, currentContentY + 4, { width: bubbleWidth - padding * 2 - 12 });
                        currentContentY += 22;
                    }
                    if (textContent) {
                        const textColor = isDeleted ? '#7f1d1d' : '#0f172a';
                        doc.fillColor(textColor).fontSize(9.5).text(textContent, bubbleX + padding, currentContentY, { width: contentWidth });
                        currentContentY += textHeight + 4;
                    }
                    if (isEdited && msg.edit_history && msg.edit_history.length > 0) {
                        const histBg = isOutgoing ? '#e2f7c0' : '#f8fafc';
                        const histBorder = isOutgoing ? '#c3e8a7' : '#e2e8f0';
                        doc.rect(bubbleX + padding, currentContentY, bubbleWidth - padding * 2, editHistoryHeight)
                            .fill(histBg)
                            .stroke(histBorder);
                        doc.fillColor('#b45309').fontSize(7.5).text('Asl matn (tahrirlanishdan oldin):', bubbleX + padding + 5, currentContentY + 3);
                        let histItemY = currentContentY + 14;
                        for (const h of msg.edit_history) {
                            const hTime = h.date ? formatTimeOnly(h.date) : '';
                            doc.fillColor('#78350f').fontSize(7.5).text(`• "${sanitizeText(h.text)}" ${hTime ? `(${hTime})` : ''}`, bubbleX + padding + 8, histItemY, { width: bubbleWidth - padding * 2 - 16 });
                            histItemY += 13;
                        }
                        currentContentY += editHistoryHeight + 4;
                    }
                    const timeMeta = `${timeStr}${isOutgoing ? ' ✓✓' : ''}${isEdited ? ' (tahrirlangan)' : ''}`;
                    doc.fillColor('#64748b').fontSize(7.5).text(timeMeta, bubbleX + padding, bubbleY + bubbleHeight - 12, { width: bubbleWidth - padding * 2, align: 'right' });
                    doc.y = bubbleY + bubbleHeight + 8;
                }
            }
            const pages = doc.bufferedPageRange();
            for (let p = 0; p < pages.count; p++) {
                doc.switchToPage(p);
                doc.rect(36, 805, printableWidth, 1).fill('#cbd5e1');
                doc.fillColor('#64748b').fontSize(8).text('TrackMyChatBot — Xavfsiz Telegram Chat Audit Hisoboti', 36, 812, { align: 'left' });
                doc.fillColor('#64748b').fontSize(8).text(`Sahifa ${p + 1} / ${pages.count}`, 36, 812, { width: printableWidth, align: 'right' });
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