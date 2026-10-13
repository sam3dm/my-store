import sys,glob
from PIL import Image, ImageDraw
d,out,cols,sz=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
fs=sorted(glob.glob(d+'/b*.png'))
rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(cols*sz,rows*sz))
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').resize((sz,sz)); dr=ImageDraw.Draw(im); dr.rectangle((0,0,64,22),fill=(0,0,0)); dr.text((4,4),f.split('/b')[-1][:5].lstrip('0') or '0',fill=(255,255,0)); S.paste(im,((i%cols)*sz,(i//cols)*sz))
S.save(out)
