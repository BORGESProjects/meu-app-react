const n=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/gu,'').toLowerCase().replace(/\s+/gu,' ')
export const regrasDireito=[
 ['afo-planejamento','Administração Financeira e Orçamentária','Planejamento orçamentário: PPA, LDO e LOA',/\b(?:plano plurianual|lei de diretrizes orcamentarias|lei orcamentaria anual)\b/],
 ['afo-receita','Administração Financeira e Orçamentária','Receita pública: classificação e estágios',/\b(?:receitas? orcamentarias?|receitas? extraorcamentarias?|receitas? correntes?|receitas? de capital|estagios da receita|arrecadacao da receita|recolhimento da receita)\b/],
 ['afo-creditos','Administração Financeira e Orçamentária','Créditos adicionais: suplementares, especiais e extraordinários',/\b(?:creditos? (?:suplementares?|especiais?|extraordinarios?|adicionais?))\b/],
 ['afo-restos','Administração Financeira e Orçamentária','Execução da despesa: restos a pagar e despesas de exercícios anteriores',/\b(?:restos a pagar|despesas? de exercicios anteriores)\b/],
 ['afo-estagios','Administração Financeira e Orçamentária','Despesa pública: empenho, liquidação e pagamento',/\b(?:empenho da despesa|nota de empenho|liquidacao de despesas?|liquidacao da despesa|despesa empenhada|despesas empenhadas)\b/],
 ['afo-suprimento','Administração Financeira e Orçamentária','Execução financeira: suprimento de fundos',/\bsuprimento de fundos\b/],
 ['afo-principios','Administração Financeira e Orçamentária','Orçamento público: princípios orçamentários',/\bprincipio (?:orcamentario|da exclusividade|da anualidade|da unidade|da universalidade)\b.{0,180}\borcament|\borcament\w*.{0,180}\bprincipio (?:da exclusividade|da anualidade|da unidade|da universalidade)\b/],
 ['afo-lrf','Administração Financeira e Orçamentária','Responsabilidade fiscal: limites e controle de despesas',/\b(?:limite prudencial|relatorio de gestao fiscal|relatorio resumido da execucao orcamentaria|lei de responsabilidade fiscal)\b/],
 ['cont-balanco','Contabilidade','Demonstrações contábeis: balanço patrimonial',/\bbalanco patrimonial\b/],
 ['cont-dre','Contabilidade','Demonstrações contábeis: resultado do exercício',/\bdemonstracao (?:do resultado|de resultado)\b/],
 ['cont-fluxo','Contabilidade','Demonstrações contábeis: fluxos de caixa',/\bdemonstracao (?:dos |de )?fluxos? de caixa\b/],
 ['cont-escrita','Contabilidade','Escrituração: partidas dobradas e lançamentos contábeis',/\b(?:partidas dobradas|lancamentos? contabeis?|escrituracao contabil)\b/],
 ['cont-custos','Contabilidade','Contabilidade de custos: sistemas de custeio',/\b(?:custeio por absorcao|custeio variavel|custeio baseado em atividades|custo dos produtos vendidos|custo das mercadorias vendidas)\b/],
 ['cont-valor','Contabilidade','Ativos: mensuração, depreciação e recuperabilidade',/\b(?:valor recuperavel|perda por desvalorizacao|teste de recuperabilidade|reduca[oã] ao valor recuperavel|impairment|depreciacao acumulada)\b/],
 ['cont-publica','Contabilidade Pública','Demonstrações contábeis aplicadas ao setor público',/\b(?:balanco orcamentario|balanco financeiro|demonstracao das variacoes patrimoniais|pcasp|mcasp)\b/],
 ['adm-licitacao','Direito Administrativo','Licitações: modalidades, contratação direta e procedimento',/\b(?:licitacao|licitacoes|licitatorio|licitatorios|inexigibilidade|pregao eletronico|pregao presencial)\b/],
 ['adm-contrato','Direito Administrativo','Contratos administrativos: execução, alteração e extinção',/\bcontratos? administrativos?\b/],
 ['adm-disciplinar','Direito Administrativo','Servidores públicos: processo administrativo disciplinar',/\b(?:processo administrativo disciplinar|sindicancia administrativa|penalidade de demissao)\b/],
 ['adm-improbidade','Direito Administrativo','Improbidade administrativa',/\bimprobidade administrativa\b/],
 ['adm-responsabilidade','Direito Administrativo','Responsabilidade civil do Estado',/\b(?:responsabilidade civil do estado|teoria do risco administrativo)\b/],
 ['const-controle','Direito Constitucional','Controle de constitucionalidade',/\b(?:controle de constitucionalidade|controle concentrado|controle difuso|acao direta de inconstitucionalidade|acao declaratoria de constitucionalidade|arguicao de descumprimento de preceito fundamental)\b/],
 ['const-competencias','Direito Constitucional','Organização do Estado: repartição de competências',/\b(?:competencia legislativa (?:concorrente|privativa)|competencia privativa da uniao|competencia concorrente|reparticao de competencias|competencias legislativas)\b/],
 ['const-poder','Direito Constitucional','Poder constituinte e reforma constitucional',/\b(?:poder constituinte|clausulas? petreas?|emenda constitucional)\b/],
 ['tributario-credito','Direito Tributário','Obrigação e crédito tributário',/\b(?:credito tributario|obrigacao tributaria|lancamento tributario|suspensao da exigibilidade)\b/],
 ['tributario-imunidade','Direito Tributário','Limitações ao poder de tributar: imunidades e princípios',/\b(?:imunidade tributaria|imunidades tributarias|anterioridade tributaria|capacidade contributiva|principio da anterioridade nonagesimal)\b/],
 ['civil-reais','Direito Civil','Direitos reais: posse, propriedade e usucapião',/\b(?:usucapiao|posse de boa-fe|posse de ma-fe|direito real de superficie|servidao predial)\b/],
 ['civil-sucessoes','Direito Civil','Direito das sucessões: herança e testamento',/\b(?:sucessao legitima|sucessao testamentaria|herdeiros necessarios|testamento publico|testamento cerrado|heranca jacente|heranca vacante)\b/],
 ['civil-negocios','Direito Civil','Negócios jurídicos: existência, validade e defeitos',/\b(?:negocio juridico|negocios juridicos|vicio de consentimento|vicios de consentimento)\b/],
 ['penal-teoria','Direito Penal','Teoria do crime: tipicidade, ilicitude e culpabilidade',/\b(?:erro de tipo|erro de proibicao|crime impossivel|excludente de ilicitude|excludentes de ilicitude|culpabilidade penal|tipicidade penal)\b/],
 ['penal-administracao','Direito Penal','Crimes contra a Administração Pública',/\b(?:crime de peculato|crime de concussao|crime de prevaricacao|corrupcao passiva|corrupcao ativa)\b/],
 ['processual-penal','Direito Processual Penal','Investigação criminal e inquérito policial',/\b(?:inquerito policial|indiciamento|investigacao criminal)\b/],
 ['processual-civil','Direito Processual Civil','Tutelas provisórias: urgência e evidência',/\b(?:tutela de urgencia|tutela de evidencia|tutela antecipada|tutela provisoria)\b/],
 ['previdencia-complementar','Direito Previdenciário','Previdência complementar',/\b(?:previdencia complementar|previdencia privada|entidades? fechadas? de previdencia|entidades? abertas? de previdencia)\b/],
 ['previdencia-regimes','Direito Previdenciário','Regimes previdenciários e segurados',/\b(?:regime geral de previdencia social|regime proprio de previdencia social|segurado facultativo|segurado especial|segurado obrigatorio)\b/],
 ['trabalho-jornada','Direito do Trabalho','Jornada de trabalho: duração, intervalos e horas extras',/\b(?:intervalo intrajornada|intervalo interjornada|horas extraordinarias|banco de horas|jornada (?:de trabalho|12 por 36))\b/],
 ['trabalho-contrato','Direito do Trabalho','Contrato de trabalho: vínculos, alteração e extinção',/\b(?:contrato de trabalho|rescisao indireta|rescisao trabalhista|aviso previo|verbas rescisorias)\b/],
]
export function classificarDireito(q){
 const t=n(q.enunciado)
 if(/justificativa|gabarito|\?/u.test(t)||/^\s*\d{1,3}[.\s]+\S/mu.test(String(q.enunciado||'')))return null
 if(/\bjulgue\b|revolucao|levantes populares|plano real|processo inflacionario/.test(t))return null
 if(!q.classificacao_pendente||q.integridade_profissional?.apta_resolucao===false||q.classificacao_revisada)return null
 if(t.length<35||t.length>2000)return null
 if(/\b(?:no texto|do texto|texto apresentado|trecho|pronome|vocabulo|gramatical|sintatica|reescrit|coesao|conjuncao|pode ser substituid|segundo o autor|de acordo com o autor|julgue (?:os|o) (?:itens|item|proximos)|according to|choose the|read the text)\b/.test(t))return null
 const matches=regrasDireito.filter(([, , ,re])=>re.test(t))
 if(!matches.length)return null
 const temas=new Set(matches.map(([id])=>id))
 // Demonstrações públicas e privadas ou orçamento versus escrituração exigem revisão contextual.
 if(new Set(matches.map(([,materia])=>materia)).size>1)return null
 // Um tópico específico é necessário; se dois objetos competem, não resolver por ordem arbitrária.
 if(temas.size>1)return null
 const [regra,materia,conteudo,re]=matches[0]
 if(regra==='adm-contrato'&&/sistema unico de saude|rede privada de saude|\bsus\b/.test(t))return null
 if(regra==='civil-negocios'&&/trespasse|estabelecimento empresarial/.test(t))return null
 if(regra==='previdencia-complementar'&&/derivativo|bolsa de valores|mercadorias e futuros/.test(t))return null
 if(regra==='afo-planejamento'&&/coso|controles? internos?/.test(t))return null
 if(regra==='processual-penal'&&/prisao|fianca|liberdade provisoria/.test(t))return null
 if(regra==='penal-administracao'&&/fianca|prisao|autoridade policial|crime hediondo/.test(t))return null
 if(regra==='const-controle'&&/cotas raciais|estatuto da igualdade/.test(t))return null
 if(regra==='penal-teoria'&&/magistrado|citacao|audiencia|denuncia|instrucao|absolvicao sumaria/.test(t))return null
 if(regra==='afo-estagios'&&/carta-contrato|contrato poderia ser|substitui.{0,40}contrato/.test(t))return null
 if(regra==='civil-sucessoes'&&/contrato de doacao|doacao inoficiosa/.test(t))return null
 if(regra==='trabalho-jornada'&&/educacao fisica|pratica facultativa|alunos de cursos/.test(t))return null
 if(regra==='adm-licitacao'&&/reajustamento|reequilibrio economico|reajuste contratual/.test(t))return null
 if(regra==='cont-valor'&&/potencial de (?:geracao de )?servicos/.test(t))return null
 if(regra==='previdencia-regimes'&&/carencia|beneficio|auxilio|aposentadoria|pensao/.test(t))return null
 if(regra==='cont-publica'&&/pcasp|mcasp/.test(t)&&!/balanco|demonstracao/.test(t))return null
 if(regra==='const-poder'&&/fontes do direito/.test(t))return null
 if(materia==='Direito Administrativo'&&/\b(?:crime|crimes|penal|penais|pena de|detencao|reclusao|licitacao fraudulenta)\b/.test(t))return null
 if(materia==='Contabilidade'&&/\b(?:setor publico|ente publico|entidade publica|contabilidade publica)\b/.test(t))return null
 if(regra==='const-poder'&&/\b(?:aposentadoria|previdencia|servidor|pensao)\b/.test(t))return null
 const evidencia=t.match(re)[0]
 const assunto=regra==='cont-dre'&&/resultado abrangente/.test(t)?'Demonstrações contábeis: resultado abrangente':regra==='cont-custos'?'Contabilidade de custos: conceitos, classificação e custeio':conteudo
 return {regra,materia,conteudo:assunto,classificacao_evidencia:evidencia,classificacao_confianca:0.9,classificacao_metodo:'Objeto jurídico, orçamentário ou contábil explícito no enunciado; abstém em conflitos e comandos linguísticos',classificacao_pendente:false}
}
