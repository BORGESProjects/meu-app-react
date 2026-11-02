import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='b741c2c1e3e08c52',prova='https://cdn.cebraspe.org.br/concursos/MP_TO_24_SERVIDOR/arquivos/952_MP_TO_016_01.PDF',gabarito='https://cdn.cebraspe.org.br/concursos/mp_to_24_servidor/arquivos/GAB_DEFINITIVO_952_MP_TO_016_01.PDF'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-tbg-auditoria-compliance-2023-v159'));if(start<0)throw Error('Base v159 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)}
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||!active.size)throw Error('Documento ou registros ativos ausentes')
const pages=new Map(catalog.questoes.map(q=>[q.id,q.pagina]))
const keyRows=[
 ['E','C','E','C','C','C','C','E','C','X','C','E','C','C','E','C','C','E','C','C'],
 ['E','E','C','E','C','C','C','E','E','C','C','E','E','E','C','E','E','C','E','C'],
 ['C','C','E','E','C','C','C','E','E','C','C','E','E','E','C','E','C','E','C','C'],
 ['E','E','E','C','E','C','E','E','C','C']
],key=new Map();let n=51;for(const row of keyRows)for(const a of row)key.set(n++,a);if(n!==121)throw Error('Gabarito incompleto')
const ranges=[
 [[51,60],'Fotografia','Fotografia — profundidade de campo, diafragma, obturador, ISO e exposição','Julgue os itens sobre fundamentos de fotografia e exposição.'],
 [[61,70],'Fotografia','Iluminação fotográfica, flash, luz natural, pós-produção, fotografia analógica e revelação','Com relação à iluminação, à pós-produção e aos processos fotográficos, julgue os itens.'],
 [[71,86],'Fotografia Digital e História da Fotografia','Fotografia digital, resolução, compartilhamento, história, bancos de imagem, licenciamento, sensores e câmeras','No que se refere à fotografia digital, à história da fotografia e ao uso de bancos de imagens, julgue os itens.'],
 [[87,90],'Composição Fotográfica','Composição, enquadramento, equilíbrio visual e regra dos terços','Julgue os itens relativos às técnicas de composição fotográfica.'],
 [[91,100],'Informática Básica','Sistemas operacionais, Windows 10, edição de imagens, PowerPoint, Excel, LibreOffice, e-mail e navegador','Julgue os itens sobre sistemas operacionais, aplicativos e serviços de internet.'],
 [[101,105],'Internet e Computação em Nuvem','Hashtags, pesquisa na web, modelos e serviços de computação em nuvem','Julgue os itens relativos à internet e à computação em nuvem.'],
 [[106,111],'Segurança da Informação','Organização de arquivos, extensões, criptografia, controle de acesso e assinatura digital','Julgue os itens sobre gerenciamento de arquivos e segurança da informação.'],
 [[112,120],'Segurança da Informação','Malware, antivírus, firewall, backup, armazenamento em nuvem e recuperação de dados','Julgue os itens relativos a malware, proteção de sistemas, backup e nuvem.']
]
const group=i=>ranges.find(([[a,b]])=>i>=a&&i<=b),fix=new Map([
 [56,'A distância focal da lente afeta a profundidade de campo.'],[60,'Alterar o ISO significa alterar a quantidade de luz que atinge o sensor da câmera fotográfica.'],
 [65,'A iluminação natural pode produzir sombras duras e contrastadas, conforme o direcionamento da luz e a regulagem da intensidade pelo fotógrafo.'],
 [70,'O controle do tempo de revelação fotográfica é essencial para que se obtenham resultados satisfatórios.'],
 [75,'Uma das vantagens oferecidas pela fotografia digital é a possibilidade de se visualizar a imagem logo após a captura, por meio de um visor ou monitor.'],
 [78,'Panning é uma técnica bastante utilizada por fotógrafos profissionais que exige o uso de velocidade mais baixa para que o fotógrafo acompanhe o movimento do objeto fotografado.'],
 [80,'Bancos de imagens fotográficas são plataformas que disponibilizam arquivos para download gratuito ou mediante pagamento.'],
 [81,'Sempre que uma fotografia de um(a) fotógrafo(a) profissional é licenciada em uma plataforma de banco de imagens, ele(a) recebe a remuneração prevista na licença.'],
 [82,'Toda fotografia, ao entrar em um banco de imagens, passa a ser de livre acesso e pode ser utilizada por qualquer pessoa gratuitamente.'],
 [84,'O avanço da tecnologia, a diminuição do custo, o aumento da qualidade, a facilidade no manuseio e a maior diversidade na pós-produção contribuíram para a expansão da fotografia digital.'],
 [89,'Ao fazer o enquadramento de uma fotografia, o fotógrafo sempre deve buscar a melhor maneira de preencher todo o espaço da imagem com o objeto fotografado.'],
 [90,'A regra dos terços divide a imagem em nove partes iguais, utilizando duas linhas horizontais e duas verticais; os elementos principais são posicionados sobre essas linhas ou em seus cruzamentos.'],
 [115,'Um firewall é um software ou equipamento que controla o tráfego de entrada e saída de uma rede, bloqueando conexões conforme regras de segurança.'],
 [119,'Ao se armazenar determinado arquivo em uma nuvem computacional pública, o acesso pode ser feito pela internet, condicionado às permissões e configurações de compartilhamento.']
])
const clean=(s='')=>s.replace(/\u000c/g,' ').replace(/952016(\d{5})\s*CEBRASPE[\s\S]*$/u,'').replace(/\s+(?:Acerca|Com relação|No que se refere|No que diz respeito|Julgue os itens|CEBRASPE)[\s\S]*$/u,'').replace(/\s+/g,' ').trim()
const canonical=new Map();for(const x of catalog.questoes){if(!canonical.has(x.numero))canonical.set(x.numero,x.id)}
const decisions=[...active.values()].map(q=>{
 const i=Number(q.numero_original??q.numero??q.numero_questao),g=group(i);if(!g||!key.has(i))throw Error(`Item ${q.id} sem classificação/gabarito`)
 const [[a,b],materia,conteudo,contexto]=g,p=pages.get(q.id)||1,stem=fix.get(i)||clean(q.enunciado),ans=key.get(i),dup=canonical.get(i)!==q.id
 if(!stem||stem.length<20)throw Error(`Enunciado ausente no item ${i}`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,concurso:'MPTO — Técnico Ministerial Especializado, Área de Atuação: Fotografia (Cargo 16); aplicação em 03/03/2024',numero_original:i,pagina:p,dificuldade:[51,53,56,58,60,65,67,70,75,78,81,82,84,87,89,90,94,97,99,103,109,111,113,115,118,120].includes(i)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência técnica; banca não publicou nível de dificuldade.',resposta_correta:ans==='X'?null:ans==='C'?0:1,anulada:ans==='X',gabarito_oficial:{valor:ans,fonte:gabarito,numero:i,resposta:ans,metodo:'Gabarito definitivo oficial do Cargo 16, aplicação em 03/03/2024.'},classificacao_fonte:prova,motivo:`Classificação baseada no enunciado, instrução do bloco e caderno oficial, página ${p}.`,visual:{pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto_apoio:contexto,motivo:`Página original ${p} do caderno vinculada ao bloco correspondente.`},enunciado:stem,...(dup?{apta_resolucao:false,duplicada_de:canonical.get(i),inelegibilidade_motivo:`Duplicata OCR do item ${i}; registro canônico ${canonical.get(i)}.`}:{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']})}
})
if(new Set(canonical.keys()).size!==70||decisions.some(d=>!pages.has(d.id)))throw Error(`Cobertura divergente: ${canonical.size} itens canônicos, ${decisions.length} registros`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:canonical.size,duplicatas:decisions.filter(d=>d.duplicada_de).length,anulada:[...key].filter(([,v])=>v==='X').map(([k])=>k),materias:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m).length]))},null,2));process.exit(0)}
const name='revisao-mpto-fotografia-2024-v160',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions});raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...report,prova,gabarito,registros_revistos:decisions.length,itens_unicos:canonical.size,anuladas:[...key].filter(([,v])=>v==='X').map(([k])=>k),publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
