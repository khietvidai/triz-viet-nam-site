import fs from 'node:fs';
import path from 'node:path';

const ADMIN_SECRET = 'fe2f3cc76f878f96399862460e2fcb2f';
const BASE_URL = 'https://triz-ai-solver.khietvidai.workers.dev';
const CHUNK_SIZE = 25 * 1024 * 1024; // 25 MB
const CONCURRENCY = 2;
const VIDEO_DIR = '/Users/nguyenkhiet/trizvietnam/video-triz';
const MANIFEST_PATH = '/Users/nguyenkhiet/trizvietnam/src/Data/noibo_videos.json';

async function uploadFile(filePath, fileKey) {
    const stat = fs.statSync(filePath);
    const totalSize = stat.size;
    const totalParts = Math.ceil(totalSize / CHUNK_SIZE);

    console.log(`Starting upload:`);
    console.log(`- File: ${filePath}`);
    console.log(`- Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB (${totalSize} bytes)`);
    console.log(`- R2 Key: ${fileKey}`);
    console.log(`- Parts: ${totalParts} (chunk size: ${CHUNK_SIZE / 1024 / 1024} MB, concurrency: ${CONCURRENCY})`);

    // 1. Create multipart upload
    console.log('[1/3] Initiating multipart upload...');
    const createRes = await fetch(
        `${BASE_URL}/api/noibo/upload?action=create&fileKey=${encodeURIComponent(fileKey)}`,
        {
            method: 'POST',
            headers: {
                'x-admin-secret': ADMIN_SECRET,
                'Origin': BASE_URL,
            },
        }
    );

    if (!createRes.ok) {
        throw new Error(`Failed to create multipart upload: ${createRes.status} ${await createRes.text()}`);
    }

    const { uploadId } = await createRes.json();
    console.log(`Upload initialized with uploadId: ${uploadId}`);

    // 2. Upload parts with concurrency
    console.log('[2/3] Uploading parts...');
    const fd = fs.openSync(filePath, 'r');
    const parts = [];
    let completedCount = 0;
    const startTime = Date.now();

    const tasks = [];
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        tasks.push(partNumber);
    }

    async function uploadWorker() {
        while (tasks.length > 0) {
            const partNumber = tasks.shift();
            const offset = (partNumber - 1) * CHUNK_SIZE;
            const currentChunkSize = Math.min(CHUNK_SIZE, totalSize - offset);
            const buffer = Buffer.alloc(currentChunkSize);
            fs.readSync(fd, buffer, 0, currentChunkSize, offset);

            let success = false;
            let lastErr = null;

            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const startTs = Date.now();
                    const partRes = await fetch(
                        `${BASE_URL}/api/noibo/upload?action=part&fileKey=${encodeURIComponent(fileKey)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${partNumber}`,
                        {
                            method: 'POST',
                            headers: {
                                'x-admin-secret': ADMIN_SECRET,
                                'Origin': BASE_URL,
                                'Content-Type': 'application/octet-stream',
                            },
                            body: buffer,
                            duplex: 'half',
                        }
                    );

                    if (!partRes.ok) {
                        throw new Error(`Status ${partRes.status}: ${await partRes.text()}`);
                    }

                    const partData = await partRes.json();
                    parts.push({
                        partNumber: partData.partNumber,
                        etag: partData.etag,
                    });

                    completedCount++;
                    const durationSec = ((Date.now() - startTs) / 1000).toFixed(1);
                    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(0);
                    const percent = ((completedCount / totalParts) * 100).toFixed(1);
                    console.log(
                        `  ✓ Part ${partNumber}/${totalParts} (${(currentChunkSize / 1024 / 1024).toFixed(1)} MB) in ${durationSec}s | Total: ${completedCount}/${totalParts} [${percent}%] (${totalElapsed}s)`
                    );
                    success = true;
                    break;
                } catch (err) {
                    console.warn(`  ⚠ Part ${partNumber} attempt ${attempt} failed: ${err.message}. Retrying...`);
                    lastErr = err;
                    await new Promise((r) => setTimeout(r, 2000));
                }
            }

            if (!success) {
                throw new Error(`Failed to upload part ${partNumber} after 3 attempts: ${lastErr?.message}`);
            }
        }
    }

    try {
        const workers = Array.from({ length: CONCURRENCY }, () => uploadWorker());
        await Promise.all(workers);
    } catch (err) {
        console.error('\nUpload error, aborting upload session...');
        await fetch(
            `${BASE_URL}/api/noibo/upload?action=abort&fileKey=${encodeURIComponent(fileKey)}&uploadId=${encodeURIComponent(uploadId)}`,
            {
                method: 'POST',
                headers: {
                    'x-admin-secret': ADMIN_SECRET,
                    'Origin': BASE_URL,
                },
            }
        ).catch(() => {});
        throw err;
    } finally {
        fs.closeSync(fd);
    }

    // Sort parts before completion
    parts.sort((a, b) => a.partNumber - b.partNumber);

    // 3. Complete multipart upload
    console.log('[3/3] Completing multipart upload...');
    const completeRes = await fetch(
        `${BASE_URL}/api/noibo/upload?action=complete&fileKey=${encodeURIComponent(fileKey)}&uploadId=${encodeURIComponent(uploadId)}`,
        {
            method: 'POST',
            headers: {
                'x-admin-secret': ADMIN_SECRET,
                'Origin': BASE_URL,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ parts }),
        }
    );

    if (!completeRes.ok) {
        throw new Error(`Failed to complete multipart upload: ${completeRes.status} ${await completeRes.text()}`);
    }

    const result = await completeRes.json();
    console.log(`🎉 Finished upload for ${fileKey}! Size: ${(result.size / 1024 / 1024).toFixed(2)} MB\n`);
    return result;
}

