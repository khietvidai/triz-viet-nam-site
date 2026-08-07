/**
 * Sinh khung dữ liệu bài giảng cho 40 nguyên tắc sáng tạo.
 *
 * Chạy: node scripts/generate-lesson-skeleton.mjs
 *
 * Script CHỈ tạo mục còn thiếu — các mục đã có nội dung sẽ được giữ nguyên,
 * nên chạy lại nhiều lần vẫn an toàn sau khi bạn đã soạn bài.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const LANGS = [
    { lang: 'vi', principles: 'src/Data/40principles_vi.json' },
    { lang: 'en', principles: 'src/Data/40principles.json' },
];

const outPath = (lang) => `src/Data/principle-lessons_${lang}.json`;

/** Khung rỗng cho một nguyên tắc — đây là định dạng bạn điền nội dung vào. */
function emptyLesson(id, title) {
    return {
        id,
        title,
        // Mục 1 — BÀI GIẢNG (chỉ người được phép mới xem được)
        lecture: {
            summary: '',
            body: [],
        },
        // Mục 2 — TÌNH HUỐNG NGHIÊN CỨU (công khai)
        cases: [],
        // Mục 3 — MINH HỌA VẬN DỤNG TRIZ GIẢI QUYẾT VẤN ĐỀ (công khai)
        illustrations: [],
    };
}

function hasContent(lesson) {
    return (
        lesson.lecture?.summary ||
        lesson.lecture?.body?.length ||
        lesson.cases?.length ||
        lesson.illustrations?.length
    );
}

for (const { lang, principles } of LANGS) {
    const source = JSON.parse(await readFile(principles, 'utf-8'));
    const target = outPath(lang);

    const existing = existsSync(target)
        ? JSON.parse(await readFile(target, 'utf-8'))
        : [];
    const byId = new Map(existing.map((lesson) => [lesson.id, lesson]));

    const merged = source.map(({ id, title }) => {
        const current = byId.get(id);
        // Giữ nguyên mục đã soạn, chỉ đồng bộ lại tiêu đề.
        return current && hasContent(current)
            ? { ...current, title }
            : emptyLesson(id, title);
    });

    await writeFile(target, `${JSON.stringify(merged, null, 2)}\n`, 'utf-8');

    const filled = merged.filter(hasContent).length;
    console.log(`${target}: ${merged.length} nguyên tắc, ${filled} đã có nội dung`);
}
