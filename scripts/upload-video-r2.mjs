import fs from 'node:fs';
import path from 'node:path';

const ADMIN_SECRET = 'fe2f3cc76f878f96399862460e2fcb2f';
const BASE_URL = 'https://triz-ai-solver.khietvidai.workers.dev';
const CHUNK_SIZE = 25 * 1024 * 1024; // 25 MB

async function uploadFile(filePath, fileKey) {
    const stat = fs.statSync(filePath);
    const totalSize = stat.size;
    const totalParts = Math.ceil(totalSize / CHUNK_SIZE);

    console.log(`Starting upload:`);
    console.log(`- File: ${filePath}`);
    console.log(`- Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB (${totalSize} bytes)`);
    console.log(`- R2 Key: ${fileKey}`);
    console.log(`- Parts: ${totalParts} (chunk size: ${CHUNK_SIZE / 1024 / 1024} MB)`);

    // 1. Create multipart upload
    console.log('\n[1/3] Initiating multipart upload...');
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

    // 2. Upload parts
    console.log('\n[2/3] Uploading parts...');
    const fd = fs.openSync(filePath, 'r');
    const parts = [];

    try {
        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
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

                    const durationSec = ((Date.now() - startTs) / 1000).toFixed(1);
                    const percent = (((offset + currentChunkSize) / totalSize) * 100).toFixed(1);
                    console.log(
                        `  ✓ Part ${partNumber}/${totalParts} (${(currentChunkSize / 1024 / 1024).toFixed(1)} MB) uploaded in ${durationSec}s [${percent}%]`
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

    // 3. Complete multipart upload
    console.log('\n[3/3] Completing multipart upload...');
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
    console.log(`\n🎉 Upload completed successfully!`);
    console.log(`- Object key: ${result.key}`);
    console.log(`- Object size: ${(result.size / 1024 / 1024).toFixed(2)} MB`);
    return result;
}

const filePath = process.argv[2] || '/Users/nguyenkhiet/trizvietnam/video-triz/12 - 18 PRINCIPLE.mp4';
const fileKey = process.argv[3] || 'principles-12-18.mp4';

uploadFile(filePath, fileKey).catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
