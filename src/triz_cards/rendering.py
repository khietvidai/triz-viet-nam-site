from __future__ import annotations

import io
import math
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from . import core

MM=72/25.4
W,H=76*MM,126*MM
BG='#F7F3E9';NAVY='#163447';TEAL='#268B88';ORANGE='#E99049';MUTED='#536774'
TEMPLATE='cards-1.0'

def fonts():
    cfg=core.config()
    for name,path in [('Noto',cfg.font_regular),('NotoBold',cfg.font_bold)]:
        if name not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(name,str(core.ROOT/path)))

def lines(text,font,size,width):
    result=[];line=''
    for word in text.split():
        if pdfmetrics.stringWidth(word,font,size)>width:
            raise ValueError(f'Unbreakable word exceeds frame: {word}')
        attempt=f'{line} {word}'.strip()
        if pdfmetrics.stringWidth(attempt,font,size)>width:
            result.append(line);line=word
        else:line=attempt
    if line:result.append(line)
    return result

def block(cv,text,x,top,width,size=10,font='Noto',color=NAVY,leading=None,max_lines=None,bottom=None):
    leading=leading or size*1.28
    wrapped=lines(text,font,size,width)
    if max_lines and len(wrapped)>max_lines:
        raise ValueError(f'Title has {len(wrapped)} lines (> {max_lines}): {text}')
    height=len(wrapped)*leading
    if bottom is not None and top-height<bottom:
        raise ValueError(f'Text overflows by {bottom-(top-height):.1f} pt: {text[:75]}')
    cv.setFillColor(HexColor(color));cv.setFont(font,size)
    for n,line in enumerate(wrapped):cv.drawString(x,top-size-n*leading,line)
    return top-height

def title_vi(text):
    """Sentence-case the locked display name for a card title without changing source data."""
    return text[:1].upper()+text[1:] if text else text

def arrow(cv,x1,y1,x2,y2,color=ORANGE,width=1.3):
    cv.setStrokeColor(HexColor(color));cv.setFillColor(HexColor(color));cv.setLineWidth(width)
    cv.line(x1,y1,x2,y2)
    theta=math.atan2(y2-y1,x2-x1);r=4
    p=cv.beginPath();p.moveTo(x2,y2)
    p.lineTo(x2-r*math.cos(theta-.5),y2-r*math.sin(theta-.5));p.lineTo(x2-r*math.cos(theta+.5),y2-r*math.sin(theta+.5));p.close()
    cv.drawPath(p,fill=1,stroke=0)

def diagram(cv,c,x,y,width,height):
    """Controlled, readable inset; never infer topology from the image pixels."""
    cv.saveState();cv.translate(x,y)
    cv.setFillColor(HexColor('#EBEEE6'));cv.roundRect(0,0,width,height,5,fill=1,stroke=0)
    kind=c['overlay_spec'][0]['kind']
    if kind=='prestress':
        cv.setFillColor(HexColor(NAVY));cv.setFont('Noto',6.5)
        cv.drawString(5,height-9,'NÉN TRƯỚC');cv.drawString(width*.54,height-9,'KHI CHỊU TẢI')
        for start in [5,width*.54]:
            cv.setFillColor(HexColor(TEAL));cv.rect(start+10,15,width*.36,8,fill=1,stroke=0)
        arrow(cv,7,19,20,19);arrow(cv,width*.48,19,width*.39,19)
        # Precompression acts inward; downward load creates tensile tendency at lower fibres.
        cx=width*.77
        arrow(cv,cx,height-12,cx,25)
        cv.setStrokeColor(HexColor(NAVY));cv.line(width*.59,13,width*.62,8);cv.line(width*.94,13,width*.91,8)
        cv.setFont('Noto',6);cv.setFillColor(HexColor(NAVY));cv.drawString(8,4,'Nén bù bớt kéo ở đáy khi tải tác dụng')
    elif kind=='feedback':
        nodes=c['overlay_spec'][0]['nodes'];positions=[(.22,.75),(.78,.75),(.78,.25),(.22,.25)]
        boxw=width*.37;boxh=13
        for (px,py),label in zip(positions,nodes):
            xx=px*width;yy=py*height
            cv.setFillColor(HexColor(TEAL));cv.roundRect(xx-boxw/2,yy-boxh/2,boxw,boxh,3,fill=1,stroke=0)
            cv.setFillColor(HexColor('#FFFFFF'));cv.setFont('Noto',6.5);cv.drawCentredString(xx,yy-2,label)
        for a,b in c['overlay_spec'][0]['edges']:
            ax,ay=positions[a];bx,by=positions[b];dx=bx-ax;dy=by-ay
            gapx=boxw/2+2 if dx else 0;gapy=boxh/2+2 if dy else 0
            arrow(cv,ax*width+math.copysign(gapx,dx),ay*height+math.copysign(gapy,dy),bx*width-math.copysign(gapx,dx),by*height-math.copysign(gapy,dy))
    elif kind=='heat':
        block(cv,'Nhiệt từ bên ngoài',5,height-7,width*.45,size=7)
        cv.setFillColor(HexColor(TEAL));cv.roundRect(width*.65,8,width*.3,height-16,4,fill=1,stroke=0)
        cv.setFillColor(HexColor('#FFFFFF'));cv.setFont('Noto',7);cv.drawCentredString(width*.8,height*.5,'Lõi đang tan')
        arrow(cv,width*.43,height*.5,width*.63,height*.5)
    elif kind=='passes':
        arrow(cv,12,height*.68,width-12,height*.68,TEAL)
        arrow(cv,width-12,height*.3,12,height*.3,ORANGE)
        cv.setFont('Noto',6.5);cv.setFillColor(HexColor(NAVY));cv.drawCentredString(width/2,height*.45,'Cả hai lượt đều in')
    elif kind=='heat_recovery':
        block(cv,'Nhiệt thải',6,height*.7,width*.4,size=8)
        block(cv,'Làm ấm nước',width*.58,height*.7,width*.4,size=8)
        arrow(cv,width*.4,height*.4,width*.6,height*.4)
    cv.restoreState()

