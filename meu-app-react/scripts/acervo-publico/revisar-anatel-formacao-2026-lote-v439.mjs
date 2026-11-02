import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-anatel-formacao-2026-lote-v439'
const doc='73b84001d4d07363'
const prova='https://cdn.cebraspe.org.br/concursos/anatel_24/arquivos/AC36DB40C97E37909FB062325F6ED8BD94C56060B4975293C879626D6BCA2716.pdf'
const preliminar='https://cdn.cebraspe.org.br/concursos/anatel_24/arquivos/72F4E3AA6A35DEFCDA99CAE33F0F39027B83D8D13AD4E6376B20848D953439D7.pdf'
const justificativas='https://cdn.cebraspe.org.br/concursos/anatel_24/arquivos/160B7A4D972965126BDC328BDC81B941B6A263E4448B41C6559BA68597C192EE.pdf'
const concurso='ANATEL — Curso de Formação — 2ª Turma (2026)'
const cargo='Especialista em Regulação de Serviços Públicos de Telecomunicações'
const key=['C','X','E','E','E','E','C','E','C','E','E','C','C','E','C','E','C','E','C','C','E','E','E','C','E','C','C','E','E','C','E','E','E','C','C','E','C','E','E','C','E','C','E','C','C','E','C','E','E','C','E','C','C','E','E','C','E','E','C','C','C','E','E','C','C','E','C','E','C','E','E','C','C','E','C','E','C','X','E','E']
const keySha=hashRevisao(key.map((v,i)=>`${i+1}:${v}`).join('\n'))
const topic=new Map([
 [1,['Direito Administrativo','ANATEL: deliberação colegiada e atuação do Conselho Diretor','Média']],
 [2,['Direito Administrativo','Agências reguladoras: criação da ANATEL e reforma do setor de telecomunicações','Média']],
 [3,['Direito Administrativo','ANATEL: competências regulatórias, normativas, fiscalizatórias e sancionatórias','Média']],
 [4,['Direito Financeiro','FISTEL: natureza jurídica, arrecadação e financiamento da fiscalização','Média']],
 [5,['Administração Pública','Governança pública: relatório anual de gestão e prestação de contas','Média']],
 [6,['Direito Administrativo','ANATEL: composição e mandato do Conselho Consultivo','Fácil']],
 [7,['Direito Administrativo','ANATEL: composição, nomeação e requisitos do Conselho Diretor','Média']],
 [8,['Direito das Telecomunicações','Qualidade dos serviços: avaliação das respostas às reclamações de consumidores','Média']],
 [9,['Direito das Telecomunicações','Indicadores de qualidade e satisfação do consumidor em telecomunicações','Média']],
 [10,['Direito das Telecomunicações','Fiscalização de produtos: plano de combate à pirataria','Média']],
 [11,['Relações Internacionais','Cooperação regional: Foro Latino-Americano de Entes Reguladores de Telecomunicações','Média']],
 [12,['Relações Internacionais','Acordos internacionais: negociação e assinatura de memorandos de entendimento','Média']],
 [13,['Direito Administrativo','Fiscalização regulatória responsiva: aplicação do regulamento da ANATEL','Média']],
 [14,['Administração Pública','Planejamento estratégico: monitoramento e divulgação de metas institucionais','Média']],
 [15,['Telecomunicações','Infraestrutura de redes: expansão do backhaul de fibra óptica','Média']],
 [16,['Direito das Telecomunicações','Lei Geral de Telecomunicações: regimes público e privado de prestação','Média']],
 [17,['Administração Pública','Planejamento estratégico: visão institucional da ANATEL','Fácil']],
 [18,['Direito Administrativo','Estado regulador: papel estatal no setor de telecomunicações','Média']],
 [19,['Direito das Telecomunicações','Classificação dos serviços: regime de prestação e interesse coletivo ou restrito','Fácil']],
 [20,['Direito das Telecomunicações','STFC e SMP: chamadas de longa distância entre áreas de registro','Média']],
 [21,['Direito das Telecomunicações','Serviço de Comunicação Multimídia: limites de prestação e radiodifusão','Média']],
 [22,['Direito das Telecomunicações','STFC: delimitação da área local','Fácil']],
 [23,['Direito das Telecomunicações','SMP: regime de prestação e obrigações de universalização','Fácil']],
 [24,['Telecomunicações','Convergência tecnológica: compartilhamento de infraestrutura ativa e passiva','Fácil']],
 [25,['Telecomunicações','Redes 5G: fatiamento de rede e atendimento a requisitos de aplicações','Média']],
 [26,['Direito Administrativo','Agenda regulatória: consolidação e simplificação dos serviços de telecomunicações','Média']],
 [27,['Direito Administrativo','Fiscalização responsiva: diagnóstico e proposição de medidas de melhoria','Média']],
 [28,['Administração Pública','ANATEL: estrutura organizacional e fiscalização orientada a processos','Média']],
 [29,['Direito das Telecomunicações','Radiocomunicação: serviços primários e secundários','Média']],
 [30,['Direito das Telecomunicações','Espectro de radiofrequências: recurso limitado e bem público','Fácil']],
 [31,['Direito das Telecomunicações','Radiofrequência: equipamentos de radiação restrita e faixas militares','Média']],
 [32,['Telecomunicações','Gestão do espectro: atribuição e destinação de radiofrequências; papel da UIT','Difícil']],
 [33,['Direito Administrativo','Avaliação de Resultado Regulatório: monitoramento de obrigações e metas','Média']],
 [35,['Direito Administrativo','Análise de Impacto Regulatório: finalidade e etapas do processo normativo','Média']],
 [36,['Direito Administrativo','Análise de Impacto Regulatório: agenda regulatória e identificação de problemas','Média']],
 [37,['Direito Administrativo','Participação social: tomada de subsídios no processo regulatório','Média']],
 [38,['Direito do Consumidor','Telecomunicações: modalidades de pagamento de ofertas e serviços','Fácil']],
 [39,['Direito do Consumidor','Atendimento ao consumidor: protocolo e rastreabilidade de reclamações','Média']],
 [40,['Direito do Consumidor','RGC: contratação de ofertas pós-pagas por consumidores inadimplentes','Média']],
 [41,['Direito das Telecomunicações','ANATEL: tratamento de solicitações e resolução de conflitos de consumo','Média']],
 [42,['Direito das Telecomunicações','Conselhos de usuários: composição, natureza e participação social','Média']],
 [43,['Direito das Telecomunicações','Outorga de radiofrequência: procedimento concorrencial e uso primário','Difícil']],
 [44,['Direito das Telecomunicações','Regimes público e privado: autorização e liberdade tarifária','Média']],
 [45,['Economia','Regulação econômica de plataformas digitais e concorrência no setor','Difícil']],
 [46,['Economia','Regulação econômica: plataformas digitais e necessidade de intervenção','Média']],
 [47,['Economia','Lei Geral de Telecomunicações: concorrência e universalização','Média']],
 [48,['Telecomunicações','Inclusão digital: barreiras de acesso à internet e infraestrutura','Média']],
 [49,['Economia','História da regulação econômica e criação das agências reguladoras','Fácil']],
 [50,['Economia','Falhas de mercado e objetivos da regulação das telecomunicações','Média']],
 [51,['Direito das Telecomunicações','Avaliação da conformidade e homologação de produtos para telecomunicações','Média']],
 [52,['Direito das Telecomunicações','Homologação de produtos: avaliação de conformidade e etapas do processo','Média']],
 [53,['Informática','Inteligência artificial: automação e ferramentas de trabalho na ANATEL','Fácil']],
 [54,['Informática','Tecnologias emergentes: inovação e transformação de setores econômicos e sociais','Média']],
 [55,['Informática','Inteligência artificial: personalização, custos e tempo de implantação','Média']],
 [56,['Tecnologia da Informação','Tecnologias de informação e comunicação: efeitos sociais e econômicos','Fácil']],
 [57,['Administração Pública','Governo digital: integração, colaboração e compartilhamento de dados','Média']],
 [58,['Tecnologia da Informação','Transformação digital: digitalização, automação e mudança de processos','Média']],
 [59,['Administração Pública','Governo digital: transparência, dados abertos e accountability','Fácil']],
 [60,['Administração Pública','Transformação digital: redesenho de processos e interação com o público','Média']],
 [61,['Proteção de Dados','LGPD: princípio da necessidade e minimização de dados pessoais','Média']],
 [62,['Segurança da Informação','Gestão de credenciais e controle de acesso em organizações','Fácil']],
 [63,['Direito Administrativo','Fiscalização regulatória: integração entre acompanhamento e controle','Média']],
 [64,['Direito Administrativo','Fiscalização responsiva: contexto, antecedentes e colaboração do regulado','Média']],
 [65,['Direito Administrativo','Fiscalização regulatória: priorização e transparência no uso de recursos','Difícil']],
 [66,['Direito Administrativo','ANATEL: competências e organização das atividades de fiscalização','Média']],
 [67,['Direito Administrativo','Termo de Ajustamento de Conduta: inadimplemento e consequências regulatórias','Difícil']],
 [68,['Direito Administrativo','Processo de fiscalização: finalidade e conteúdo do relatório de fiscalização','Média']],
 [69,['Direito Administrativo','Processo administrativo sancionador: alegações finais no PADO','Média']],
 [70,['Direito Administrativo','Processo sancionador: consulta jurídica à Procuradoria Federal Especializada','Difícil']],
 [71,['Economia','Poder de mercado: medidas regulatórias assimétricas e proporcionalidade','Média']],
 [72,['Economia','PGMC: definição de prestadora de pequeno porte','Média']],
 [73,['Economia','Definição de mercado relevante: dimensões de produto e geográfica','Média']],
 [74,['Economia','Poder de mercado significativo: critérios de identificação no PGMC','Difícil']],
 [75,['Economia','Regulação assimétrica ex ante: teste de três critérios do PGMC','Difícil']],
 [76,['Direito Financeiro','Cobrança administrativa: constituição e vencimento de crédito da ANATEL','Média']],
 [77,['Direito Financeiro','Receitas públicas não tributárias: arrecadação de outorgas pela ANATEL','Fácil']],
 [78,['Direito Financeiro','Fundos setoriais: gestão do FISTEL, FUST e arrecadação da CFRP','Difícil']],
 [79,['Direito Tributário','Taxas de fiscalização: TFI, TFF e multas administrativas','Média']],
 [80,['Direito Financeiro','Dívida ativa e CADIN: inscrição e execução fiscal de créditos públicos','Média']]
])
const contexts=[
 [1,7,'Julgue os itens seguintes, acerca da criação da ANATEL, de sua estrutura e de suas competências, bem como da prestação de contas à sociedade.'],
 [8,9,'No que diz respeito à pesquisa de satisfação no âmbito da ANATEL e à qualidade do tratamento das reclamações registradas, julgue os itens seguintes.'],
 [10,10,'Julgue o item a respeito do combate à pirataria pela ANATEL.'],
 [11,12,'Julgue os itens relativos à atuação internacional da ANATEL.'],
 [13,13,'Em relação à atuação responsiva da ANATEL, julgue o item.'],
 [14,15,'Considerando o planejamento estratégico e a cadeia de valores da ANATEL, julgue os itens a seguir.'],
 [16,19,'Julgue os itens sobre o contexto histórico e a visão geral dos serviços de telecomunicações no Brasil.'],
 [20,23,'Julgue os itens acerca dos principais serviços de telecomunicações.'],
 [24,26,'Julgue os itens sobre convergência tecnológica, consolidação dos serviços de telecomunicações e tendências mercadológicas.'],
 [27,28,'No que se refere ao planejamento e às modalidades de fiscalização, julgue os itens.'],
 [29,32,'Julgue os itens sobre gestão do espectro e da órbita.'],
 [33,37,'Julgue os itens sobre as etapas do processo de regulamentação no âmbito da ANATEL.'],
 [38,42,'Julgue os itens sobre proteção e defesa dos direitos dos consumidores nos serviços de telecomunicações.'],
 [43,44,'Julgue os itens sobre outorgas e licenciamentos no setor de telecomunicações.'],
 [45,50,'Julgue os itens sobre conectividade, cidadania digital e fundamentos da regulação econômica setorial.'],
 [51,52,'Julgue os itens sobre avaliação da conformidade e homologação de produtos de telecomunicações.'],
 [53,56,'Julgue os itens sobre transformação digital, tecnologias emergentes e aplicações institucionais na ANATEL.'],
 [57,60,'Julgue os itens sobre a Estratégia Federal de Governo Digital.'],
 [61,62,'Julgue os itens com base na LGPD e no arcabouço legal de privacidade.'],
 [63,66,'Julgue os itens sobre aspectos gerais da fiscalização regulatória.'],
 [67,70,'Julgue os itens sobre acompanhamento e controle na fiscalização regulatória.'],
 [71,75,'Julgue os itens sobre fundamentos da regulação econômica setorial e o Plano Geral de Metas de Competição (PGMC).'],
 [76,80,'Julgue os itens sobre gestão da arrecadação da ANATEL.']
]
const contextFor=n=>contexts.find(([lo,hi])=>n>=lo&&n<=hi)?.[2]||''
const stripContext=(text,n)=>{
 let s=String(text||'')
 const tails={9:/\n\s*Julgue o próximo item, a respeito do combate à pirataria pela\s*ANATEL\.?\s*$/i,12:/\n\s*Em relação à atuação responsiva da ANA\s*TEL,? julgue o próximo\s*item\.?\s*$/i,13:/\n\s*Considerando o planejamento estratégico e a cadeia de valores da\s*ANATEL, julgue os itens a seguir\.?\s*$/i,19:/\n\s*CEBRASPE\s*[–-]\s*ANATEL\s*[–-]\s*Edital:\s*2024\s*\n\s*Julgue os seguintes itens, que versam sobre os principais serviços\s*de telecomunicações:?\s*$/i,26:/\n\s*No que se refere ao planejamento e modalidades de fiscalização,\s*julgue os próximos itens\.?\s*$/i,42:/\n\s*Com relação a outorgas e licenciamentos no setor de\s*telecomunicações, julgue os itens a seguir\.?\s*$/i,56:/\n\s*No que concerne à Estratégia Federal de Governo Digital, julgue\s*os seguintes itens\.?\s*$/i,60:/\n\s*Com base nas disposições da Lei Geral de Proteção de\s*Dados \(LGPD\) e no arcabouço legal de privacidade, julgue os\s*itens seguintes\.?\s*$/i,66:/\n\s*No que se refere ao acompanhamento e controle na fiscalização\s*regulatória, julgue os seguintes itens\.?\s*$/i,80:/\n\s*Espaço livre\s*$/i}
 if(tails[n])s=s.replace(tails[n],'')
 s=s.replace(/\s+/g,' ').trim().replace(/\s+([,.;:!?])/g,'$1')
 s=s.replace(/\b(destinam|referem|mantêm|membros|pós|pré)\s+-\s+([\p{L}])/gu,'$1-$2')
 s=s.replace(/\bme diante\b/gi,'mediante').replace(/\bInt ernet\b/g,'Internet').replace(/\bnã o\b/gi,'não').replace(/\b10\s+0%\b/g,'100%').replace(/\bcombat e\b/gi,'combate').replace(/\bconselheir o\b/gi,'conselheiro').replace(/\bconsultive\b/gi,'consultivo')
 return s
}
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==79||new Set(records.map(q=>q.id)).size!==79)throw Error('Fila mudou: esperados 79 registros únicos.')
const duplicates=new Map([['extr-6394e798c4176ee7dfb3','extr-61cc83353d7ae2659875'],['extr-684ca12233536611a95d','extr-6c5ec345b0ab9649bb9b']])
const decisions=records.map(q=>{
 const n=Number(q.numero),meta=topic.get(n)
 if(!meta)throw Error(`Questão ${n} sem classificação específica`)
 const duplicateOf=duplicates.get(q.id),annulled=key[n-1]==='X',ans=key[n-1]
 const page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 let stem=stripContext(q.enunciado,n)
 if(q.id==='extr-684ca12233536611a95d')stem='O relatório anual de gestão da ANATEL é elaborado pela Superintendência de Fiscalização, mediante a participação e o envolvimento de todos os órgãos da agência e de estruturas de governança previstas na Política de Governança, Gestão Executiva e Responsabilidade Socioambiental (PGGR).'
 if(q.id==='extr-61cc83353d7ae2659875')stem=stem.replace(/destinam\s*-\s*se/,'destinam-se')
 if(!stem||stem.length>1200)throw Error(`Enunciado inválido após reparo: ${n} ${q.id} (${stem.length})`)
 const duplicate=Boolean(duplicateOf)
 const decision={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,opcoes:['Certo','Errado'],materia:meta[0],conteudo:meta[1],ano:2026,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Curso de Formação — 2ª turma — prova objetiva aplicada em 29/03/2026',numero_original:n,numero:n,pagina:page,dificuldade:meta[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial individual baseada na complexidade normativa, técnica e interpretativa; não é dificuldade psicométrica publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n}, classificado pelo comando do bloco e pelo tema da afirmação no caderno oficial; página ${page} conferida visualmente.`,texto_apoio:contextFor(n),visual:{pagina:page,imagem:image,texto_apoio:contextFor(n),motivo:`Caderno oficial do Curso de Formação ANATEL, 2ª turma, item ${n}; página conferida visualmente para separar enunciado e comando.`},apta_resolucao:!duplicate,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']}
 if(duplicate){decision.inelegibilidade_motivo='duplicata de extração do mesmo item do caderno; mantido apenas o registro de referência';decision.duplicada_de=duplicateOf;decision.motivo+=` Duplicata identificada visualmente; registro canônico ${duplicateOf} permanece ativo.`;return decision}
 decision.resposta_correta=ans==='C'?0:ans==='E'?1:null
 decision.anulada=annulled
 decision.gabarito_oficial={valor:ans,fonte:preliminar,fontes:[preliminar,justificativas],arquivo:'Gabarito preliminar oficial CEBRASPE — Curso de Formação, 2ª turma; corrigido pelas justificativas definitivas',prova:'Caderno oficial do Curso de Formação — 2ª turma',sha256:keySha,sha256_tipo:'transcricao_canonica_do_gabarito_definitivo_reconstruido_com_fontes_oficiais; nao_e_hash_dos_pdfs',metodo:'Transcrição do gabarito preliminar oficial CEBRASPE, com aplicação das alterações/anulações do documento oficial de justificativas definitivas: item 2 anulado, item 77 alterado para C e item 78 anulado.',numero:n,resposta:ans==='X'?'Anulado':ans,criterio:annulled?'Item anulado no gabarito definitivo; sem correção automática.':'Gabarito definitivo reconstruído a partir da tabela preliminar oficial e das justificativas finais do Cebraspe.'}
 if(annulled)decision.resposta_correta=null
 return decision
})
for(const d of decisions){await fs.access(`public/acervo-extraido/${d.visual.imagem}`);if(d.apta_resolucao&&d.opcoes.length!==2)throw Error(`Item ${d.numero} sem formato C/E completo`)}
if(decisions.filter(d=>d.apta_resolucao).length!==77||decisions.filter(d=>d.inelegibilidade_motivo).length!==2)throw Error('Contagem após deduplicação deve ser 77 ativos e 2 duplicatas inativas.')
if(decisions.filter(d=>d.anulada).map(d=>d.numero).sort((a,b)=>a-b).join(',')!=='2,78')throw Error('Anulações divergentes do gabarito definitivo.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:79,validos:77,duplicatas_inativadas:2,anuladas:[2,78],gabarito:preliminar,justificativas_definitivas:justificativas,paginas_visuais:[1,2,3,4],publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`,rootFile='scripts/acervo-publico/acervo-atual.mjs',rootText=await fs.readFile(rootFile,'utf8')
if(!rootText.includes(rootLine))await fs.appendFile(rootFile,`\n${rootLine}\n`)
const report={...result,documento:doc,edicao:concurso,ano_aplicacao:2026,cargo,registros_revistos:79,questoes_unicas_ativas:77,duplicatas_inativadas:[{id:'extr-6394e798c4176ee7dfb3',duplicada_de:'extr-61cc83353d7ae2659875',numero:1},{id:'extr-684ca12233536611a95d',duplicada_de:'extr-6c5ec345b0ab9649bb9b',numero:5}],itens_anulados:[2,78],itens_gabaritados:77,paginas_conferidas:[1,2,3,4],caderno_oficial:prova,gabarito_preliminar_oficial:preliminar,justificativas_definitivas_oficiais:justificativas,alteracoes_definitivas:{2:'anulado',77:'Certo',78:'anulado'},extracoes_reparadas:['remoção de questões seguintes misturadas ao item 5 duplicado','remoção de comandos de bloco e rodapés agregados aos itens 9, 12, 13, 19, 26, 42, 56, 60, 66 e 80','correção de espaços OCR em itens selecionados'],imagens_contextos_conferidos:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))
