import glob,sys
s=open('film.src.html').read()
js='\n'.join(open(f).read() for f in sorted(glob.glob('src/*.js')))
open('film.html','w').write(s.replace('/*JS*/',js))
print('built',len(js)//1024,'KB js')