def draw_card(cv,c,side,x=0,y=0,named=False,allow_placeholder=False):
    fonts();cv.saveState();cv.translate(x,y)
    cv.setFillColor(HexColor(BG));cv.rect(0,0,W,H,fill=1,stroke=0)
    # Color reaches the media edge. No inset border that exaggerates cutting drift.
    cv.setFillColor(HexColor(TEAL if side=='front' else NAVY));cv.rect(0,H-5*MM,W,5*MM,fill=1,stroke=0)
    margin=8*MM;width=60*MM
    cv.setFillColor(HexColor(NAVY));cv.setFont('NotoBold',11);cv.drawString(margin,H-13*MM,f"{c['id']:02}")
    cv.setFont('Noto',7);cv.setFillColor(HexColor(MUTED));cv.drawRightString(W-margin,H-13*MM,'NHÌN & NGHĨ' if side=='front' else 'HIỂU & ÁP DỤNG')
    path=core.selected_image(c)
    if path is None and not allow_placeholder:
        raise ValueError(f"{c['id']:02}: no accepted illustration; preview needs --allow-placeholder")
    if side=='front':
        title_top=H-20*MM
        if named:block(cv,title_vi(c['name_vi']),margin,title_top,width,size=13,font='NotoBold',max_lines=2)
        overlay=bool(c['overlay_spec'])
        # 60 mm art; if a controlled inset exists, lift the art so the 16 mm diagram sits fully below it.
        image_y=(46*MM if overlay else 35*MM) if not named else (42*MM if overlay else 31*MM)
        if path:
            cv.drawImage(ImageReader(str(path)),margin,image_y,width,width,preserveAspectRatio=True,anchor='c',mask='auto')
        else:
            cv.setFillColor(HexColor('#E5E5DA'));cv.roundRect(margin,image_y,width,width,6,fill=1,stroke=0)
            block(cv,'CHƯA CÓ MINH HỌA',margin+8,image_y+width*.65,width-16,size=12,font='NotoBold')
            block(cv,'Bản xem bố cục; không phải thẻ hoàn chỉnh.',margin+8,image_y+width*.45,width-16,size=10)
        if overlay:
            # Place inset below art, above question. AI carries no precise arrows.
            diagram(cv,c,margin,29*MM,width,16*MM)
        question_top=27*MM
        block(cv,c['front_question_vi'],margin,question_top,width,size=10.5,font='NotoBold',leading=13.4,bottom=9*MM)
    else:
        top=H-19*MM
        top=block(cv,title_vi(c['name_vi']),margin,top,width,size=13,font='NotoBold',max_lines=2,leading=16)-4
        top=block(cv,c['name_en'],margin,top,width,size=7.2,color=MUTED,leading=9)-8
        top=block(cv,c['memory_hook_vi'],margin,top,width,size=10,font='NotoBold',color=TEAL,leading=12.5)-9
        body=core.config().body_pt
        for label,text in [('BẢN CHẤT',c['definition_vi']),('TRONG HÌNH',c['example_vi']),('THỬ ÁP DỤNG',c['application_question_vi']),('PHÂN BIỆT',c['distinction_vi'])]:
            top=block(cv,label,margin,top,width,size=6.5,font='NotoBold',color=MUTED,leading=8)-2
            top=block(cv,text,margin,top,width,size=body,leading=12.7,bottom=9*MM)-7
    cv.setFont('Noto',6);cv.setFillColor(HexColor(MUTED));cv.drawString(margin,7*MM,'HỌC TRIZ QUA HÌNH ẢNH')
    cv.drawRightString(W-margin,7*MM,('A' if side=='front' else 'B')+f" · {c['id']:02}")
    cv.restoreState()

