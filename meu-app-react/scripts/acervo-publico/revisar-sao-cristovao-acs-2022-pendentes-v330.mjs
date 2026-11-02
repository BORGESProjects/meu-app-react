import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='c6dcab54c9548856'
const prova='https://cdn.cebraspe.org.br/concursos/PREF_SAO_CRISTOVAO_SE_22/arquivos/718_PREF_SAO_CRISTOVAO_001_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/PREF_SAO_CRISTOVAO_SE_22/arquivos/GAB_DEFINITIVO_718_PREF_SAO_CRISTOVAO_001_01.PDF'
const concurso='Prefeitura de São Cristóvão/SE — Agente Comunitário de Saúde — 2022'
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.url!==prova)throw Error('A URL oficial da prova diverge do catálogo documental')
const keyRecord=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse).find(x=>x.documento_id===doc&&x.arquivo_gabarito==='GAB_DEFINITIVO_718_PREF_SAO_CRISTOVAO_001_01.PDF')
if(!keyRecord||keyRecord.status!=='tabela_lida'||keyRecord.respostas['51']!=='E'||keyRecord.respostas['110']!=='E')throw Error('Gabarito definitivo não conferido ou fora da faixa do Cargo 1')
const topics={
51:['Saúde Pública','Atenção à pessoa com deficiência e inclusão social','Média'],53:['Saúde Pública','Atenção integral à pessoa com deficiência','Média'],54:['Legislação em saúde','Direitos e prioridade de atendimento da pessoa com deficiência','Fácil'],
71:['Atenção Primária à Saúde','Territorialização e mapeamento da área de atuação da equipe','Fácil'],72:['Atenção Primária à Saúde','Planejamento territorial e estimativa populacional das equipes de ACS','Média'],73:['Atenção Primária à Saúde','Dimensionamento de microárea e população adscrita','Média'],74:['Atenção Primária à Saúde','Priorização de ações do ACS por vulnerabilidade e risco','Média'],75:['Vigilância em saúde','Atribuições do ACS no controle de doenças e agravos','Média'],77:['Atenção Primária à Saúde','Abordagem comunitária na Estratégia Saúde da Família','Fácil'],78:['Atenção Primária à Saúde','Acolhimento e vínculo como tecnologias do cuidado','Fácil'],
82:['Saúde da pessoa idosa','Notificação compulsória de violência contra a pessoa idosa','Média'],83:['Saúde da pessoa idosa','Cadastramento territorial e direitos da pessoa idosa','Fácil'],88:['Sistemas de informação em saúde','SISAB e sistemas da Atenção Básica','Difícil'],
89:['Educação em saúde','Autonomia e práticas educativas individuais e coletivas','Média'],90:['Saúde da criança','Caderneta da criança: crescimento e desenvolvimento','Fácil'],91:['Saúde da criança e do adolescente','Monitoramento de indicadores e metas municipais','Média'],93:['Saúde da criança','Aleitamento materno e introdução alimentar','Média'],95:['Imunização','Calendário vacinal e atenção à saúde do adolescente','Média'],
97:['Epidemiologia','Causalidade, exposição e suscetibilidade','Média'],98:['Epidemiologia','Tríade epidemiológica: agente, hospedeiro e ambiente','Média'],99:['Epidemiologia','Modelo de causas componentes e causas suficientes','Difícil'],100:['Saúde Pública','Níveis de prevenção segundo Leavell e Clark','Média'],101:['Políticas de saúde','Reforma Sanitária e Programa de Ações Integradas de Saúde','Difícil'],102:['Políticas de saúde','Reforma Sanitária e VIII Conferência Nacional de Saúde','Média'],103:['Políticas de saúde','Processo de implementação da Reforma Sanitária Brasileira','Difícil'],106:['Vigilância em saúde','Áreas de atuação da vigilância em saúde','Média'],107:['Saúde do trabalhador','Ações de vigilância em saúde do trabalhador','Média'],108:['Vigilância em saúde','Princípios da Política Nacional de Vigilância em Saúde','Média'],109:['Epidemiologia','Indicadores de saúde e nível de observação','Fácil']
}
const pendencias=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto']
const targets=records.filter(q=>q.conteudo==='Conteúdos gerais de Conhecimentos Específicos'&&q.classificacao_pendente&&q.integridade_profissional?.apta_resolucao===true)
const decisions=[]
for(const q of targets){
 const n=Number(q.numero),answer=keyRecord.respostas[String(n)]
 if(!topics[n]&&!['extr-0abecce0b5b3593b437d'].includes(q.id))continue
 if(!answer)continue
 if(q.id==='extr-0abecce0b5b3593b437d'){
  decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),apta_resolucao:false,inelegibilidade_motivo:'Extração mesclou os itens 69 e 70 em um único registro e o numerou incorretamente como 89. A página original mostra ambos separadamente; os registros individuais dos itens 69 e 70 já existem no acervo. Mantido fora da resolução para evitar duplicidade e gabarito errado.'})
  continue
 }
 const t=topics[n]
 if(!t||!answer||!['C','E'].includes(answer))throw Error(`Item ${n} sem classificação temática ou resposta definitiva conferida`)
 if(q.opcoes?.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Alternativas C/E divergentes no item ${n}`)
 if(!q.imagem||!q.pagina||!q.enunciado)throw Error(`Enunciado ou página original ausente no item ${n}`)
 const texto=n===89?q.enunciado.split('\nNo que se refere')[0]:q.enunciado
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2022,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — conhecimentos específicos — Cargo 1 — Agente Comunitário de Saúde',numero_original:n,pagina:Number(q.pagina),dificuldade:t[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na especificidade normativa e conceitual necessária; a banca não publica nível de dificuldade individual.',classificacao_fonte:prova,motivo:`Classificação individual pelo conteúdo do enunciado e pelo caderno oficial do Cargo 1; resposta conferida no gabarito definitivo do mesmo caderno.`,enunciado:texto,resposta_correta:answer==='C'?0:1,anulada:false,apta_resolucao:true,gabarito_oficial:{fonte:gabarito,arquivo:keyRecord.arquivo_gabarito,prova:keyRecord.arquivo_prova,sha256:keyRecord.sha256,numero:n,resposta:answer,criterio:'Gabarito definitivo CEBRASPE, caderno 001_01, Cargo 1; numeração e alternativas Certo/Errado conferidas.'},remover_pendencias:pendencias})
}
if(decisions.length!==30||decisions.filter(x=>x.apta_resolucao!==false).length!==29)throw Error(`Esperadas 30 decisões (29 válidas + 1 extração mesclada), obtidas ${decisions.length}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({avaliadas:decisions.length,classificadas:decisions.filter(x=>x.apta_resolucao).length,extraçãoInvalida:decisions.filter(x=>x.apta_resolucao===false).map(x=>x.id),fonte:prova,gabarito:gabarito,publicado:false},null,2));process.exit(0)}
const nome='revisao-sao-cristovao-acs-2022-pendentes-v330'
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,itensClassificados:29,itensComGabaritoDefinitivo:29,registrosInaptosPorMesclagem:1,faixaConfirmada:'51–110',questoesSemCorrespondenciaNoGabarito:targets.filter(q=>!keyRecord.respostas[String(q.numero)]).map(q=>q.numero),fonteProva:prova,fonteGabarito:gabarito,hashSha256Gabarito:keyRecord.sha256,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Prefeitura de São Cristóvão/SE — ACS 2022 — revisão v330\n\n- Classifiquei e associei ao gabarito definitivo 29 itens Certo/Errado do Cargo 1, com matéria, conteúdo, ano e dificuldade estimada.\n- Separei um registro OCR mesclado (itens 69 e 70 indevidamente combinado e renumerado como 89). Como ambos já têm registros próprios, o artefato foi desativado para resolução e correção automática.\n- Os itens sem correspondência exata com o gabarito do Cargo 1 foram preservados sem classificação nesta edição. As páginas originais e as alternativas Certo/Errado foram conferidas.\n- Validação local: ${result.total} registros; ${result.disponiveis} elegíveis; ${result.pendentes} pendências. A nuvem não foi publicada.\n- Fontes: [caderno oficial CEBRASPE](<${prova}>), [gabarito definitivo do Cargo 1](<${gabarito}>).\n`)
console.log(JSON.stringify(report,null,2))
