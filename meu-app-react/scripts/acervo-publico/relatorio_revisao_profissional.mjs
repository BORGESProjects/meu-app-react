import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
const dir='docs/acervo/revisao-profissional',root='tmp/revisao-profissional/acervo-extraido'
const resumo=JSON.parse(await fs.readFile(path.join(dir,'resultado.json')))
const validacao=JSON.parse(await fs.readFile(path.join(dir,'validacao-pacote.json')))
const manifesto=JSON.parse(await fs.readFile(path.join(root,'manifesto.json')))
const fontes=new Map()
for(const file of ['conferencia-fontes-pdf.jsonl','conferencia-fontes-compactadas.jsonl'])for(const linha of (await fs.readFile(path.join(dir,file),'utf8')).split('\n'))if(linha.trim()){
 const r=JSON.parse(linha);if(!r.erro?.includes('[WinError 2]'))fontes.set(r.documento_id,r)
}
const grupos=new Map()
function contar(q){
 const nome=q.banca||'Sem aplicação comprovada',g=grupos.get(nome)||{aplicacao:nome,total:0,liberadas:0,comGabarito:0,semAno:0,classificacaoPendente:0}
 g.total++;if(q.integridade_profissional?.apta_resolucao)g.liberadas++
 if(q.resposta_correta!=null||q.resposta_soma!=null)g.comGabarito++
 if(!q.ano)g.semAno++
 if(q.integridade_profissional?.pendencias.includes('classificacao_especifica_pendente'))g.classificacaoPendente++
 grupos.set(nome,g)
}
for(const lot of manifesto.lotes)for(const q of JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,lot.arquivo)))))contar(q)
for(const q of JSON.parse(await fs.readFile('tmp/revisao-profissional/principal-revisado.json')))contar(q)
const linhas=[['Aplicação','Registros','Liberadas por estrutura','Com gabarito','Sem ano comprovado','Classificação específica pendente'],...[...grupos.values()].sort((a,b)=>a.aplicacao.localeCompare(b.aplicacao,'pt-BR')).map(g=>[g.aplicacao,g.total,g.liberadas,g.comGabarito,g.semAno,g.classificacaoPendente])]
const csv=v=>'"'+String(v).replaceAll('"','""')+'"'
await fs.writeFile(path.join(dir,'aplicacoes.csv'),'\uFEFF'+linhas.map(l=>l.map(csv).join(';')).join('\n'))
const indisponiveis=[...fontes.values()].filter(r=>r.status!=='pdf_lido').map(r=>({documento_id:r.documento_id,url:r.url,status:r.status,erro:r.erro||null}))
await fs.writeFile(path.join(dir,'fontes-pendentes.json'),JSON.stringify(indisponiveis,null,2))
const n=v=>Number(v).toLocaleString('pt-BR')
const texto=[
 '# Revisão do acervo AP Aprovado',
 '',
 'Estado: revisão estrutural e reclassificação automática publicadas no Cloudflare; a revisão individual integral permanece pendente. Consulte a comprovação de publicação da interface para seu estado final.',
 '',
 '## Resultado verificável',
 '',
 '- Registros auditados: '+n(resumo.registros)+' ('+n(resumo.principal)+' principais e '+n(resumo.complementar)+' complementares). O total informado anteriormente, 193.557, difere em 17 do total efetivamente encontrado no site e nos arquivos: 193.574.',
 '- Aplicações/organizadoras normalizadas no inventário: '+n(grupos.size)+'. Os filtros agrupam variantes equivalentes, como as unidades da PUC.',
 '- Campos alterados: banca/aplicação em '+n(resumo.alteracoes.banca)+' registros; matéria em '+n(resumo.alteracoes.materia)+'; conteúdo em '+n(resumo.alteracoes.conteudo)+'; ano em '+n(resumo.alteracoes.ano)+'. Essas contagens incluem normalizações de grafia e não significam igual número de verificações humanas.',
 '- Gabaritos novos vinculados: '+n(resumo.gabaritosNovosVinculados)+', com identificação do caderno, número e localização do enunciado no PDF; em múltipla escolha, ordem textual das alternativas conferida.',
 '- Documentos examinados: '+n(fontes.size)+'; PDFs lidos: '+n([...fontes.values()].filter(r=>r.status==='pdf_lido').length)+'; fontes ainda indisponíveis ou ambíguas: '+n(indisponiveis.length)+'.',
 '- Matérias com evidência de cabeçalho e localização do item: '+n(resumo.materiasComCabecalhoFonte)+'. As demais inferências usam sinais textuais e permanecem auditáveis.',
 '- Imagens locais referenciadas: '+n(resumo.imagensReferenciadas)+', sem referências ausentes na verificação de existência. Isso não equivale à revisão visual individual de cada imagem.',
 '- Registros liberados segundo os critérios estruturais: '+n(resumo.aptasResolucao)+'. A existência de classificação ou gabarito não prova, isoladamente, a completude pedagógica de um item.',
 '- Pacote complementar validado: '+n(validacao.registros)+' registros preservados, '+n(validacao.disponiveis)+' liberados. Enunciados, textos de apoio, alternativas e transcrições originais foram comparados e preservados.',
 '- Cloudflare: envio concluído de 3.875 arquivos pela área administrativa, catálogo por último. Uso exibido após o envio: 3,03 GB de 10 GB. Os lotes anteriores foram preservados para recuperação.',
 '',
 '## O que ainda impede declarar todo o banco revisado',
 '',
 '- '+n(resumo.classificacaoPendente)+' registros ainda precisam de classificação específica com evidência suficiente. Não foram declarados inteiramente classificados apenas porque receberam um rótulo automático.',
 '- '+n(resumo.semGabarito)+' registros seguem sem gabarito oficial vinculado; não recebem pontuação automática por suposição.',
 '- '+n(resumo.semAno)+' registros sem ano comprovado. Parte é material de assimilação sem aplicação oficial; anos de publicação de cursinhos não foram usados como ano da prova.',
 '- '+n(resumo.pendencias.texto_corrompido_requer_reconstrucao||0)+' registros com caracteres problemáticos; '+n(resumo.pendencias.multiplas_questoes_no_enunciado||0)+' com marcadores de questões misturados.',
 '- '+n(resumo.discursivas)+' discursivas e '+n(resumo.pendencias.documento_auxiliar_nao_e_questao||0)+' registros de documentos auxiliares identificados. Esses grupos e os defeitos estruturais ficam fora da resolução, sem exclusão dos originais.',
 '- '+n(resumo.duplicatasCandidatas)+' coincidências textuais requerem conferência antes de qualquer exclusão; IDs duplicados encontrados: '+n(resumo.idsDuplicados.length)+'.',
 '- O servidor antigo do acervo Fuvest apresentou certificado expirado; páginas alternativas oficiais retornaram erro 503 durante esta revisão. A validação de certificado não foi desativada.',
 '',
 '## Critérios e preservação',
 '',
 'A aplicação foi separada da organizadora quando comprovável: INEP não substitui ENEM/ENCCEJA/ENADE; Exército Brasileiro não substitui ESA/EsPCEx/IME. A classificação usa limites de palavra e assuntos compatíveis com a disciplina. A ordem das áreas do ENEM considera a mudança de 2017.',
 '',
 'Nomes promocionais no campo de concurso foram normalizados para exibição, mantendo os valores anteriores no histórico. Fontes, autoria legítima de textos e referências não foram apagadas. Esta revisão não certifica direitos de republicação de cada material.',
 '',
 'O banco do Supabase foi preservado. Os ajustes do acervo principal são aplicados por um índice complementar de metadados autenticado; os lotes maiores e as imagens continuam no Cloudflare. Não houve exclusão da tabela de questões nem alteração dos IDs de progresso.',
 '',
 'A auditoria completa está em auditoria-registro-a-registro.csv.gz; alterações em historico-alteracoes.json.gz; fontes não conferidas em fontes-pendentes.json; totais por aplicação em aplicacoes.csv; verificações mecânicas em validacao-pacote.json.',
 '',
 'Validação de código: 31 testes específicos passaram; compilação web concluída. A revisão estrutural automática não substitui a conferência humana de todas as 193.574 questões.',
 '',
 'Provas de execução: cloudflare-publicado.png e, após a conferência final, site-publicado.png.',
 '',
].join('\n')
await fs.writeFile(path.join(dir,'RELATORIO.md'),texto)
console.log(JSON.stringify({relatorio:path.join(dir,'RELATORIO.md'),aplicacoes:grupos.size,fontesPendentes:indisponiveis.length}))