async function main() {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

    console.log('Fetching remote R2 object list...');
    const listRes = await fetch(`${BASE_URL}/api/noibo/upload?key=${ADMIN_SECRET}&action=list`);
    const listData = await listRes.json();
    const remoteObjects = new Map(listData.objects.map((o) => [o.key, o.size]));

    console.log(`Currently on R2 (${remoteObjects.size} objects):`);
    for (const [key, size] of remoteObjects.entries()) {
        console.log(` - ${key}: ${(size / 1024 / 1024).toFixed(2)} MB`);
    }

    console.log('\n========================================');
    console.log('CHECKING ALL 7 LESSON VIDEOS:');
    console.log('========================================\n');

    const toUpload = [];
    for (const item of manifest) {
        const filePath = path.join(VIDEO_DIR, item.sourceFile);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ [FILE MISSING] ${item.sourceFile}`);
            continue;
        }

        const localSize = fs.statSync(filePath).size;
        const remoteSize = remoteObjects.get(item.key);

        if (remoteSize && remoteSize === localSize) {
            console.log(`✅ [ALREADY UPLOADED] ${item.title} -> ${item.key} (${(localSize / 1024 / 1024).toFixed(2)} MB)`);
        } else {
            console.log(`⏳ [PENDING UPLOAD]   ${item.title} -> ${item.key} (${(localSize / 1024 / 1024).toFixed(2)} MB)`);
            toUpload.push({ item, filePath, localSize });
        }
    }

    if (toUpload.length === 0) {
        console.log('\n🎉 All videos are already uploaded to Cloudflare R2! Nothing to do.');
        return;
    }

    console.log(`\nFound ${toUpload.length} video(s) to upload. Starting upload sequence...\n`);

    for (let i = 0; i < toUpload.length; i++) {
        const { item, filePath } = toUpload[i];
        console.log(`\n------------------------------------------------------------`);
        console.log(`>>> [${i + 1}/${toUpload.length}] UPLOADING: ${item.title} (${item.key})`);
        console.log(`------------------------------------------------------------`);
        await uploadFile(filePath, item.key);
    }

    console.log('\n========================================');
    console.log('ALL VIDEOS HAVE BEEN SUCCESSFULLY UPLOADED TO R2!');
    console.log('========================================');
}

main().catch((err) => {
    console.error('Fatal batch error:', err);
    process.exit(1);
});
