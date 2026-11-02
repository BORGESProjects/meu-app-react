import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lotesAtuais,lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'

const sha=x=>createHash('sha256').update(x).digest('hex')
const docs='docs/acervo/revisao-profissional'
const entrada=await fs.readFile(`${docs}/apos-delimitacao-candidatos.json.gz`)
// A seleção abaixo corresponde exatamente aos 220 enunciados lidos nesta revisão.
assert.equal(sha(entrada),'5d77db39c14e0a4e8a2a2d3bd6b911c3dc42b8de1183f6ced42d1372f4796d76')
const selecionadas=JSON.parse(zlib.gunzipSync(entrada)).filter(q=>q.enunciado.length<=350&&!/\n\s*\n/u.test(q.enunciado)).slice(0,220)
const ajustes={
 7:['Português','Redação oficial: formas de tratamento','O objeto é a adequação do tratamento à autoridade destinatária.'],
 25:['Administração','Gestão de pessoas: análise e descrição de cargos','Requisitos funcionais de postos de trabalho, não requisitos de software.'],
 51:['Administração Financeira e Orçamentária','Responsabilidade fiscal: renúncia de receita','Benefício tributário e compensação de receita.'],
 60:['Administração Financeira e Orçamentária','Responsabilidade fiscal: teto de gastos e regime fiscal','O IPCA é citado como indexador do limite de despesa; a cobrança é orçamentária.'],
 75:['Direito Administrativo','Contratos administrativos: execução, alteração e extinção','Reajustamento do contrato após a proposta.'],
 78:['Português','Coesão e referenciação','Substituição de pronome demonstrativo por pessoal e manutenção da coesão.'],
 88:['Administração','Administração financeira: planejamento e viabilidade de negócios','Projeções financeiras usadas para avaliar viabilidade do negócio.'],
 92:['Português','Concordância verbal e nominal','Substituição de haver impessoal por ocorrer no plural.'],
 96:['Português','Colocação pronominal','Próclise ou ênclise em oração com elemento negativo.'],
 99:['Informática','Acesso remoto: conexão e controles de segurança','O objeto é a possibilidade de conexão remota à estação, considerando os controles de rede.'],
 111:['Português','Crase','O emprego do acento indicativo é o objeto explícito da pergunta.'],
 112:['Informática','Bancos de dados: Big Data e processamento de dados','Definição de Big Data e distinção em relação a data warehouse.'],
 140:['Arquivologia','Gestão documental: classificação e temporalidade','Esquema de classificação de documentos do Poder Executivo; CDD apenas como comparação.'],
 141:['Contabilidade','Mensuração contábil: ajuste a valor presente','Reconhecimento do passivo por aquisição e ajuste a valor presente.'],
 162:['Informática','Inteligência de negócios: data warehouse, OLAP e ETL','Chaves da tabela fato e vínculo às dimensões: modelagem dimensional.'],
 164:['Segurança do Trabalho','Ergonomia e fatores de risco psicossociais','Ritmo, carga de trabalho e fatores psicossociais; página original SESAU/AL conferida.'],
 176:['Informática','Segurança da informação: VPN e IPSec','Identificação de uma associação de segurança IPSec, não cálculo de endereços IP.'],
 179:['Contabilidade','Receitas: reconhecimento e contratos com clientes','Condições de reconhecimento de receita em contrato.'],
 197:['Informática','Inteligência de negócios: mineração de dados','Extração de padrões por data mining; data warehouse é apenas o repositório citado.'],
 210:['Contabilidade Pública','Mensuração e recuperabilidade de ativos','Potencial de serviços de ativos e redução ao valor recuperável; página PGE/RJ e MCASP consultados.'],
 211:['Direito Tributário','Tributos federais: IRPJ e regimes de tributação','Exigências de escrituração para opção pelo lucro presumido, não método das partidas dobradas.'],
 215:['Administração Financeira e Orçamentária','Receita pública: classificação e estágios','Ingressos temporários e sua natureza extraorçamentária.'],
 217:['Educação','Legislação e políticas educacionais','Estrutura da carreira no Estatuto do Magistério de Alagoas; comando original conferido.'],
 218:['Educação Física','Legislação e políticas educacionais','Hipóteses de prática facultativa da educação física na LDB, não regras de jornada trabalhista.'],
}
const visuais={
 9:{imagem:'paginas/32355c159a9feefa-0003.webp',pagina:3,
 enunciado:'Um firewall é incapaz de fazer roteamento.',
 texto_apoio:'Ferramentas de firewall são amplamente utilizadas em redes de computadores, de maneira a permitir ou negar determinado fluxo de pacotes. Com relação a firewall convencional de rede, julgue os itens subsecutivos.',
 motivo:'A linha horizontal após o item 91 separa o texto sobre memórias que pertence aos itens seguintes.'},
 31:{imagem:'paginas/fcfce9db8845009d-0003.webp',pagina:3,
 enunciado:'No Word 2013, ao se clicar, com o botão esquerdo do mouse, na seta no botão S̲ ▾, localizado na guia Página Inicial, grupo Fonte, serão mostradas opções para sublinhar um texto, tais como sublinhado duplo e sublinhado tracejado.',
 texto_apoio:'Julgue os próximos itens, relativos aos aplicativos para a edição de textos e planilhas do ambiente Microsoft Office 2013.',
 motivo:'Representação textual do ícone S sublinhado com seta; página correta vinculada e contexto de probabilidade da coluna anterior separado.'},
 95:{imagem:'paginas/6802fd1b6dbc3862-0002.webp',pagina:2,
 texto_apoio:'Ao redigir um ofício destinado a uma provedora de Internet, um delegado colocou as seguintes informações a respeito de uma possível captura de dados não autorizada pelo usuário de um sistema.\n\nURL correta de acesso ao sistema: https://suaconta.com.br/suaconta.html\nURL apresentada ao acessar o sistema: https://crazyserver.com.uk/suaconta.html\nPorta: 191.125.13.1\n\nO usuário digitava a URL correta de acesso ao sistema no browser, e a página da Web apresentada solicitava o preenchimento dos dados e a inserção de senha do usuário para acesso ao sistema.\n\nA respeito da situação hipotética apresentada e dos aspectos técnicos e legais a ela relacionados, julgue os itens a seguir.',
 motivo:'Texto-base e três linhas da tabela transcritos da coluna direita antes dos itens 32 a 35. O rótulo Porta foi preservado como impresso, sem corrigir a premissa da prova.'},
 195:{imagem:'paginas/d260a203e230d8b4-0001.webp',pagina:1,
 enunciado:'Parte sistemática e parte analítica são divisões de um tesauro.',
 texto_apoio:'Acerca de linguagens documentárias, descritores, elaboração de tesauros e vocabulários controlados, julgue os itens a seguir.',
 motivo:'Item 74 delimitado; apresentação da ABNT pertence ao bloco iniciado no item 75.'},
 210:{imagem:'paginas/f11e76ed0144f3f2-0001.webp',pagina:1,
 texto_apoio:'Relativamente aos procedimentos contábeis de reavaliação, redução ao valor recuperável e depreciação, julgue os itens a seguir.',
 motivo:'Comando da prova imediatamente anterior ao bloco dos itens 61 a 63 recuperado.'},
 217:{imagem:'paginas/e60cf00511c427c6-0002.webp',pagina:2,
 texto_apoio:'Considerando as disposições do Regime Jurídico Único dos Servidores Públicos Civis do Estado de Alagoas, das Autarquias e das Fundações Públicas Estaduais e as disposições do Estatuto do Magistério Público do Estado de Alagoas, julgue os itens que se seguem.',
 motivo:'Texto literário e perguntas da coluna esquerda removidos do apoio deste item de legislação, com preservação integral no histórico.'},
}
const mapa=new Map(selecionadas.map((p,i)=>[p.id,{p,i}]))
const bases=raizesAtuais.slice(raizesAtuais.findIndex(r=>r.includes('/revisao-justificativas-v2/')))
const destino='tmp/revisao-profissional/revisao-semantica-v1/acervo-extraido'
const m=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),facetas=criarIndiceFacetas(),auditoria=[]
await fs.mkdir(`${destino}/lotes`,{recursive:true})
let total=0,disponiveis=0,pendentes=0,lotes=0,bytes=0
for await(const {indice,questoes} of lotesAtuais(bases)){
 let mudou=false
 for(const q of questoes){
  total++
  const alvo=mapa.get(q.id)
  if(alvo){
   const {p,i}=alvo,antes=structuredClone(q)
   assert.equal(sha(q.enunciado),p.sha256_enunciado)
   assert.equal(q.classificacao_pendente,true)
   const [materia,conteudo,motivo]=ajustes[i]||[p.depois.materia,p.depois.conteudo,'Objeto disciplinar confirmado pela leitura individual do enunciado.']
   Object.assign(q,{materia,conteudo,classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.95,classificacao_metodo:'Leitura semântica individual do enunciado pelo assistente; sem certificação de todos os elementos visuais',classificacao_evidencia:motivo})
   const v=visuais[i]
   if(v){
    assert.equal(q.pagina,v.pagina)
    if(v.enunciado)q.enunciado=v.enunciado
    q.texto_apoio=v.texto_apoio
    q.pagina_imagem=v.imagem;q.imagens_paginas=[v.imagem];q.paginas_origem=[v.pagina];q.contexto_paginas=[{pagina:v.pagina,imagem:v.imagem}]
    q.revisao_semantica_visual={pagina:v.pagina,imagem:v.imagem,sha256:sha(await fs.readFile(path.join('public/acervo-extraido',v.imagem))),motivo:v.motivo,metodo:'Conferência visual individual da página original'}
   }
   for(const [campo,chave]of [['integridade_profissional','pendencias'],['elegibilidade','apontamentos']])if(q[campo]?.[chave])q[campo][chave]=q[campo][chave].filter(x=>x!=='classificacao_especifica_pendente')
   for(const campo of ['id','banca','ano','resposta_correta','gabarito_oficial','opcoes','fonte','anulada','dificuldade','transcricoes_ocr'])assert.deepEqual(q[campo],antes[campo])
   assert.equal(q.integridade_profissional?.apta_resolucao,antes.integridade_profissional?.apta_resolucao)
   if(!v)for(const campo of ['enunciado','texto_apoio','pagina_imagem','imagens_paginas','paginas_origem','contexto_paginas'])assert.deepEqual(q[campo],antes[campo])
   auditoria.push({id:q.id,indice_revisao:i,motivo,antes,depois:structuredClone(q)});mudou=true
  }
  if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
  if(q.classificacao_pendente)pendentes++
 }
 facetas.adicionar(indice,questoes)
 if(mudou){const b=zlib.gzipSync(JSON.stringify(questoes),{level:9});const arquivo=`lotes/semantica-${indice}-${sha(b).slice(0,12)}.json.gz`;m.lotes[indice].arquivo=arquivo;await fs.writeFile(path.join(destino,arquivo),b);bytes+=b.length;lotes++}
}
assert.equal(auditoria.length,220);assert.equal(total,m.questoes_extraidas_unicas);assert.equal(disponiveis,m.questoes_disponiveis_resolucao)
const f=facetas.finalizar();assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),disponiveis)
const fb=zlib.gzipSync(JSON.stringify(f),{level:9}),fa=`lotes/filtros-semantica-${sha(fb).slice(0,12)}.json.gz`
await fs.writeFile(path.join(destino,fa),fb);m.indice_facetas={arquivo:fa,sha256:sha(fb),versao:1};m.gerado_em=new Date().toISOString()
await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',bases));await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(m))
const r={gerado_em:m.gerado_em,classificadas:auditoria.length,sugestoes_automaticas_retificadas:Object.keys(ajustes).length,reconstrucoes_contexto_visual:Object.keys(visuais).length,total,disponiveis,pendentes,lotes_alterados:lotes,bytes,publicado:false,ids_banca_ano_gabaritos_alternativas_preservados:true}
await fs.writeFile(`${docs}/revisao-semantica.json`,JSON.stringify(r,null,2));await fs.writeFile(`${docs}/revisao-semantica-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(auditoria),{level:9}));console.log(JSON.stringify(r))
