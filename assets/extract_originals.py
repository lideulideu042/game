"""Reproduce chapter3 crops using Pillow; no generated or repainted character pixels."""
from PIL import Image
from pathlib import Path
from collections import deque
import json,hashlib
root=Path(__file__).resolve().parent.parent;out=root/'assets';S=Image.open(root/'62a13278-937f-483d-b1a3-7d4f2546dbeb.png').convert('RGBA');D=Image.open(root/'4dac1fa0-f659-45b1-9ed6-fb29a88c4509.png').convert('RGBA');records=[]
def save(im,path,source,rect):
 p=out/path;p.parent.mkdir(parents=True,exist_ok=True);im.save(p);records.append({'file':'assets/'+str(path),'source':source,'crop':rect})
def sprite(path,r):
 im=S.crop(r);px=im.load();w,h=im.size;seen=set();q=deque()
 def bg(x,y):
  r,g,b,a=px[x,y];return min(r,g,b)>110 and max(r,g,b)-min(r,g,b)<115
 for x in range(w):
  for y in [0,h-1]:
   if bg(x,y):q.append((x,y));seen.add((x,y))
 for y in range(h):
  for x in [0,w-1]:
   if bg(x,y):q.append((x,y));seen.add((x,y))
 while q:
  x,y=q.popleft();rr,gg,bb,_=px[x,y];px[x,y]=(rr,gg,bb,0)
  for xx,yy in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]:
   if 0<=xx<w and 0<=yy<h and (xx,yy) not in seen and bg(xx,yy):seen.add((xx,yy));q.append((xx,yy))
 bbox=im.getbbox();assert bbox;im=im.crop(bbox);save(im,Path(path),'62a13278-937f-483d-b1a3-7d4f2546dbeb.png',r);records[-1]['trim']=bbox
for n,r in {'idle':(100,220,310,423),'walk':(445,218,675,423),'jump':(790,216,998,423),'success':(1120,218,1352,426),'caught':(1460,218,1730,427)}.items():sprite('player/'+n+'.png',r)
for n,r in {'idle':(85,612,330,805),'patrol':(435,612,700,805),'alert':(755,612,1027,805),'chase':(1082,612,1360,805),'caught':(1450,612,1735,805)}.items():sprite('teacher/'+n+'.png',r)
# Each patch copies only unoccupied floor/snow pixels from the SAME original panel.
# Positions are in source pixels. This removes baked actors and their indicators, without repainting scenery.
def panel(name,r,patches=()):
 im=D.crop(r)
 for target,donor in patches:
  tile=im.crop(donor);x1,y1,x2,y2=target
  for y in range(y1,y2,tile.height):
   for x in range(x1,x2,tile.width):im.paste(tile.crop((0,0,min(tile.width,x2-x),min(tile.height,y2-y))),(x,y))
 save(im,Path('maps/'+name+'.png'),'4dac1fa0-f659-45b1-9ed6-fb29a88c4509.png',r)
 records[-1]['original_pixel_patches']=[{'target':a,'donor':b}for a,b in patches]
panel('main',(8,10,552,317),[((175,255,391,303),(155,255,173,303))])
panel('select',(1107,12,1663,316))
panel('rules',(567,12,1089,317))
panel('2f',(8,394,829,624),[((348,140,435,218),(245,154,300,220)),((580,120,669,218),(245,154,300,220))])
panel('1f',(845,394,1663,624),[((331,148,410,220),(410,176,440,220)),((662,130,748,220),(410,176,440,220))])
panel('yard',(8,698,829,932),[((375,156,457,233),(345,156,374,233))])
panel('management',(847,647,1314,930),[((134,167,215,264),(16,231,87,270))])
panel('success',(1330,645,1663,931))
(out/'sources.json').write_text(json.dumps({'sources':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in root.glob('*.png')},'assets':records},ensure_ascii=False,indent=2))
