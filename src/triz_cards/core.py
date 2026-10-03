from __future__ import annotations

import hashlib
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, ConfigDict, Field

ROOT = Path(__file__).resolve().parents[2]

def now():
    return datetime.now(timezone.utc).isoformat()

def digest(value):
    if not isinstance(value, bytes):
        value = json.dumps(value, ensure_ascii=False, sort_keys=True).encode()
    return hashlib.sha256(value).hexdigest()

def read_json(path):
    return (ROOT / path).read_text(encoding='utf-8')

def load_json(path):
    return json.loads(read_json(path))

def save_json(path, value):
    path = ROOT / path
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(prefix=path.name + '.', dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as out:
            json.dump(value, out, ensure_ascii=False, indent=2)
            out.write('\n')
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)

class Strict(BaseModel):
    model_config = ConfigDict(extra='forbid')

class Source(Strict):
    url: str = Field(min_length=10)
    section: str = Field(min_length=3)

class Alternative(Strict):
    scene_vi: str = Field(min_length=20)
    assessment_vi: str = Field(min_length=20)

class Brief(Strict):
    scene: str = Field(min_length=30)
    layout: Literal['editorial', 'sequence', 'controlled_diagram']
    alternatives: list[Alternative] = Field(min_length=2, max_length=2)
    selection_reason_vi: str
    must_show: list[str] = Field(min_length=1)
    must_avoid: list[str] = Field(min_length=1)
    scope_note: str

class Card(Strict):
    id: int = Field(ge=1, le=40)
    name_vi: str = Field(min_length=3)
    name_en: str = Field(min_length=3)
    aliases_vi: list[str]
    definition_vi: str = Field(min_length=20)
    memory_hook_vi: str = Field(min_length=5)
    front_question_vi: str = Field(min_length=20)
    example_vi: str = Field(min_length=20)
    mechanism_vi: str = Field(min_length=10)
    benefit_vi: str = Field(min_length=10)
    application_question_vi: str = Field(min_length=20)
    confusable_with: list[int] = Field(min_length=1)
    distinction_vi: str = Field(min_length=20)
    source_refs: list[Source] = Field(min_length=2)
    visual_brief: Brief
    image_prompt_en: str = Field(min_length=200)
    overlay_spec: list[dict]
    content_status: Literal['draft', 'editorially_reviewed']

class Config(Strict):
    project: str
    style_version: str
    trim_mm: tuple[float, float]
    bleed_mm: float = Field(ge=0)
    safe_mm: float = Field(ge=5)
    dpi: int = Field(ge=300)
    body_pt: float = Field(ge=10, le=11)
    duplex: Literal['long-edge', 'short-edge']
    image_backend: Literal['codex-tool', 'manual']
    max_image_calls: int = Field(ge=0)
    max_cost: float | None
    price_verified: bool
    concurrency: Literal[1]
    font_regular: str
    font_bold: str

def config():
    cfg = Config.model_validate(yaml.safe_load((ROOT/'config.yaml').read_text()))
    if cfg.trim_mm != (70,120) or cfg.bleed_mm != 3:
        raise ValueError('This template supports 70×120 mm + 3 mm bleed. Update template before changing these values.')
    return cfg

def cards():
    data = [Card.model_validate(c).model_dump() for c in load_json('data/principles.json')]
    if sorted(c['id'] for c in data) != list(range(1,41)):
        raise ValueError('Exactly 40 unique IDs 01–40 required')
    return sorted(data, key=lambda c:c['id'])

def ids(value=None):
    if not value:
        return list(range(1,41))
    result = sorted(set(int(s) for s in value.split(',')))
    if not result or any(i < 1 or i > 40 for i in result):
        raise ValueError('IDs must be 01–40')
    return result

