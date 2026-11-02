import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc='55c0148f8ce7b86d',nome='revisao-stj-2018-analista-administrativo-pendencias-v274'
const prova='https://cdn.cebraspe.org.br/concursos/STJ_18/arquivos/MATRIZ_385_STJ001__PAG_3.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/STJ_18/arquivos/GAB_DEFINITIVO_385_STJ001.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/STJ_18/arquivos/STJ_18_JUSTIFICATIVAS_DE_ALTERA____ES_DE_GABARITO.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(raw.length!==48)throw Error(`Esperava 48 itens pendentes; encontrei ${raw.length}`)
const answers=`E E E C E C E C C X E C E C C E C X E C
C C E C E C E C C E E C E C X C E C E E
C C C X E E C C C E E E C E C C C E C C
E E C E C E E E C E E C X E C E C E E C`.trim().split(/\s+/)
if(answers.length!==80)throw Error(`Gabarito canônico: ${answers.length}/80`)
const keyFor=n=>answers[n-41],keyHash=createHash('sha256').update(answers.join('|')).digest('hex')
const exam='STJ 2018 — Cargo 1: Analista Judiciário — Área de Atividade Administrativa'
const topics={
44:['Direito Administrativo','Lei nº 8.112/1990 — independência das instâncias e repercussão da absolvição penal','Média'],
45:['Direito Administrativo','Lei nº 8.112/1990 — estágio probatório e afastamento para organismo internacional','Média'],
47:['Direito Administrativo','Lei nº 8.112/1990 — auxílio-moradia e requisitos de concessão','Fácil'],
48:['Direito Administrativo','Poderes administrativos — poder de polícia','Média'],
49:['Direito Administrativo','Poderes administrativos — delegação e avocação de competência','Média'],
51:['Direito Administrativo','Poderes administrativos — abuso de poder e excesso de poder','Média'],
52:['Direito Administrativo','Poderes administrativos — abuso de poder por ação ou omissão','Fácil'],
53:['Direito Administrativo','Princípios administrativos — segurança jurídica e irretroatividade de nova interpretação','Média'],
60:['Direito Administrativo','Licitações — margem de preferência para produtos nacionais com inovação tecnológica','Média'],
61:['Direito Administrativo','Licitações — Regime Diferenciado de Contratações e obras em estabelecimentos penais','Média'],
63:['Direito Administrativo','Responsabilidade civil do Estado e de prestadores de serviço público','Média'],
65:['Direito Administrativo','Controle judicial da Administração — mandado de segurança e habeas data','Média'],
67:['Direito Administrativo','Controle administrativo — supervisão ministerial de autarquias','Média'],
68:['Administração Pública','Modelos de Administração Pública — burocracia e princípios do modelo racional-legal','Média'],
69:['Administração Pública','Modelos de Administração Pública — patrimonialismo e formação do Estado brasileiro','Média'],
70:['Administração Pública','Modelos de Administração Pública — paradigma gerencial e pós-burocracia','Média'],
71:['Administração Pública','Gestão pública e privada — foco no cidadão e no cliente','Média'],
73:['Direito Administrativo','Princípios da Administração — legalidade no setor público e no setor privado','Média'],
76:['Administração','Comportamento organizacional — pesquisa de clima organizacional','Fácil'],
77:['Administração','Gestão por competências — competências essenciais e vantagem competitiva','Média'],
78:['Administração','Gestão por competências — conhecimentos, habilidades, atitudes e desempenho','Fácil'],
80:['Administração','Qualidade de vida no trabalho — conciliação entre objetivos individuais e organizacionais','Média'],
81:['Administração','Gestão da qualidade — cultura organizacional e melhoria contínua','Fácil'],
83:['Administração','Planejamento estratégico — diagnóstico organizacional e matriz SWOT','Média'],
84:['Administração','Planejamento estratégico — revisão de estratégias e implementação','Média'],
85:['Administração','Planejamento estratégico — processo de formulação da estratégia','Média'],
86:['Administração','Gestão de processos — padronização e melhoria de processos','Média'],
87:['Administração','Gestão de processos — brainstorming e diagnóstico organizacional','Fácil'],
88:['Administração','Gestão de processos — identificação e inventário de processos','Fácil'],
89:['Administração','Processo decisório — decisões não programadas, risco e incerteza','Média'],
90:['Administração','Processo decisório — decisões táticas e operacionais','Média'],
91:['Administração','Processo decisório — decisões programadas e julgamento gerencial','Média'],
92:['Administração','Estruturas organizacionais — estrutura matricial, coordenação e comunicação','Média'],
93:['Administração','Organização — critérios de departamentalização e fatores organizacionais','Média'],
94:['Administração','Estruturas organizacionais — configuração, autoridade e departamentalização','Média'],
96:['Administração Financeira e Orçamentária','Orçamento público — especificidade e discriminação de dotações','Média'],
98:['Administração Financeira e Orçamentária','Processo orçamentário — ciclo e iniciativa do projeto de LOA','Média'],
99:['Administração Financeira e Orçamentária','Processo orçamentário — elaboração e consolidação das propostas dos Poderes','Média'],
104:['Administração Financeira e Orçamentária','Receita pública — classificação econômica e resultado primário','Média'],
105:['Administração Financeira e Orçamentária','Orçamento-programa — classificação funcional e subtítulo/localizador do gasto','Média'],
106:['Administração Financeira e Orçamentária','Créditos orçamentários — alterações e autorização legislativa','Média'],
107:['Administração Financeira e Orçamentária','SIAFI — consulta ao plano de contas e eventos do sistema','Média'],
108:['Administração Financeira e Orçamentária','Execução orçamentária — descentralização de créditos e classificação institucional','Média'],
111:['Administração Financeira e Orçamentária','Dívida ativa — reconhecimento e classificação patrimonial','Média'],
112:['Administração Financeira e Orçamentária','Receita pública — fonte/destinação de recursos e vinculação','Média'],
118:['Administração Financeira e Orçamentária','Dívida pública — dívida consolidada e operações de crédito','Média'],
120:['Administração Financeira e Orçamentária','Responsabilidade Fiscal — limites individualizados de despesa e consequências do descumprimento','Difícil']
}
const duplicateId='extr-e333ab5f84187cab0092',canonicalId='extr-56f8ccb52a18bf3b9668'
const decisions=raw.map(q=>{
 const n=Number(q.numero),meta=topics[n],key=keyFor(n),page=Number(q.pagina)
 if(!meta)throw Error(`Sem classificação específica para o item ${n}`)
 if(!['C','E','X'].includes(key))throw Error(`Sem gabarito oficial no item ${n}`)
 let stem=String(q.enunciado||'').split(/\|\|IdentificaPDF\|\|/i)[0].replace(/\s+/g,' ').replace(/Oauxilio-moradia/i,'O auxílio-moradia').trim()
 if(!stem)throw Error(`Enunciado vazio no item ${n}`)
 const anulada=key==='X',duplicada=q.id===duplicateId
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:meta[0],conteudo:meta[1],ano:2018,concurso:exam,cargo:'Cargo 1 — Analista Judiciário, Área Administrativa',numero_original:n,pagina:page,dificuldade:meta[2],dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pela extensão normativa, integração de conceitos e quantidade de etapas de raciocínio; não publicada pela banca.',
  classificacao_fonte:prova,motivo:`Classificação feita pelo conteúdo do item e pelos cabeçalhos temáticos do caderno oficial de conhecimentos específicos do Cargo 1 do STJ.`,
  enunciado:stem,texto_apoio:q.apoio||null,opcoes:['Certo','Errado'],resposta_correta:anulada||duplicada?null:key==='C'?0:1,anulada:anulada||duplicada,
  ...(duplicada?{apta_resolucao:false,inelegibilidade_motivo:'Duplicata de extração do item 47; mantida como registro para auditoria, excluída da fila de resolução.',duplicada_de:canonicalId}:{apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']}),
  ...(!duplicada?{gabarito_oficial:{fonte:gabarito,sha256:keyHash,sha256_tipo:'sha256_da_transcricao_dos_80_itens_do_gabarito_definitivo; nao_e_hash_do_pdf',arquivo:'GAB_DEFINITIVO_385_STJ001.PDF',numero:n,pagina:1,resposta:key,criterio:anulada?'Item anulado no gabarito definitivo oficial.':'Resposta cotejada com o gabarito oficial definitivo do Cargo 1.',fontes_complementares:[justificativas]}}:{}),
  apta_resolucao:duplicada?false:true,
  visual:{pagina:page,imagem:q.imagem||null,motivo:`Página ${page} do caderno oficial preservada com o contexto visual existente.`}}
})
if(decisions.length!==48||new Set(decisions.map(x=>x.id)).size!==48)throw Error('Contagem ou unicidade inconsistentes')
if(decisions.filter(x=>x.anulada&&!x.duplicada_de).map(x=>x.numero_original).join(',')!=='84')throw Error('Anulação divergente do gabarito oficial')
if(decisions.filter(x=>x.duplicada_de).length!==1)throw Error('A duplicata do item 47 não foi identificada de forma única')
const base='tmp/revisao-profissional/revisao-ses-df-residencia-medica-intensiva-2016-2-pendencias-v273/acervo-extraido'
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## STJ 2018 — Analista Judiciário, Área Administrativa — v274\n\n- Revisei 48 registros pendentes e classifiquei matérias e tópicos em Direito Administrativo, Administração Pública, Administração e Administração Financeira e Orçamentária.\n- Vinculei o gabarito definitivo oficial; o item 84 está anulado. O registro duplicado do item 47 foi mantido para auditoria, mas excluído da resolução e da correção automática.\n- Corrigi espaços e OCR em enunciados sem remover o apoio visual. As dificuldades são estimativas editoriais. Alteração local, não publicada na nuvem.\n- Fontes oficiais: [caderno de conhecimentos específicos](<${prova}>), [gabarito definitivo](<${gabarito}>), [justificativas da banca](<${justificativas}>).\n`)
console.log(JSON.stringify({...report,documento:doc,revisadas:48,duplicatas:1,anuladas:1,publicacao:'local'},null,2))
