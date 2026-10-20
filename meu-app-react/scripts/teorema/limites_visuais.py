"""Separate vertical alternatives by the white bands between printed labels.

Equation editors often position numerator/denominator text boxes out of reading
order. Actual rendered ink, bounded by the option labels, is authoritative.
"""
import math
import numpy as np


def band_cut(image,bounds,start,end,scale,target=None):
    left,right=math.floor(bounds[0]*scale),math.ceil(bounds[2]*scale)
    top,bottom=max(0,math.floor(start*scale)),min(image.height,math.ceil(end*scale))
    if bottom<=top:
        raise ValueError('marcadores visuais sobrepostos')
    profile=np.count_nonzero(np.asarray(image.crop((left,top,right,bottom)).convert('L'))<150,axis=1)<=1
    bands=[];opened=None
    for y,white in zip(range(top,bottom),profile):
        if white and opened is None:
            opened=y
        if not white and opened is not None:
            bands.append((opened,y));opened=None
    if opened is not None:
        bands.append((opened,bottom))
    bands=[b for b in bands if b[1]-b[0]>=2]
    if not bands:
        raise ValueError('sem separação visual comprovada entre alternativas')
    if target is None:
        a,b=max(bands,key=lambda b:(b[1]-b[0],b[0]))
    else:
        a,b=min(bands,key=lambda b:(abs((b[0]+b[1])/2-target*scale),-(b[1]-b[0])))
    return (a+b)/2/scale


def separate(q,path,renderer,scale):
    marks=q.get('marcadores_opcoes')
    if not marks or any(p.get('horizontal') for p in q['partes'][1:]):
        return q['partes']
    regions={r['indice']:r for r in q['regioes_recorte']}
    cuts=[]
    for i,mark in enumerate(marks):
        region=regions[mark['region']]
        image,_=renderer.page(path,region['pagina'])
        prior=marks[i-1] if i else None
        hint=mark['y']-2.5
        if prior and prior['region']==mark['region']:
            lower=max(prior['bottom'],mark['top']-35)
            target=hint if hint>lower else None
            cut=band_cut(image,region['bbox'],lower,mark['top']-2,scale,target)
        else:
            cut=band_cut(image,region['bbox'],max(region['bbox'][1],hint-5),hint+1,scale,hint)
        cuts.append((mark['region'],cut))
    start=q['partes'][0]['recortes'][0]
    first_region=q['regioes_recorte'][0]['indice']
    first_hint=start['bbox'][1]-2.5
    first_bounds=regions[first_region]['bbox']
    first_image,_=renderer.page(path,start['pagina'])
    first_cut=band_cut(first_image,first_bounds,max(first_bounds[1],first_hint-4),first_hint+1,scale,first_hint)
    positions=[(first_region,first_cut),*cuts,(q['fim_recorte']['region'],q['fim_recorte']['y']-2.5)]
    # A last formula also needs its full denominator. When the next item starts
    # in this region, take a white band after E rather than a glyph-box edge.
    last=marks[-1];end_region,end_y=positions[-1]
    if end_region==last['region'] and end_y>last['top']+5:
        region=regions[end_region];image,_=renderer.page(path,region['pagina'])
        positions[-1]=(end_region,band_cut(image,region['bbox'],max(last['bottom'],end_y-5),min(region['bbox'][3],end_y+1),scale,end_y))
    parts=[]
    for source,(a,y0),(b,y1) in zip(q['partes'],positions,positions[1:]):
        rects=[]
        for index in range(a,b+1):
            region=regions[index];left,top,right,bottom=region['bbox']
            if index==a:top=max(top,y0)
            if index==b:bottom=min(bottom,y1)
            if bottom>top:
                rects.append({'pagina':region['pagina'],'coluna':region['coluna'],'bbox':[left,top,right,bottom]})
        if not rects:
            raise ValueError('bloco sem limite visual verificável')
        parts.append({**source,'recortes':rects,'limite_por_imagem':True})
    return parts