def one_pdf(c,side,named=False,allow_placeholder=False):
    out=io.BytesIO();cv=canvas.Canvas(out,pagesize=(W,H),pageCompression=1)
    draw_card(cv,c,side,named=named,allow_placeholder=allow_placeholder)
    cv.setTitle(f"TRIZ {c['id']:02} {side}");cv.showPage();cv.save()
    return out.getvalue()

def render(chosen,allow_placeholder=False,named=False):
    data=core.validate_content();m=core.manifest();cfg=core.config();count=0
    renderer_hash=core.digest(Path(__file__).read_bytes())
    (core.ROOT/'output/cards').mkdir(parents=True,exist_ok=True)
    for c in data:
        if c['id'] not in chosen:continue
        for side in (['front_named'] if named else ['front','back']):
            actual='front' if side=='front_named' else side
            path=core.selected_image(c,m)
            key=core.digest({'card':c,'image':core.digest(path.read_bytes()) if path else 'placeholder','config':cfg.model_dump(),'template':TEMPLATE,'renderer':renderer_hash,'side':side})
            output=core.ROOT/f"output/cards/{side}/{c['id']:02}.png"
            pdf_path=core.ROOT/f"output/cards/{side}/{c['id']:02}.pdf"
            state_key=f"{c['id']:02}-{side}"
            if m['renders'].get(state_key,{}).get('key')==key and output.exists() and pdf_path.exists():continue
            pdf=one_pdf(c,actual,named,allow_placeholder)
            doc=fitz.open(stream=pdf,filetype='pdf');pix=doc[0].get_pixmap(matrix=fitz.Matrix(cfg.dpi/72,cfg.dpi/72),alpha=False)
            im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
            # Exact target rounded pixel dimensions; resample only <=1 pixel rounding difference.
            target=(round(76*cfg.dpi/25.4),round(126*cfg.dpi/25.4))
            if im.size!=target:im=im.resize(target,Image.Resampling.LANCZOS)
            output.parent.mkdir(parents=True,exist_ok=True);im.save(output,dpi=(cfg.dpi,cfg.dpi));pdf_path.write_bytes(pdf)
            m['renders'][state_key]={'key':key,'status':'preview' if path is None else 'rendered','path':str(output.relative_to(core.ROOT)),'sha256':core.digest(output.read_bytes()),'at':core.now()}
            doc.close();count+=1
    core.save_json('state/manifest.json',m);print(f'Rendered {count} faces; unchanged inputs skipped.')