def validate_content():
    data = cards()
    terms = load_json('data/terminology_vi.json')
    lock = load_json('data/terminology_lock.json')
    if lock['sha256'] != digest((ROOT/'data/terminology_vi.json').read_bytes()):
        raise ValueError('Terminology changed after lock; run sync-terminology after source review')
    if sorted(t['id'] for t in terms) != list(range(1,41)):
        raise ValueError('Terminology must have exactly 40 unique IDs')
    by_id = {t['id']:t for t in terms}
    evidence_cache = {}
    for c in data:
        t = by_id[c['id']]
        evidence_path = t['evidence_path']
        if evidence_path not in evidence_cache:
            evidence_cache[evidence_path] = (ROOT/evidence_path).read_bytes()
        evidence = evidence_cache[evidence_path]
        if digest(evidence) != t['evidence_sha256'] or t['original_name_vi'] not in evidence.decode():
            raise ValueError(f"{c['id']:02}: source evidence does not support terminology")
        if t['verification_status'] != 'verified_designated_web_source':
            raise ValueError(f"{c['id']:02}: unverified terminology")
        for field, key in [('name_vi','display_name_vi'),('name_en','name_en'),('aliases_vi','aliases_vi')]:
            if c[field] != t[key]:
                raise ValueError(f"{c['id']:02}: terminology out of sync")
        if t['display_name_vi'] != t['original_name_vi'].removeprefix('Nguyên tắc '):
            raise ValueError('Display rule may remove only exact repeated prefix')
        for other in c['confusable_with']:
            if other == c['id'] or other not in range(1,41):
                raise ValueError('Invalid confusable ID')
        if '...' in json.dumps(c,ensure_ascii=False) or 'TODO' in json.dumps(c):
            raise ValueError('Unfinished content marker')
        if c['id'] == 23 and c['overlay_spec'][0].get('edges') != [[0,1],[1,2],[2,3],[3,0]]:
            raise ValueError('Feedback loop must close through sensor to controller')
        if c['id'] == 36 and c['overlay_spec'][0].get('direction') != 'environment_to_pack':
            raise ValueError('Heat must enter melting pack')
    return data

def compile_prompts():
    data = validate_content()
    (ROOT/'prompts').mkdir(exist_ok=True)
    catalog = ['# 40 brief và prompt minh họa', '', 'Nội dung tự biên soạn; tên theo nguồn chỉ định.']
    for c in data:
        (ROOT/f"prompts/{c['id']:02}.txt").write_text(c['image_prompt_en'],encoding='utf-8')
        b = c['visual_brief']
        catalog += ['',f"## {c['id']:02} — {c['name_vi']}", '', f"Cơ chế: {c['mechanism_vi']}",f"Lợi ích: {c['benefit_vi']}", '']
        for n,a in enumerate(b['alternatives'],1):
            catalog += [f"{n}. {a['scene_vi']} {a['assessment_vi']}"]
        catalog += ['', b['selection_reason_vi'],b['scope_note'],'', 'Phải thấy: '+ '; '.join(b['must_show']), 'Tránh: '+'; '.join(b['must_avoid']), '', '```text', c['image_prompt_en'].rstrip(), '```']
    (ROOT/'prompts_catalog.md').write_text('\n'.join(catalog)+'\n',encoding='utf-8')
    return data

def manifest():
    if not (ROOT/'state/manifest.json').exists():
        return {'version':1, 'jobs':{}, 'candidates':{}, 'selected':{}, 'renders':{}}
    m = load_json('state/manifest.json')
    if m.get('version') != 1 or any(k not in m for k in ('jobs','candidates','selected','renders')):
        raise ValueError('Invalid manifest schema')
    for candidate in m['selected'].values():
        if candidate not in m['candidates'] or m['candidates'][candidate]['status'] != 'accepted':
            raise ValueError('Selected candidate must exist and be accepted')
    return m

def event(**fields):
    (ROOT/'state').mkdir(exist_ok=True)
    with (ROOT/'state/calls.jsonl').open('a',encoding='utf-8') as out:
        out.write(json.dumps({'time':now(),**fields},ensure_ascii=False)+'\n')

def generation_key(c):
    return digest({'prompt':c['image_prompt_en'], 'style':config().style_version, 'provider':config().image_backend})

def generate(chosen, variants=1, missing=False, resume=False):
    if not 1 <= variants <= 2:
        raise ValueError('Initial variants must be 1 or 2')
    data = compile_prompts()
    m = manifest()
    pending = []
    for c in data:
        if c['id'] not in chosen:
            continue
        key = generation_key(c)
        if missing and str(c['id']) in m['selected']:
            selected = m['candidates'][m['selected'][str(c['id'])]]
            if selected['generation_key'] == key:
                continue
        for variant in range(1,variants+1):
            matching = [j for j in m['jobs'].values() if j['id']==c['id'] and j['generation_key']==key and j['variant']==variant]
            if matching and (resume or missing):
                # Unknown/started jobs are NEVER silently retried; potential duplicate charge.
                pending.extend(j for j in matching if j['status']=='queued')
                continue
            if any(j['status'] in ('queued','started','unknown') for j in matching):
                raise ValueError(f"Unresolved job for {c['id']:02}; inspect state before submitting again")
            serial = len(m['jobs'])+1
            job_id = f"{c['id']:02}-{key[:10]}-{serial:03}"
            j = {'job_id':job_id,'id':c['id'],'variant':variant,'generation_key':key,'prompt_hash':digest(c['image_prompt_en'].encode()),
                 'prompt':c['image_prompt_en'],'style_version':config().style_version,'provider':config().image_backend,
                 'model':'tool-managed','parameters':{},'reference_images':[],'created_at':now(),'status':'queued','cost':None}
            m['jobs'][job_id]=j
            pending.append(j)
    save_json('state/manifest.json',m)
    save_json('state/generation_queue.json',pending)
    print(f'{len(pending)} queued jobs. Codex tool/manual import only; no Python API request or charge was made.')
    return pending

