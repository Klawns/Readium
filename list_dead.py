import os
from subprocess import run, PIPE
root = r'app/readium-frontend/src'
reader_dir = os.path.join(root, 'features', 'reader')
results = []
for dirpath, dirnames, filenames in os.walk(reader_dir):
    for fname in filenames:
        if not (fname.endswith('.ts') or fname.endswith('.tsx')):
            continue
        fpath = os.path.join(dirpath, fname)
        base = fname.rsplit('.', 1)[0]
        proc = run(['rg', '-l', base, root], stdout=PIPE, text=True)
        matches = [line.strip() for line in proc.stdout.splitlines() if line.strip()]
        if len(matches) == 1 and os.path.normpath(matches[0]) == os.path.normpath(fpath):
            results.append(os.path.relpath(fpath).replace('\\','/'))
print('\n'.join(results))