def contact_sheet():
    for side in ('front','back'):
        paths=[core.ROOT/f'output/cards/{side}/{i:02}.png' for i in range(1,41)]
        available=[p for p in paths if p.exists()]
        if not available:continue
        tilew,tileh=224,372;pad=12;cols=8;rows=math.ceil(len(available)/cols)
        sheet=Image.new('RGB',(cols*(tilew+pad)+pad,rows*(tileh+pad)+pad),'#DDE3DF')
        for idx,path in enumerate(available):
            with Image.open(path) as im:
                im.thumbnail((tilew,tileh),Image.Resampling.LANCZOS);sheet.paste(im,(pad+(idx%cols)*(tilew+pad),pad+(idx//cols)*(tileh+pad)))
        sheet.save(core.ROOT/f'output/triz_40_{side}s.jpg',quality=93)
    print('Updated front/back contact sheets.')

def back_slots(duplex):
    return [1,0,3,2] if duplex=='long-edge' else [2,3,0,1]

def slots():
    gap=8*MM;left=(210*MM-(2*W+gap))/2;bottom=(297*MM-(2*H+gap))/2
    return [(left,bottom+H+gap),(left+W+gap,bottom+H+gap),(left,bottom),(left+W+gap,bottom)]

def cropmarks(cv,x,y):
    cv.saveState();cv.setStrokeColor(HexColor(NAVY));cv.setLineWidth(.25)
    for xx in (x+3*MM,x+73*MM):
        cv.line(xx,y-2*MM,xx,y-0.5*MM);cv.line(xx,y+H+.5*MM,xx,y+H+2*MM)
    for yy in (y+3*MM,y+123*MM):
        cv.line(x-2*MM,yy,x-.5*MM,yy);cv.line(x+W+.5*MM,yy,x+W+2*MM,yy)
    cv.restoreState()

def impose(path,groups,duplex,allow_placeholder=False,test=False):
    cv=canvas.Canvas(str(path),pagesize=(210*MM,297*MM),pageCompression=1)
    mapping=[]
    for sheet,group in enumerate(groups,1):
        for side in ('front','back'):
            order=list(range(4)) if side=='front' else back_slots(duplex)
            for slot,(x,y) in enumerate(slots()):
                c=group[order[slot]]
                draw_card(cv,c,side,x,y,allow_placeholder=allow_placeholder);cropmarks(cv,x,y)
                if test:
                    cv.setFont('NotoBold',8);cv.setFillColor(HexColor(ORANGE));cv.drawString(x+9*MM,y+H-17*MM,f"{c['id']:02} / GÓC TRÊN TRÁI")
                mapping.append({'sheet':sheet,'side':side,'slot':slot,'id':c['id'],'x_mm':round(x/MM,3),'y_mm':round(y/MM,3)})
            cv.setFont('Noto',7);cv.setFillColor(HexColor(NAVY));cv.drawString(12*MM,7*MM,f"TRIZ · Tờ {sheet} · {'A' if side=='front' else 'B'} · {duplex} · In 100%")
            cv.showPage()
    cv.save();return mapping

def export_pdf(allow_placeholder=False):
    data=core.validate_content();fonts();out=core.ROOT/'output';out.mkdir(exist_ok=True)
    render(list(range(1,41)),allow_placeholder)
    cfg=core.config()
    # Review spread: two true-size cards, explanatory editorial note and source below.
    cv=canvas.Canvas(str(out/'triz_40_review.pdf'),pagesize=(210*MM,210*MM),pageCompression=1)
    for c in data:
        block(cv,f"{c['id']:02}  /  {title_vi(c['name_vi'])}",15*MM,198*MM,180*MM,size=15,font='NotoBold')
        draw_card(cv,c,'front',22*MM,60*MM,allow_placeholder=allow_placeholder)
        draw_card(cv,c,'back',112*MM,60*MM,allow_placeholder=allow_placeholder)
        block(cv,'PHẠM VI MINH HỌA',15*MM,48*MM,180*MM,size=8,font='NotoBold',color=TEAL)
        block(cv,c['visual_brief']['scope_note'],15*MM,42*MM,180*MM,size=9)
        block(cv,'Tên nguồn: '+core.load_json('data/terminology_vi.json')[c['id']-1]['original_name_vi'],15*MM,31*MM,180*MM,size=8)
        block(cv,f"Nguồn tên: trizvietnam.com/vi/noi-bo · Nguyên tắc {c['id']:02}",15*MM,24*MM,180*MM,size=8)
        block(cv,'Bộ thẻ tự biên soạn. Bản thử RGB; chưa thử học hoặc in vật lý.',15*MM,16*MM,180*MM,size=8,color=MUTED)
        cv.showPage()
    cv.save()
    groups=[data[i:i+4] for i in range(0,40,4)]
    mapping=impose(out/'triz_40_print_a4.pdf',groups,cfg.duplex,allow_placeholder)
    core.save_json('output/duplex_map.json',mapping)
    impose(out/'triz_40_print_test.pdf',[data[:4]],cfg.duplex,allow_placeholder,True)
    # Single-card PDF, interleaved front/back, with precise bleed and trim boxes.
    single=fitz.open()
    for c in data:
        for side in ('front','back'):
            doc=fitz.open(stream=one_pdf(c,side,allow_placeholder=allow_placeholder),filetype='pdf')
            page=doc[0];page.set_trimbox(fitz.Rect(3*MM,3*MM,73*MM,123*MM));page.set_bleedbox(page.mediabox)
            single.insert_pdf(doc);doc.close()
    single.save(out/'triz_40_single_cards.pdf',garbage=4,deflate=True);single.close()
    # Six pilot spreads are also delivered, not an unmarked partial 40-card export.
    doc=fitz.open(out/'triz_40_review.pdf');pilot=fitz.open()
    for i in [1,9,12,23,36,40]:pilot.insert_pdf(doc,from_page=i-1,to_page=i-1)
    pilot.save(out/'triz_6_pilot.pdf',garbage=4,deflate=True);pilot.close();doc.close()
    (out/'print_instructions.md').write_text(f'''# Hướng dẫn in thử

1. In `triz_40_print_test.pdf` trước: A4 dọc, 100% / Actual size, tắt Fit/Shrink.
2. Chế độ hiện tại: **{cfg.duplex}**, lật {'cạnh dài' if cfg.duplex=='long-edge' else 'cạnh ngắn'}.
3. Đưa tờ in ra ánh sáng để kiểm tra ID hai mặt, góc trên trái và đường cắt.
4. Khi khớp mới in `triz_40_print_a4.pdf`: 20 trang = 10 tờ, 4 thẻ/tờ.
5. Cắt theo dấu: thẻ 70 × 120 mm; trang thẻ gồm bleed 76 × 126 mm.
6. Chọn giấy và thử độ đọc trực tiếp. Máy in có thể lệch; không tự bù bằng thu phóng.

Mặt sau hoán vị {'trái/phải [1,0,3,2]' if cfg.duplex=='long-edge' else 'trên/dưới [2,3,0,1]'};
chữ không bị lật gương. Đổi `duplex` trong config rồi chạy export-pdf để đổi cách lật.
`duplex_map.json` lưu chính xác ID ở mỗi vị trí. Bản thẻ đơn xen kẽ A/B có TrimBox
và BleedBox; file review không dùng để cắt thẻ. PDF nhúng font Noto Sans, RGB,
chưa chuyển CMYK/PDF-X vì chưa có profile/yêu cầu nhà in. Chưa in thử vật lý.
''',encoding='utf-8')
    core.save_json('output/export_state.json',{'at':core.now(),'data_hash':core.digest(data),'config_hash':core.digest(cfg.model_dump()),'mapping_hash':core.digest(mapping)})
    print('Exported review (40 pages), A4 duplex (20), test (2), single cards (80), pilot (6).')

def qa(allow_placeholder=False):
    from fontTools.ttLib import TTFont as FontToolsFont
    data=core.validate_content();m=core.manifest();errors=[];warnings=[];checks=[]
    cfg=core.config();out=core.ROOT/'output'
    fonts()
    for fontpath in (cfg.font_regular,cfg.font_bold):
        f=FontToolsFont(core.ROOT/fontpath);glyphs=set().union(*(set(t.cmap) for t in f['cmap'].tables));f.close()
        text=''.join(c[k] for c in data for k in ('name_vi','name_en','definition_vi','memory_hook_vi','front_question_vi','example_vi','application_question_vi','distinction_vi'))
        missing={ch for ch in text if not ch.isspace() and ord(ch) not in glyphs}
        if missing:errors.append(f'Missing glyphs in {fontpath}: {missing}')
    checks.append('Font: kiểm tra glyph toàn bộ nội dung tiếng Việt và tiếng Anh ở cả hai font.')
    for c in data:
        i=c['id'];path=core.selected_image(c,m)
        if path is None:(warnings if allow_placeholder else errors).append(f'{i:02}: thiếu ảnh được chọn')
        elif min(Image.open(path).size)/(60/25.4)<300:errors.append(f'{i:02}: image effective resolution <300 ppi')
        for side in ('front','back'):
            filename=out/f'cards/{side}/{i:02}.png'
            if not filename.exists():errors.append(f'Missing {filename}');continue
            with Image.open(filename) as im:
                im.load()
                if im.size!=(898,1488):errors.append(f'{i:02}/{side}: bad dimensions {im.size}')
            state=m['renders'].get(f'{i:02}-{side}',{})
            if state.get('sha256')!=core.digest(filename.read_bytes()):errors.append(f'{i:02}/{side}: render checksum mismatch')
            try:one_pdf(c,side,allow_placeholder=allow_placeholder)
            except ValueError as error:errors.append(str(error))
        if not 12<=len(c['front_question_vi'].split())<=20:warnings.append(f'{i:02}: front question outside 12–20 word target')
    checks.append('80 PNG: mở ảnh, kích thước gồm bleed, checksum, kiểm tra dàn chữ với cỡ cố định.')
    if (out/'duplex_map.json').exists():
        mapping=core.load_json('output/duplex_map.json')
        for sheet in range(1,11):
            front=[x['id'] for x in mapping if x['sheet']==sheet and x['side']=='front']
            back=[x['id'] for x in mapping if x['sheet']==sheet and x['side']=='back']
            if len(front)!=4 or back!=[front[k] for k in back_slots(cfg.duplex)]:errors.append(f'Duplex mismatch sheet {sheet}')
        checks.append('10 tờ: đúng hoán vị mặt sau cho chế độ lật đã chọn.')
    else:errors.append('Missing duplex map')
    expected={'triz_40_review.pdf':40,'triz_40_print_a4.pdf':20,'triz_40_print_test.pdf':2,'triz_40_single_cards.pdf':80,'triz_6_pilot.pdf':6}
    qa_dir=out/'qa';qa_dir.mkdir(exist_ok=True)
    for name,count in expected.items():
        if not (out/name).exists():errors.append(f'Missing {name}');continue
        doc=fitz.open(out/name)
        if len(doc)!=count:errors.append(f'{name}: expected {count} pages')
        for n,page in enumerate(doc):
            # Render every PDF page to ensure content is parseable. Keep review previews for visual QA.
            pix=page.get_pixmap(matrix=fitz.Matrix(1,1),alpha=False)
            if name=='triz_40_review.pdf':pix.save(qa_dir/f'review-{n+1:02}.png')
            if 'CHƯA CÓ MINH HỌA' in page.get_text() and not allow_placeholder:errors.append(f'{name} page {n+1}: placeholder')
            for font in page.get_fonts():
                if 'Noto' in font[3] and not doc.extract_font(font[0])[3]:errors.append(f'{name}: unembedded font')
        doc.close()
    checks.append('PDF: mở/render toàn bộ trang, số trang, font nhúng, marker placeholder.')
    review=core.load_json('state/visual_review.json') if (core.ROOT/'state/visual_review.json').exists() else {}
    if not review.get('all_faces_reviewed'):warnings.append('Chưa ghi nhận kiểm tra trực quan đủ 80 mặt ở bản xuất cuối.')
    warnings += ['Chưa in thử vật lý; cần kiểm tra lệch hai mặt trên máy in thực tế.', 'Chưa thử học với người thật.', 'Tên khớp nguồn web được chỉ định; chưa đối chiếu độc lập bản sách GS. Phan Dũng.', 'Giá công cụ ảnh trong phiên không được API cung cấp; không ước tính tổng tiền.']
    report=['# Báo cáo kiểm tra bộ thẻ TRIZ','',f"Trạng thái kiểm tra tự động: {'PASS' if not errors else 'FAIL'}",f"Ảnh được chọn: {len(m['selected'])}/40",f"Lượt đã bắt đầu: {sum('started_at' in j for j in m['jobs'].values())}/{cfg.max_image_calls}",'','## Đã kiểm tra','']+['- '+x for x in checks]+['','## Lỗi','']+(['- '+x for x in errors] or ['Không có lỗi tự động.'])+['','## Giới hạn và việc còn lại','']+['- '+x for x in warnings]
    (out/'qa_report.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
    core.save_json('output/qa_report.json',{'at':core.now(),'pass':not errors,'errors':errors,'warnings':warnings,'checks':checks})
    print(f"QA {'PASS' if not errors else 'FAIL'}: {len(errors)} errors, {len(warnings)} notes. output/qa_report.md")
    return not errors
