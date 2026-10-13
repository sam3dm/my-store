#!/usr/bin/env python3
"""Mix the film's sound: python3 tools/mix.py video.mp4 out.mp4
Needs audio/music.(mp3|wav) (~120 BPM, starts on a downbeat, drop at beat 16) and audio/sfx/<name>.wav
for each sfx name in events.json (downloaded SFX, never synthesized). Each SFX is placed by its
*measured peak*, not by its first sample, then the master is loudnormed to -14 LUFS."""
import json, subprocess, sys, os, glob
vid, out = sys.argv[1], sys.argv[2]
ev = json.load(open('tools/events.json')); B = 60 / ev['bpm']
music = next(iter(glob.glob('audio/music.*')), None)
def peak_offset(path):                      # seconds from file start to its loudest sample
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '8000', '-f', 'f32le', '-'], capture_output=True).stdout
    import array; a = array.array('f'); a.frombytes(r[:len(r) // 4 * 4]); m = max(range(len(a)), key=lambda i: abs(a[i])) if len(a) else 0
    return m / 8000
inputs, filt, labels, n = [], [], [], 0
if music: inputs += ['-i', music]; filt.append('[0:a]atrim=0:27,asetpts=PTS-STARTPTS,volume=0.9[m]'); labels.append('[m]'); n = 1
missing = set()
for e in ev['events']:
    p = f"audio/sfx/{e['sfx']}.wav"
    if not os.path.exists(p): missing.add(e['sfx']); continue
    t = e['beat'] * B - peak_offset(p); ms = max(int(t * 1000), 0)
    inputs += ['-i', p]; filt.append(f"[{n}:a]adelay={ms}|{ms},volume=0.8[s{n}]"); labels.append(f'[s{n}]'); n += 1
if missing: print('missing SFX:', ', '.join(sorted(missing)))
if not labels: sys.exit('no audio files found in audio/')
filt.append(''.join(labels) + f'amix=inputs={len(labels)}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,atrim=0:27[a]')
subprocess.run(['ffmpeg', '-y', '-i', vid, *inputs, '-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', out], check=True)