def start_job(job_id):
    m=manifest(); j=m['jobs'][job_id]
    if j['status']!='queued':
        raise ValueError('Only queued jobs may start; unknown requests need explicit reconciliation')
    if any(x['status']=='started' for x in m['jobs'].values()):
        raise ValueError('Concurrency is one; finish or reconcile the running job first')
    if sum('started_at' in x for x in m['jobs'].values())>=config().max_image_calls:
        raise ValueError('Image call limit reached')
    if config().max_cost is not None and not config().price_verified:
        raise ValueError('Cannot enforce money limit with unknown prices; configure a call-count limit')
    j.update(status='started',started_at=now())
    save_json('state/manifest.json',m)
    event(event='started',**j)
    print(job_id)

def fail_job(job_id, status, message):
    if status not in ('failed','unknown'):
        raise ValueError('Failure must be failed or unknown')
    m=manifest(); j=m['jobs'][job_id]
    j.update(status=status,error=message,finished_at=now())
    save_json('state/manifest.json',m)
    event(event=status,job_id=job_id,id=j['id'],error=message)

def import_image(job_id, path):
    import shutil
    from PIL import Image
    m=manifest(); j=m['jobs'][job_id]
    if j['status'] not in ('started','unknown','queued'):
        raise ValueError('Job already completed or failed')
    path=Path(path).resolve()
    with Image.open(path) as im:
        im.verify()
    with Image.open(path) as im:
        size=im.size
        if min(size)<709:
            raise ValueError('Image below 300 ppi for 60 mm illustration')
    sha=digest(path.read_bytes())
    candidate_id=f"{j['id']:02}-{sha[:16]}"
    dest=ROOT/f'images/candidates/{candidate_id}.png'
    if dest.exists() and digest(dest.read_bytes())!=sha:
        raise ValueError('Candidate collision')
    if path!=dest:
        shutil.copyfile(path,dest)
    m['candidates'][candidate_id]={'id':j['id'],'path':str(dest.relative_to(ROOT)),'sha256':sha,'size':size,'status':'unreviewed','job_id':job_id,'generation_key':j['generation_key']}
    j.update(status='succeeded',finished_at=now(),candidate_id=candidate_id)
    save_json('state/manifest.json',m)
    event(event='succeeded',job_id=job_id,id=j['id'],candidate_id=candidate_id,sha256=sha)
    print(candidate_id)

def select(candidate_id, scores, note):
    import shutil
    if len(scores)!=5 or min(scores)<4 or max(scores)>5 or sum(scores)<21:
        raise ValueError('Selection requires 5 scores, each >=4 and <=5, total >=21')
    if len(note)<20:
        raise ValueError('Record concrete visual evidence, not just a score')
    m=manifest(); c=m['candidates'][candidate_id]
    source=ROOT/c['path']
    if digest(source.read_bytes())!=c['sha256']:
        raise ValueError('Candidate file changed')
    dest=ROOT/f'images/selected/{candidate_id}.png'
    if not dest.exists():
        shutil.copyfile(source,dest)
    c.update(status='accepted',scores=scores,review_note=note,reviewer='Codex visual/editorial review',reviewed_at=now(),selected_path=str(dest.relative_to(ROOT)))
    m['selected'][str(c['id'])]=candidate_id
    save_json('state/manifest.json',m)
    event(event='selected',id=c['id'],candidate_id=candidate_id,scores=scores,note=note)
    print(f"Selected {c['id']:02}: {candidate_id}")

def selected_image(c, m=None):
    m=m or manifest()
    cid=m['selected'].get(str(c['id']))
    if not cid:
        return None
    candidate=m['candidates'][cid]
    path=ROOT/candidate['selected_path']
    if candidate['generation_key']!=generation_key(c):
        raise ValueError(f"{c['id']:02}: selected image has stale prompt/style")
    if digest(path.read_bytes())!=candidate['sha256']:
        raise ValueError('Selected image checksum mismatch')
    return path
