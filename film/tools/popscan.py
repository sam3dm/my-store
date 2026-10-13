import sys,glob,numpy as np
from PIL import Image
fs=sorted(glob.glob(sys.argv[1]+'/f*.jpg'))
def load(f): return np.asarray(Image.open(f).convert('RGB').resize((240,240),Image.BILINEAR)).astype(np.float32)
prev=load(fs[0]); d=[]
for f in fs[1:]:
    cur=load(f); d.append(np.abs(cur-prev).mean()); prev=cur
d=np.array(d); out=[]
for i in range(1,len(d)-1):
    nb=(d[i-1]+d[i+1])/2
    if d[i]>3*max(nb,0.15) and d[i]>1.2: out.append((i+1,round(float(d[i]),2),round(float(nb),2)))
print('frames',len(fs),'mean diff',round(float(d.mean()),2),'max',round(float(d.max()),2),'at',int(d.argmax())+1)
print('suspected pops (frame, diff, neighbours):',out)
