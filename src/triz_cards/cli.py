import argparse
import fcntl
import sys

from . import core

def main():
    parser=argparse.ArgumentParser(description='Vietnamese TRIZ cards; run from any directory after editable install')
    subs=parser.add_subparsers(dest='command',required=True)
    for name in ['validate-content','compile-prompts','contact-sheet','export-pdf','qa','sync-terminology']:
        p=subs.add_parser(name)
        if name in ('export-pdf','qa'):
            p.add_argument('--allow-placeholder',action='store_true')
    p=subs.add_parser('generate'); p.add_argument('--ids'); p.add_argument('--variants',type=int,default=1);p.add_argument('--missing',action='store_true');p.add_argument('--resume',action='store_true')
    p=subs.add_parser('start-job');p.add_argument('job')
    p=subs.add_parser('fail-job');p.add_argument('job');p.add_argument('--status',choices=['failed','unknown'],required=True);p.add_argument('--message',required=True)
    p=subs.add_parser('import-image');p.add_argument('--job',required=True);p.add_argument('--file',required=True)
    p=subs.add_parser('select');p.add_argument('--candidate',required=True);p.add_argument('--scores',required=True);p.add_argument('--note',required=True)
    p=subs.add_parser('render');group=p.add_mutually_exclusive_group();group.add_argument('--ids');group.add_argument('--all',action='store_true');p.add_argument('--allow-placeholder',action='store_true');p.add_argument('--named-front',action='store_true')
    args=parser.parse_args()
    (core.ROOT/'state').mkdir(exist_ok=True)
    try:
        with (core.ROOT/'state/.lock').open('w') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
            run(args)
    except (ValueError,KeyError,OSError) as error:
        parser.exit(2,f'Error: {error}\n')

def run(a):
    cmd=a.command
    if cmd=='validate-content':
        core.validate_content();print('PASS: 40 unique IDs, source evidence, terminology lock, content and controlled overlays.')
    elif cmd=='compile-prompts':
        core.compile_prompts();print('Compiled 40 prompts and catalog.')
    elif cmd=='generate':core.generate(core.ids(a.ids),a.variants,a.missing,a.resume)
    elif cmd=='start-job':core.start_job(a.job)
    elif cmd=='fail-job':core.fail_job(a.job,a.status,a.message)
    elif cmd=='import-image':core.import_image(a.job,a.file)
    elif cmd=='select':core.select(a.candidate,[int(x) for x in a.scores.split(',')],a.note)
    elif cmd=='sync-terminology':
        terms=core.load_json('data/terminology_vi.json');data=core.load_json('data/principles.json')
        if sorted(t['id'] for t in terms)!=list(range(1,41)):raise ValueError('40 unique terminology IDs required')
        by_id={t['id']:t for t in terms}
        for c in data:
            t=by_id[c['id']];c.update(name_vi=t['display_name_vi'],name_en=t['name_en'],aliases_vi=t['aliases_vi'])
        core.save_json('data/principles.json',data)
        core.save_json('data/terminology_lock.json',{'sha256':core.digest((core.ROOT/'data/terminology_vi.json').read_bytes()),'locked_at':core.now(),'basis':'explicit CLI re-lock; evidence verified by validate-content'})
        core.compile_prompts();print('Synchronized terminology; rerender PNG/PDF outputs.')
    else:
        from . import rendering
        if cmd=='render':rendering.render(core.ids(a.ids),a.allow_placeholder,a.named_front)
        elif cmd=='contact-sheet':rendering.contact_sheet()
        elif cmd=='export-pdf':rendering.export_pdf(a.allow_placeholder)
        elif cmd=='qa':
            if not rendering.qa(a.allow_placeholder):sys.exit(1)
