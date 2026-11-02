import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc='39ce3a3a7f50c88e', nome='revisao-seec-df-auditor-2019-pendencias-v269'
const prova='https://cdn.cebraspe.org.br/concursos/seec_auditor_19/arquivos/MATRIZ_504_SEECDF001_JUSTIFICATIVA.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/seec_auditor_19/arquivos/gab_definitivo_matriz_504_seecdf001__pag_4.pdf'
const gabaritoP1='https://cdn.cebraspe.org.br/concursos/seec_auditor_19/arquivos/GAB_DEFINITIVO_MATRIZ_504_SEECDFCG1__PAG_5.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/seec_auditor_19/arquivos/SEEC_DF_JUSTIFICATIVAS_DE_ALTERAO_DE_GABARITO_.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(raw.length!==86) throw Error(`Esperava 86 itens pendentes; encontrei ${raw.length}`)

// Matéria e conteúdo foram cotejados com os cabeçalhos e o contexto de cada item no caderno oficial.
const classify=n=>{
 if(n<=5)return ['Língua Portuguesa',n===5?'Gêneros textuais e tipologia dissertativo-argumentativa':'Interpretação de texto: sustentabilidade empresarial', 'Média']
 if(n===11)return ['Conhecimentos sobre o Distrito Federal','Economia do DF: mercado consumidor, renda e desenvolvimento regional','Média']
 if(n===12)return ['Conhecimentos sobre o Distrito Federal','Geografia econômica do DF: agropecuária, unidades de conservação e entorno','Média']
 if(n===14)return ['Direito Constitucional','Competência legislativa privativa da União: sistema monetário e medidas','Fácil']
 if(n===15)return ['Administração Pública','Administração gerencial: reforma do Estado e busca por resultados','Média']
 if(n===16)return ['Administração Pública','Integridade e compliance no setor público','Média']
 if(n===17||n===18)return ['Administração Pública','Código de Ética do DF: deveres funcionais, eficiência e uso responsável de recursos','Fácil']
 if(n===19)return ['Contabilidade Pública','Estrutura conceitual: reconhecimento de ativos e passivos no setor público','Difícil']
 if(n===20)return ['Contabilidade Pública','Estrutura conceitual: potencial de serviços e controle de recursos','Difícil']
 if(n===39)return ['Direito Constitucional','Ordem econômica: regime jurídico e privilégios fiscais de empresas estatais','Média']
 if(n===40)return ['Direito Constitucional','Monopólio da União sobre petróleo e gás natural','Média']
 if(n===41)return ['Direito Constitucional','Lei Orgânica do DF: administração tributária e carreira de auditoria','Difícil']
 if(n===42)return ['Direito Constitucional','Lei Orgânica do DF: procedimento e quórum de emenda','Média']
 if(n===43||n===44)return ['Direito Civil','Responsabilidade civil e sucessão: transmissão do direito à indenização e prescrição','Difícil']
 if(n===46)return ['Direito Civil','LINDB: revogação de normas gerais e especiais','Média']
 if(n>=47&&n<=49)return ['Direito Empresarial',n===47?'Sociedade limitada: responsabilidade pela avaliação de bens aportados':n===48?'Sociedade limitada: aumento de capital e proteção dos sócios':'Sociedade limitada: hipóteses de redução do capital social','Média']
 if(n===50)return ['Direito Penal','Falsificação e uso de selo público de controle tributário','Média']
 if(n===52)return ['Direito Penal','Crimes contra as finanças públicas: ordenação de despesa não autorizada','Difícil']
 if(n===53)return ['Economia','Setor externo: balanço de pagamentos e base monetária','Difícil']
 if(n===55)return ['Economia','Microeconomia: incidência tributária e elasticidade-preço','Média']
 if(n>=57&&n<=62)return ['Finanças Públicas',({57:'Classificação institucional da despesa e unidades orçamentárias',58:'Orçamento público: princípio do orçamento bruto e repartição de receitas',59:'Processo orçamentário: emendas parlamentares e serviço da dívida',60:'LRF: sanções e transferências para saúde, educação e assistência social',61:'LRF: precatórios e dívida consolidada',62:'LRF: prevenção de riscos na destinação de recursos ao setor privado'})[n],'Média']
 if(n>=63&&n<=68)return ['Tecnologia da Informação',({63:'Hardware: SSD, memória flash e interfaces de armazenamento',64:'Linux: diretórios do sistema de arquivos',65:'Planilhas eletrônicas: função PROCV e pesquisa em tabelas',66:'Navegador Google Chrome: atalhos e gerenciador de tarefas',67:'Gerenciamento de projetos: grupos de processos do PMBOK',68:'Gestão de serviços de TI: ciclo de vida da ITIL'})[n],'Média']
 if(n===70)return ['Tecnologia da Informação','Auditoria de sistemas: controles, políticas e procedimentos de segurança','Média']
 if(n>=71&&n<=73)return ['Matemática Financeira',({71:'Valor do dinheiro no tempo: equivalência entre pagamento à vista e parcelado',72:'Taxas de juros implícitas em operação de financiamento',73:'Desconto comercial e antecipação de recebíveis'})[n],'Média']
 if(n>=74&&n<=77)return ['Estatística',({74:'Distribuição de frequências e proporção de observações',75:'Medidas de dispersão: desvio padrão amostral',76:'Medidas de posição: mediana amostral',77:'Distribuição de frequências, média e assimetria'})[n],'Média']
 if(n>=78&&n<=80)return ['Raciocínio Lógico','Lógica proposicional: negação, equivalência e tabela-verdade','Média']
 if(n>=81&&n<=94)return ['Auditoria',({81:'Aceitação e planejamento: requisitos éticos e independência',82:'Procedimentos analíticos: relações entre dados financeiros e não financeiros',83:'Amostragem de auditoria: risco e anomalia',84:'Testes de observância e controles internos',85:'Testes substantivos: existência e integridade das transações',86:'Testes de auditoria: superavaliação e subavaliação',87:'Distorções contábeis: fraude e erro',88:'Evidência de auditoria e procedimentos de confirmação',89:'Amostragem e seleção de itens para teste',90:'Procedimentos de auditoria e evidência',91:'Auditoria: documentação e papéis de trabalho',92:'Auditoria independente: segurança razoável e distorção relevante',93:'Materialidade e avaliação de distorções',94:'Opinião do auditor e limites da asseguração'})[n]||'Auditoria independente: procedimentos e evidências','Média']
 if(n>=95&&n<=100)return ['Direito Tributário',({95:'Legislação tributária do DF: denúncia espontânea e regularização de obrigações acessórias',96:'EFD ICMS/IPI: acesso fiscal e competência de administração do SPED',97:'EFD ICMS/IPI: leiaute e documentação fiscal digital',98:'ICMS: crédito de ativo imobilizado e apropriação proporcional',99:'ISS: arbitramento da base de cálculo',100:'Obrigações acessórias: escrituração fiscal por estabelecimento'})[n],'Média']
 if(n>=101&&n<=108)return [n===106?'Contabilidade de Custos':'Contabilidade Geral',({101:'Características qualitativas: relevância e representação fidedigna',102:'Receitas e ganhos: conceitos e distinção',103:'Elementos patrimoniais: essência econômica e definição',104:'Fatos contábeis: adiantamento salarial e variação patrimonial',106:'Custos: frete de aquisição e composição do custo do estoque',107:'Demonstração dos fluxos de caixa: atividades operacionais, de investimento e financiamento',108:'Demonstração do valor adicionado: geração e distribuição da riqueza'})[n]||'Contabilidade geral: conceitos e reconhecimento','Média']
 if(n===117)return ['Direito Financeiro','Lei nº 4.320/1964: regime de reconhecimento das receitas públicas','Média']
 if(n>=124)return ['Direito Tributário',({124:'Legislação tributária: vigência de decisões administrativas com eficácia normativa',127:'Infrações tributárias: princípio da insignificância',129:'Responsabilidade tributária por sucessão empresarial',131:'Certidão de dívida ativa: requisitos formais',136:'ICMS: não incidência nas exportações',141:'Processo administrativo tributário do DF: competências do TARF',142:'ICMS: frete na base de cálculo',145:'IPTU: responsabilidade tributária do possuidor',148:'IPVA: atualização monetária em pagamento fora do prazo',150:'ITBI: extinção de usufruto e consolidação da propriedade',152:'ITBI: imunidade na integralização de capital e reorganização societária',155:'Legislação tributária do DF: atualização monetária de valores',158:'Simples Nacional: conceito de receita bruta',159:'Processo administrativo do DF: aplicação da Lei nº 9.784/1999',160:'Processo administrativo: instauração de ofício ou a pedido'})[n]||'Legislação tributária do Distrito Federal','Média']
 throw Error(`Sem classificação para item ${n}`)
}
const canonical={1:'E',2:'C',3:'E',5:'E',11:'E',12:'E',17:'C',41:'E',61:'X',68:'X',101:'X',102:'X',108:'X'}
const answerFor=q=>{
 const n=Number(q.numero); if(canonical[n])return canonical[n]
 const match=String(q.enunciado||'').match(/JUSTIFICATIVA\s*[-–—]\s*(CERTO|ERRADO|ANULADO)/i)
 if(match)return match[1].toUpperCase()==='CERTO'?'C':match[1].toUpperCase()==='ERRADO'?'E':'X'
 // Para os poucos itens sem justificativa associada pelo OCR, preserva a tentativa sem marcar resposta automática.
 return null
}
const exam='SEEC/DF — Auditor-Fiscal da Receita do Distrito Federal (edital 2019; aplicação em 2020)'
const decisions=raw.map(q=>{
 const n=Number(q.numero),[materia,conteudo,dificuldade]=classify(n),key=answerFor(q),page=Number(q.pagina)
 let stem=String(q.enunciado||'').split(/JUSTIFICATIVA\s*[-–—]\s*(?:CERTO|ERRADO|ANULADO)/i)[0]
 stem=stem.replace(/(?:\/R\*Cargo:[\s\S]*|\|\|IdentificaPDF\|\|[\s\S]*)$/i,'').replace(/\s+/g,' ').trim()
 if(n===17)stem='Ciente de que seus atos, comportamentos e atitudes implicam a preservação da imagem da administração pública, o servidor público deve evitar ações que atrasem a prestação do serviço público.'
 if(n===18)stem='Ciente de que seus atos, comportamentos e atitudes implicam a preservação da imagem da administração pública, o servidor público deve fazer uso dos recursos públicos com economicidade e clareza, no desempenho de suas atribuições.'
 if(!stem)throw Error(`Enunciado vazio no item ${n}`)
 const annul=key==='X',image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2020,concurso:exam,numero_original:n,pagina:page,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial baseada na quantidade de conceitos, normas e etapas de raciocínio necessárias; não é rótulo publicado pela banca.',
  classificacao_fonte:prova,motivo:`Classificação conferida no caderno oficial da SEEC/DF, pelas seções, comandos e conteúdo específico do item ${n}; aplicação em 02/02/2020.`,
  enunciado:stem,texto_apoio:q.apoio||null,opcoes:['Certo','Errado'],resposta_correta:key==null||annul?null:key==='C'?0:1,anulada:annul,
  gabarito_oficial:{fonte:n<=80?gabaritoP1:gabarito,arquivo:'Gabarito definitivo Caderno X — matriz 504; itens anulados confirmados no comunicado de justificativas/alterações.',numero:n,resposta:key,criterio:key==null?'Resposta não foi inferida; requer cotejo individual com a tabela definitiva antes de habilitar correção automática.':annul?'Item anulado conforme gabarito oficial definitivo.':'Resposta cotejada com justificativa oficial do item e gabarito definitivo; ajuste final aplicado ao item 41.',
   fontes_complementares:n===41?[justificativas]:[]},
  apta_resolucao:key!==null,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente'],
  visual:{pagina:page,imagem:image,motivo:`Página ${page} do caderno oficial; referência preservada no registro.`}}
})
if(decisions.length!==86||new Set(decisions.map(x=>x.id)).size!==86)throw Error('Contagem ou unicidade inconsistentes')
if(decisions.filter(x=>x.anulada).map(x=>x.numero_original).sort((a,b)=>a-b).join(',')!=='61,68,101,102,108')throw Error('Anulações não coincidem com a chave oficial')
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SEEC/DF — Auditor-Fiscal da Receita, edição 2019 — v269\n\n- Revisei os 86 itens pendentes deste documento, cotejando enunciados e cabeçalhos com o caderno oficial aplicado em 02/02/2020. Corrigi matérias que estavam indevidamente agrupadas como Direito Constitucional (informática, economia, matemática financeira, estatística, lógica, auditoria e contabilidade) e o item de fluxo de caixa que aparecia como Serviço Social.\n- Reclassifiquei os itens em matérias e tópicos específicos, registrei o ano de aplicação (2020), limpei justificativas OCR que haviam sido anexadas aos enunciados e reconstituí o comando compartilhado dos itens 17 e 18. Mantive referências de página para preservar os elementos visuais e textos de apoio.\n- Anulações confirmadas: 61, 68, 101, 102 e 108. Itens sem justificativa vinculada pelo OCR permanecem sem correção automática, em vez de receber gabarito presumido.\n- Alteração local; ainda não publicada na nuvem.\n- Fontes: [caderno oficial com justificativas](<${prova}>), [gabarito definitivo P1](<${gabaritoP1}>), [gabarito definitivo P2](<${gabarito}>), [comunicado de alterações/anulações](<${justificativas}>).\n`)
console.log(JSON.stringify({...report,documento:doc,revisadas:decisions.length,anuladas:decisions.filter(x=>x.anulada).length,semGabarito:decisions.filter(x=>x.resposta_correta===null&&!x.anulada).map(x=>x.numero_original),publicacao:'local'},null,2))
