import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-capes-2024-cargo1-administracao-v286'
const base='tmp/revisao-profissional/revisao-see-pe-sociologia-2022-disc13-v285/acervo-extraido'
const doc='2e2239153e2ae27d'
const prova='https://cdn.cebraspe.org.br/concursos/capes_23/arquivos/947_CAPES_001_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/capes_23/arquivos/GAB_DEFINITIVO_947_CAPES_001_01.PDF'
const registro=JSON.parse((await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).find(x=>x.includes(`"documento_id": "${doc}"`)))
if(registro.status!=='tabela_lida'||registro.sha256!=='5d5f3ec06686a2a40717eb380c589d14ef0bb18eccf59561d45aac4893dca285')throw Error('Gabarito definitivo não está validado')
const chave={...registro.respostas,111:'C',112:'C',113:'E',114:'E',115:'C',116:'C',117:'E',118:'E',119:'E',120:'C'}
const temas={
51:['Direito Administrativo','Serviços públicos: conceito, finalidade coletiva e regime jurídico'],
52:['Administração Pública','Conceitos de Administração Pública: sentidos subjetivo e orgânico'],
53:['Administração Pública','Conceitos de Administração Pública: sentidos subjetivo e objetivo'],
54:['Administração Pública','Organização administrativa: organizações sociais e prestação de serviços públicos'],
55:['Administração Pública','Terceiro setor: entidades paraestatais e formas de constituição'],
56:['Administração Pública','Administração indireta: entidades de direito privado e atividades delegadas'],
57:['Direito Administrativo','Poder discricionário: limites legais e mérito administrativo'],
60:['Direito Administrativo','Atos administrativos: tipicidade e princípio da legalidade'],
70:['Direito Administrativo','Lei de Acesso à Informação: conteúdo do direito de acesso'],
71:['Direito Administrativo','Lei de Acesso à Informação: proteção de dados necessários à tutela de direitos fundamentais'],
72:['Proteção de Dados','LGPD: aplicação cumulativa das sanções administrativas'],
73:['Proteção de Dados','LGPD: tratamento de dados pessoais tornados públicos e interesse público'],
74:['Administração Pública','Administração gerencial: foco em resultados e relação com o modelo burocrático'],
75:['Administração Pública','Reforma do Estado de 1995: qualidade, custos e eficiência dos serviços públicos'],
80:['Administração Pública','Planejamento estratégico: missão institucional e propósito organizacional'],
82:['Administração','Processo decisório: fatores individuais, sociais e emocionais'],
84:['Administração','Estratégia competitiva: foco em segmento de clientes e diferenciação'],
87:['Administração','Comportamento organizacional: motivação, objetivos e liderança'],
88:['Administração','Estruturas organizacionais: hierarquia, centralização e autonomia'],
89:['Administração','Departamentalização territorial e adaptação às diferenças regionais'],
90:['Administração','Cultura organizacional: estabilidade e diferenças entre organizações'],
91:['Administração','Organização informal: redes sociais e relações espontâneas de trabalho'],
92:['Administração','Controle organizacional: objetivos, padrões, avaliação e ações corretivas'],
93:['Administração','Comunicação organizacional e marketing: integração de mensagens e resultados'],
94:['Administração','Controle estratégico e operacional: níveis, horizonte e orientação'],
95:['Administração','Delegação: definição de resultados esperados e autonomia decisória'],
96:['Administração','Sistemas de controle: detecção de desvios e orientação corretiva'],
97:['Administração de Recursos Materiais','Classificação de materiais: importância operacional e dificuldade de obtenção'],
98:['Administração de Recursos Materiais','Classificação de materiais: abrangência e descrição de atributos'],
99:['Administração de Recursos Materiais','Classificação de materiais: padronização e facilidade de comunicação'],
100:['Administração de Recursos Materiais','Gestão de estoques: curva ABC e classificação por valor de consumo'],
101:['Administração de Recursos Materiais','Classificação de materiais: aplicação geral e materiais de consumo'],
102:['Administração de Recursos Materiais','Gestão de estoques: custos de ruptura e falta de materiais'],
103:['Administração de Recursos Materiais','Gestão de estoques: giro e rotatividade de estoque'],
104:['Administração de Recursos Materiais','Gestão de estoques: proteção contra oscilações de demanda'],
105:['Administração de Recursos Materiais','Gestão de estoques: custos de riscos, perdas e avarias'],
106:['Administração de Recursos Materiais','Previsão de consumo: método da média móvel'],
107:['Administração de Recursos Materiais','Gestão de fornecedores: pós-venda, embalagens e custos por quantidade'],
108:['Administração de Recursos Materiais','Função de compras: suprimento de materiais e atendimento a clientes internos'],
109:['Administração de Recursos Materiais','Organização do setor de compras: centralização e prevenção de compras duplicadas'],
115:['Administração Pública','Contratações públicas: bens e serviços comuns e especificações usuais'],
116:['Administração de Recursos Materiais','Gestão patrimonial: baixa e inutilização de bens contaminados'],
117:['Administração de Recursos Materiais','Gestão patrimonial: tombamento e identificação de bens'],
118:['Administração de Recursos Materiais','Gestão patrimonial: sinistros e hipóteses de baixa'],
119:['Administração de Recursos Materiais','Gestão patrimonial: movimentação, requisição e recolhimento de bens'],
120:['Administração de Recursos Materiais','Gestão patrimonial: inventário geral no encerramento do exercício']
}
const dificil=new Set([53,55,56,57,64,67,68,72,73,74,77,82,84,87,90,94,95,96,97,99,100,103,104,106,107,108,109,115,116,118,119,120])
const qs=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(qs.length!==46)throw Error(`Esperados 46 itens; recebidos ${qs.length}`)
const letras={C:0,E:1}
const decisoes=qs.map(q=>{
 const n=Number(q.numero),tema=temas[n],answer=chave[n]
 if(!tema)throw Error(`Falta classificação específica para questão ${n}`)
 if(!['C','E','X'].includes(answer))throw Error(`Falta gabarito oficial para questão ${n}`)
 const pagina=Number(q.pagina),anulada=answer==='X',imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2024,concurso:'CAPES — Concurso 2023, aplicação em 17/03/2024 — Analista em Ciência e Tecnologia, Cargo 1',numero_original:n,pagina,dificuldade:dificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por exigência conceitual e complexidade de aplicação; não é taxa estatística oficial.',classificacao_fonte:prova,motivo:`Questão ${n} do Cargo 1: Analista em Ciência e Tecnologia. Classificada pelo tema específico do edital e pelo conteúdo do caderno oficial. Aplicação em 17/03/2024.`,visual:{pagina,imagem,motivo:'Página original do caderno oficial preservada para contexto, textos, leis e elementos visuais.'},gabarito_oficial:{fonte:gabarito,sha256:registro.sha256,numero:n,pagina:1,resposta:anulada?null:answer,criterio:anulada?'Gabarito definitivo oficial marca X; item anulado.':'Gabarito definitivo oficial do caderno 947_CAPES_001_01.'},resposta_correta:anulada?null:letras[answer],anulada,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado']}
 if(n===71&&q.enunciado.includes('Julgue os itens subsecutivos de acordo com a Lei'))d.visual.enunciado=q.enunciado.slice(0,q.enunciado.indexOf('Julgue os itens subsecutivos de acordo com a Lei')).trim()
 return d
})
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'CAPES — concurso 2023, aplicação 17/03/2024 — Analista em Ciência e Tecnologia, Cargo 1',documento_id:doc,registros_revisados:decisoes.length,questoes_unicas_classificadas:decisoes.length,questoes_anuladas:decisoes.filter(x=>x.anulada).map(x=>x.numero_original),ano_ajustado:2024,fontes:[prova,gabarito],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
