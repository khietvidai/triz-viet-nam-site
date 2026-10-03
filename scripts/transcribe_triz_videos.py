import os
import sys
import json
import time
import subprocess
import mlx_whisper

VIDEO_DIR = '/Users/nguyenkhiet/trizvietnam/video-triz'
OUTPUT_DIR = '/Users/nguyenkhiet/trizvietnam/video-triz/transcripts'
MODEL_NAME = 'mlx-community/whisper-large-v3-turbo'

TARGET_FILES = [
    '1 - 5 PRINCIPLE.mp4',
    '6 - 11 PRINCIPLES.mp4',
    '12 - 18 PRINCIPLE.mp4',
    '19 - 24 PRINCIPLES.mp4',
    '25 - 29 PRINCIPLES.mp4',
    '30-35 PRINCIPLE.mp4',
    '36 - 40 PRINCIPLES.mp4'
]

def format_timestamp_srt(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int(round((seconds - int(seconds)) * 1000))
    if millis >= 1000:
        millis = 999
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

def format_timestamp_vtt(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int(round((seconds - int(seconds)) * 1000))
    if millis >= 1000:
        millis = 999
    return f"{hrs:02d}:{mins:02d}:{secs:02d}.{millis:03d}"

def format_time_simple(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    if hrs > 0:
        return f"{hrs:02d}:{mins:02d}:{secs:02d}"
    return f"{mins:02d}:{secs:02d}"

def save_transcripts(base_name: str, result: dict):
    segments = result.get('segments', [])
    
    # 1. JSON
    json_path = os.path.join(OUTPUT_DIR, f"{base_name}.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
        
    # 2. SRT
    srt_path = os.path.join(OUTPUT_DIR, f"{base_name}.srt")
    with open(srt_path, 'w', encoding='utf-8') as f:
        for idx, seg in enumerate(segments, start=1):
            start = format_timestamp_srt(seg['start'])
            end = format_timestamp_srt(seg['end'])
            text = seg['text'].strip()
            f.write(f"{idx}\n{start} --> {end}\n{text}\n\n")
            
    # 3. VTT
    vtt_path = os.path.join(OUTPUT_DIR, f"{base_name}.vtt")
    with open(vtt_path, 'w', encoding='utf-8') as f:
        f.write("WEBVTT\n\n")
        for idx, seg in enumerate(segments, start=1):
            start = format_timestamp_vtt(seg['start'])
            end = format_timestamp_vtt(seg['end'])
            text = seg['text'].strip()
            f.write(f"{idx}\n{start} --> {end}\n{text}\n\n")
            
    # 4. Readable TXT with timestamps & paragraphs
    txt_path = os.path.join(OUTPUT_DIR, f"{base_name}.txt")
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(f"# BẢN TRANSCRIPT: {base_name}\n")
        f.write(f"# Tổng số đoạn: {len(segments)}\n\n")
        
        current_para = []
        para_start = 0.0
        
        for seg in segments:
            text = seg['text'].strip()
            if not text:
                continue
            if not current_para:
                para_start = seg['start']
                current_para.append(text)
            else:
                current_para.append(text)
                # Break into paragraph if gap is > 2s or segment reaches ~5 sentences
                if len(current_para) >= 4 or text.endswith(('.', '?', '!')):
                    if len(current_para) >= 3:
                        f.write(f"[{format_time_simple(para_start)}] " + " ".join(current_para) + "\n\n")
                        current_para = []
                        
        if current_para:
            f.write(f"[{format_time_simple(para_start)}] " + " ".join(current_para) + "\n\n")
            
    print(f"  -> Saved .txt, .srt, .vtt, .json to {OUTPUT_DIR}/{base_name}.*")

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("==================================================================")
    print(f"BẮT ĐẦU TRANSCRIPT {len(TARGET_FILES)} VIDEO TRIZ BẰNG MLX-WHISPER")
    print(f"Model: {MODEL_NAME} (Language: vi)")
    print(f"Thư mục xuất: {OUTPUT_DIR}")
    print("==================================================================\n")
    sys.stdout.flush()

    total_start = time.time()
    completed = 0

    for i, file_name in enumerate(TARGET_FILES, 1):
        video_path = os.path.join(VIDEO_DIR, file_name)
        base_name = os.path.splitext(file_name)[0]
        
        # Check if already processed
        srt_path = os.path.join(OUTPUT_DIR, f"{base_name}.srt")
        txt_path = os.path.join(OUTPUT_DIR, f"{base_name}.txt")
        if os.path.exists(srt_path) and os.path.exists(txt_path):
            print(f"[{i}/{len(TARGET_FILES)}] [ĐÃ CÓ SẴN - BỎ QUA] {file_name}")
            sys.stdout.flush()
            completed += 1
            continue

        if not os.path.exists(video_path):
            print(f"[{i}/{len(TARGET_FILES)}] ⚠️ KHÔNG TÌM THẤY FILE: {video_path}")
            sys.stdout.flush()
            continue

        print(f"\n------------------------------------------------------------------")
        print(f"[{i}/{len(TARGET_FILES)}] ĐANG XỬ LÝ: {file_name}")
        file_size_mb = os.path.getsize(video_path) / 1024 / 1024
        print(f"Dung lượng file: {file_size_mb:.2f} MB")
        sys.stdout.flush()

        step_start = time.time()
        try:
            print("Đang chạy mlx_whisper.transcribe...")
            sys.stdout.flush()
            result = mlx_whisper.transcribe(
                video_path,
                path_or_hf_repo=MODEL_NAME,
                language='vi'
            )
            elapsed = time.time() - step_start
            num_segments = len(result.get('segments', []))
            print(f"✓ Hoàn thành trong {elapsed:.1f}s ({elapsed/60:.2f} phút) | {num_segments} đoạn lời thoại")
            
            save_transcripts(base_name, result)
            completed += 1
            sys.stdout.flush()
        except Exception as e:
            print(f"❌ Lỗi khi xử lý {file_name}: {e}")
            sys.stdout.flush()

    total_elapsed = time.time() - total_start
    print("\n==================================================================")
    print(f"HOÀN THÀNH: {completed}/{len(TARGET_FILES)} files trong {total_elapsed/60:.2f} phút.")
    print(f"Tất cả file transcript lưu tại: {OUTPUT_DIR}")
    print("==================================================================")
    sys.stdout.flush()

if __name__ == '__main__':
    main()
