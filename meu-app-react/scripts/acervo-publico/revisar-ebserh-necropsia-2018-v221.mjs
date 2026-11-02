import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-ebserh-necropsia-2018-v221',doc='ce09ab42e4a14dda'
const prova='https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/394_EBSERHASSISTENCIAL054__PAG_2.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/GAB_DEFINITIVO_394_EBSERHASSISTENCIAL054.PDF'
const concurso='EBSERH Assistencial 2018 — Técnico em Necrópsia — Cargo 54'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='394_EBSERHASSISTENCIAL054__PAG_2.PDF'||catalog.questoes.length!==60||catalog.questoes[0].numero!==41||catalog.questoes.at(-1).numero!==100)throw Error('Caderno EBSERH Cargo 54 diverge do inventário')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-tjpa-economia-2025-v220'))
if(start<0)throw Error('Base anterior v220 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const byId=new Map(),wanted=new Set(catalog.questoes.map(x=>x.id))
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){byId.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(byId.size!==60||wanted.size)throw Error(`Esperados 60 itens EBSERH; encontrados ${byId.size}; ausentes ${wanted.size}`)
const pages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`))),officialText=pages.join('\n')
const clean=s=>s.replace(/CESPE\s*\|\s*CEBRASPE\s*[–-]\s*EBSERH_ASSISTENCIAL\s*[–-]\s*Aplicação:\s*2018/g,'').replace(/-\s*\n\s*/g,'-').replace(/\s+/g,' ').trim()
const re=/(?:^|\n)\s*(4[1-9]|[5-9]\d|100)\s+([\s\S]*?)(?=\n\s*(?:4[1-9]|[5-9]\d|100)\s+|$)/g
const stems=new Map([...officialText.matchAll(re)].map(m=>[Number(m[1]),clean(m[2])]))
if(stems.size!==60||Array.from({length:60},(_,i)=>41+i).some(n=>!stems.has(n)))throw Error(`Transcrição oficial incompleta: ${stems.size}/60 itens`)
const key=['C','E','C','C','E','E','C','E','C','E','E','C','C','C','E','C','C','C','C','C','E','E','C','C','E','E','C','E','E','E','C','E','E','C','C','E','E','C','C','E','C','E','C','C','E','C','E','E','C','C','C','E','E','E','C','C','E','C','C','E']
if(key.length!==60)throw Error('Gabarito definitivo não cobre 60 itens')
const contexts={
 41:'Julgue os itens a seguir, a respeito das relações anatômicas.',
 47:'Com relação à anatomia humana, julgue os próximos itens.',
 53:'Acerca da vascularização abdominal, julgue os itens seguintes.',
 57:'Julgue os itens subsecutivos, a respeito da anatomia abdominal.',
 61:'Julgue os itens de acordo com as características das lesões produzidas por projéteis de arma de fogo.',
 64:'Acerca de medicina legal, julgue os itens a seguir.',
 71:'Julgue os próximos itens quanto à aplicação dos instrumentos em autópsias.',
 76:'Acerca dos instrumentos utilizados em autópsias, julgue os itens subsecutivos.',
 82:'Julgue os próximos itens quanto à abertura do tronco e do crânio.',
 86:'Julgue os itens a seguir quanto às técnicas de embalsamamento.',
 91:'Acerca da dissecação de órgãos, julgue os itens que se seguem.',
 94:'Acerca dos instrumentos e sua aplicação em autópsias, julgue os itens subsequentes.',
 97:'Alguns autores dividem a necropsia em quatro tempos: incisões, craniotomia, inspeção da cavidade toracoabdominal e reconstituição. Julgue os itens conforme essa divisão.'
}
const contextFor=n=>Object.entries(contexts).reverse().find(([s])=>n>=Number(s))?.[1]||''
const topics={
41:['Anatomia Humana','Terminologia anatômica: posição distal e proximal'],42:['Anatomia Humana','Terminologia anatômica: posição medial e lateral'],43:['Anatomia Humana','Terminologia anatômica: posição cranial e caudal'],44:['Anatomia Humana','Planos anatômicos: coronal e transversal'],45:['Anatomia Humana','Topografia abdominal: pâncreas e estômago'],46:['Anatomia Humana','Anatomia dos membros superiores: regiões do braço e cotovelo'],
47:['Anatomia Humana','Sistema respiratório: lobos pulmonares'],48:['Anatomia Humana','Sistema urinário: posição dos rins'],49:['Anatomia Humana','Anatomia do intestino grosso: cólons ascendente e descendente'],50:['Anatomia Humana','Topografia abdominal: glândulas suprarrenais e pâncreas'],51:['Anatomia Humana','Estômago: fundo, antro e relação com o duodeno'],52:['Anatomia Humana','Anatomia cardíaca: válvula tricúspide'],
53:['Anatomia Humana','Vascularização abdominal: formação da veia porta'],54:['Anatomia Humana','Vascularização abdominal: veias renais'],55:['Anatomia Humana','Tronco celíaco e ramos arteriais abdominais'],56:['Anatomia Humana','Aorta abdominal e artéria mesentérica inferior'],57:['Anatomia Humana','Fígado: ligamento falciforme e lobos hepáticos'],58:['Anatomia Humana','Parede abdominal: linha alba e plano sagital mediano'],59:['Anatomia Humana','Músculos da parede abdominal posterior: psoas e quadrado lombar'],60:['Anatomia Humana','Intestino delgado: flexura duodenojejunal e ângulo de Treitz'],
61:['Medicina Legal','Traumatologia forense: lesões perfurocontusas por projéteis'],62:['Medicina Legal','Balística forense: distância do disparo e tatuagem por pólvora'],63:['Medicina Legal','Balística forense: excentricidade do orifício de entrada'],64:['Medicina Legal','Traumatologia forense: lesões perfuroincisas e instrumento de gume único'],65:['Medicina Legal','Traumatologia forense: lesões cortocontusas por machado'],66:['Medicina Legal','Asfixiologia forense: sulco cervical e enforcamento'],67:['Medicina Legal','Asfixiologia forense: cogumelo de espuma e afogamento'],68:['Medicina Legal','Traumatismo cranioencefálico e ausência de fratura craniana'],69:['Medicina Legal','Toxicologia forense: metabólitos de cocaína e efeitos no momento do óbito'],70:['Medicina Legal','Traumatologia forense: hematoma e infiltração sanguínea'],
71:['Técnica de Necropsia','Instrumentos de autópsia: tesoura Iris e pequenas estruturas'],72:['Técnica de Necropsia','Instrumentos de autópsia: pinças anatômica e dente de rato'],73:['Técnica de Necropsia','Instrumentos de mensuração: paquímetro'],74:['Técnica de Necropsia','Instrumentos de autópsia: raquítomo e retirada da medula espinal'],75:['Técnica de Necropsia','Instrumentos de incisão: tentacânula'],76:['Técnica de Necropsia','Instrumentos de autópsia: costótomo'],77:['Técnica de Necropsia','Materiais de sutura: linha de cânhamo'],78:['Técnica de Necropsia','Instrumentos de abertura intestinal: enterótomo'],79:['Técnica de Necropsia','Instrumentos osteotômicos: cinzel e escopro'],80:['Técnica de Necropsia','Serras para necropsia e biossegurança'],81:['Técnica de Necropsia','Instrumentos de remoção do periósteo: rugina'],
82:['Técnica de Necropsia','Abertura do crânio: incisão bimastóidea'],83:['Técnica de Necropsia','Técnicas de necropsia: método de Letulle'],84:['Técnica de Necropsia','Técnicas de necropsia: método de Virchow'],85:['Técnica de Necropsia','Incisões toracoabdominais: biacromioxifopubiana e submentoxifopubiana'],
86:['Tanatologia e Embalsamamento','Embalsamamento após necropsia e manipulação visceral'],87:['Tanatologia e Embalsamamento','Biossegurança no embalsamamento'],88:['Tanatologia e Embalsamamento','Habilitação e supervisão profissional no embalsamamento'],89:['Tanatologia e Embalsamamento','Conservação cadavérica: retirada de fluidos e injeção vascular'],90:['Tanatologia e Embalsamamento','Técnica de plastinação'],
91:['Técnica de Necropsia','Dissecação de grandes vasos: aorta e artérias ilíacas'],92:['Técnica de Necropsia','Dissecação das glândulas suprarrenais e retirada de gordura'],93:['Técnica de Necropsia','Remoção do encéfalo: secção de nervos e artérias'],94:['Técnica de Necropsia','Apoios para posicionamento do cadáver: chaira'],95:['Técnica de Necropsia','Facas de Collin e Virchow: incisão e abertura de tecidos'],96:['Técnica de Necropsia','Instrumentos de percussão: martelos de autópsia'],
97:['Técnica de Necropsia','Tempos da necropsia: etapa de incisões'],98:['Técnica de Necropsia','Tempos da necropsia: craniotomia e instrumentos'],99:['Técnica de Necropsia','Tempos da necropsia: inspeção toracoabdominal e coleta de material'],100:['Técnica de Necropsia','Tempos da necropsia: reconstituição do cadáver']
}
if(Object.keys(topics).length!==60)throw Error('Classificação não cobre os 60 itens')
const answerDigest=hashRevisao(key.join(',')),pageFor=n=>n<=81?1:2
for(let p=1;p<=2;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const corrections={60:'A flexura duodenojejunal também é denominada ângulo de Treitz.'}
const decisions=catalog.questoes.map(e=>{
 const n=e.numero,q=byId.get(e.id),[materia,conteudo]=topics[n],page=pageFor(n),answer=key[n-41],apoio=contextFor(n)
 if(!q||!stems.has(n)||!materia||!conteudo||!apoio||!answer)throw Error(`Item ${n}: campo essencial ausente`)
 return {id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2018,concurso,numero_original:n,pagina:page,
  dificuldade:[55,58,60,62,63,64,66,68,69,73,74,76,77,78,79,80,82,83,84,85,88,91,92,93,95,97,99,100].includes(n)?'Difícil':[41,42,43,44,46,47,48,49,52,54,56,57,61,65,67,70,71,72,75,81,86,89,90,94,96,98].includes(n)?'Fácil':'Média',
  dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial conforme a aplicação prática de anatomia, medicina legal e técnicas de necropsia; a banca não publica dificuldade psicométrica por item.',
  enunciado:corrections[n]||stems.get(n),opcoes:q.opcoes?.length===2?q.opcoes:['Certo','Errado'],texto_apoio:apoio,resposta_correta:answer==='C'?0:1,anulada:false,
  gabarito_oficial:{valor:answer,fonte:gabarito,arquivo:'GAB_DEFINITIVO_394_EBSERHASSISTENCIAL054.PDF',prova,numero:n,pagina:1,sha256:answerDigest,hash_metodo:'SHA-256 da sequência ordenada dos 60 gabaritos oficiais definitivos, itens 41–100; não é hash criptográfico do PDF.',criterio:'Gabarito oficial definitivo CEBRASPE — EBSERH 2018, Cargo 54: Técnico em Necrópsia.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura individual do item e do comando do bloco, classificação por assunto técnico e conferência das páginas originais.'},
  visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:apoio,motivo:`Página ${page} do caderno oficial associada ao item ${n}; texto conferido com o original renderizado.`},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],motivo:`Revisão v221 do item ${n}: matéria e conteúdo específicos, ano, certame/cargo, dificuldade estimada, gabarito definitivo e texto do original conferidos${corrections[n]?' com correção da grafia OCR':''}.`}
})
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,itens_revisados:60,anuladas:[],correcao_ocr:['60: duodenojejunal'],paginas_originais:2,publicado:false},null,2))
