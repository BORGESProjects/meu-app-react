import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc = '48d76b15af94dfd2'
const prova = 'https://cdn.cebraspe.org.br/concursos/sefaz_se_21_auditor/arquivos/776_SEFAZ_SE_21_AUDITOR_001_01_PROVA_2.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/sefaz_se_21_auditor/arquivos/GAB_DEFINITIVO_776_SEFAZ_SE_21_AUDITOR_001_01_2_16_11_22.PDF'
const raw = JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`, 'utf8'))
const answers = ('EEECECCECECECEEECCEC' + 'ECEEECCXEECCECEEECCC' + 'CCEECECEEC').split('')
// Transcrição conferida no gabarito definitivo: itens 1–50. X = anulado.
const key = new Map(answers.map((v, i) => [i + 1, v]))
const keyHash = hashRevisao([...key].map(([n,v]) => `${n}:${v}`).join('|'))
const duplicates = new Map([
 ['extr-ade0853e25fea5909b3f','extr-5acc30c3c41304d55a03'],
 ['extr-7c8c2885a02cccbc885b','extr-2dd8ec5f388ef12c3954'],
 ['extr-0f5515c6c9c0b6b70617','extr-926aa554c1aa938cac50'],
 ['extr-31aa8c73956b9baeda05','extr-051198e7e1ee170cc550'],
 ['extr-93ffd8a9c4b08820b9da','extr-dacdc8a298d990264605'],
 ['extr-6fe71d65c90614d1078e','extr-175b390da0a9e72a16a2'],
 ['extr-2529621c0c3f1918ff16','extr-a99f49114a1d7c81cf48'],
])

const topicFor = n => {
 if (n <= 7) return ['Auditoria', 'Auditoria interna e externa — controles, testes e evidências']
 if (n <= 10) return ['Direito Tributário', 'IRPJ — lucro presumido, base de cálculo e alíquotas']
 if (n <= 16) return ['Auditoria', 'Auditor Eletrônico Nacional — origem, desenvolvimento e funcionalidades']
 if (n <= 20) return ['Auditoria', 'Auditor Eletrônico Nacional — cadastro, documentos fiscais e consulta']
 if (n <= 27) return ['Direito Tributário', 'Auditoria tributária, transformação digital e certificação digital']
 if (n <= 34) return ['Direito Tributário', 'Documentos fiscais eletrônicos, fiscalização e SPED']
 if (n === 35) return ['Contabilidade', 'Escrituração contábil e fiscal — obrigações de optantes pelo Simples Nacional e MEI']
 if (n <= 40) return ['Contabilidade', 'Normas Brasileiras de Contabilidade e auditoria independente']
 if (n === 47) return ['Auditoria', 'Auditoria independente — objetivo e opinião do auditor externo']
 if (n <= 46) return ['Auditoria', 'Auditoria interna, evidência e procedimentos de auditoria']
 return ['Auditoria', 'Testes de observância e testes substantivos']
}
const contextFor = n => {
 if (n <= 2) return 'Acerca das atribuições e funções das auditorias interna e externa, julgue os itens a seguir.'
 if (n <= 6) return 'Considerando os testes definidos na NBC TI 01 e os demais testes realizados em auditoria, julgue os itens a seguir.'
 if (n === 7) return 'No que se refere aos procedimentos e testes de auditoria interna, julgue o item.'
 if (n <= 10) return 'Em relação à tributação da renda no Brasil, julgue os itens.'
 if (n <= 16) return 'Com relação ao desenvolvimento do Auditor Eletrônico Nacional, julgue os itens a seguir.'
 if (n <= 20) return 'Julgue os itens seguintes relacionados às funcionalidades do Auditor Eletrônico Nacional.'
 if (n <= 27) return 'Julgue os próximos itens, relativos à transformação digital no setor público e à auditoria tributária.'
 if (n <= 34) return 'Julgue os itens acerca de documentos fiscais eletrônicos, fiscalização e escrituração digital.'
 if (n === 35) return 'No que se refere às obrigações de escrituração das microempresas, empresas de pequeno porte e microempreendedores individuais, julgue o item.'
 if (n <= 40) return 'A respeito das Normas Brasileiras de Contabilidade e da auditoria independente, julgue os itens.'
 if (n <= 45) return 'Acerca da classificação da auditoria e da evidência de auditoria, julgue os itens subsequentes.'
 if (n <= 47) return 'Considerando os procedimentos de auditoria e os testes de observância e substantivos, julgue os itens que se seguem.'
 return 'Considerando os procedimentos de auditoria e os testes de observância e substantivos, julgue os itens.'
}
const clean = (x, n) => {
 let s = (x || '').replace(/\u000c/g,' ').replace(/\s+/g,' ').trim()
 if (n === 20) s = s.replace(/\s+TRANSFORMAÇÃO DIGITAL NO SETOR PÚBLICO[\s\S]*$/iu,'')
 if (n === 27) s = s.replace(/\s+776001_01N859998\s+CEBRASPE[\s\S]*$/iu,'')
 if (n === 35) s = s.replace(/\s+PROCESSO ADMINISTRATIVO FISCAL[\s\S]*$/iu,'')
 if (n === 40) s = s.replace(/\s+Acerca da classificação da auditoria e da evidência de auditoria[\s\S]*$/iu,'')
 if (n === 46) s = s.replace(/\s+Considerando os procedimentos de auditoria e os testes de observância[\s\S]*$/iu,'')
 if (n === 3) s = s.replace(/\s+Considerando os testes definidos na NBC TI 01[\s\S]*$/iu,'')
 return s.replace(/\s+([.,;:!?])/g,'$1').trim()
}

const start = raizesAtuais.findIndex(r => r.includes('revisao-sefaz-se-auditoria-2022-v150'))
if (start < 0) throw new Error('Base v150 não encontrada')
const base = raizesAtuais[start], bases = raizesAtuais.slice(start)
const manifest = JSON.parse(await lerArquivoAtual('manifesto.json', bases))
const active = new Map()
for (const lot of manifest.lotes) {
 if (!lot.arquivo) continue
 const qs = JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for (const q of qs) if (q.documento_id === doc) active.set(q.id,q)
}
 if (raw.length !== 57 || raw.some(x => !active.has(x.id))) throw new Error(`Lote inesperado: ${raw.length} registros`)
const decisions = raw.map(x => {
 const n = Number(x.numero), q = active.get(x.id), answer = key.get(n), [materia,conteudo] = topicFor(n)
 if (!answer || !x.imagem?.startsWith(`paginas/${doc}-`)) throw new Error(`Gabarito/imagem ausente no item ${n}`)
 const dup = duplicates.get(x.id), stem = clean(x.enunciado,n)
 if (!dup && stem.length < 35) throw new Error(`Enunciado curto no item ${n}`)
 const annulled = answer === 'X', context = contextFor(n)
 return {
  id:x.id, sha256_enunciado:hashRevisao(q.enunciado), materia, conteudo,
  ano:2022, concurso:'SEFAZ/SE — Auditor Técnico de Tributos, edital 2021 — 2ª prova objetiva (aplicada em 16/11/2022)',
  numero_original:n, pagina:Number(x.pagina), dificuldade:[3,8,10,12,14,16,21,23,25,26,31,33,39,44,46,49].includes(n)?'Difícil':'Média',
  dificuldade_estimada:true, dificuldade_evidencia:'Estimativa editorial pela densidade técnica e normativa; o CEBRASPE não publicou nível oficial de dificuldade.',
  resposta_correta:annulled?null:answer==='C'?0:1, anulada:annulled,
  gabarito_oficial:{valor:answer,fonte:gabarito,sha256:keyHash,sha256_tipo:'hash_da_transcricao_canonica_dos_itens_1_a_50_do_gabarito_oficial_definitivo',numero:n,resposta:answer,metodo:'Gabarito definitivo oficial da 2ª prova objetiva; aplicação em 16/11/2022. O hash identifica a transcrição, não o arquivo PDF.'},
  classificacao_fonte:prova, motivo:`Item ${n} confrontado com o caderno oficial e o gabarito definitivo. Ano corresponde à data de aplicação.`,
  ...(dup?{apta_resolucao:false,duplicada_de:dup,inelegibilidade_motivo:`Duplicata OCR do item ${n}; preservada para auditoria, com a versão mais íntegra disponível no ID ${dup}.`}:{enunciado:stem,texto_apoio:context,imagem_pagina:x.imagem,imagens_contexto:[{pagina:Number(x.pagina),imagem:x.imagem,texto:context}],reemplazarContexto:true,apta_resolucao:true}),
  remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']
 }
})
if (process.argv.includes('--dry-run')) {
 console.log(JSON.stringify({registros:decisions.length,unicos:decisions.filter(d=>!d.duplicada_de).length,duplicatas:decisions.filter(d=>d.duplicada_de).length,answers:key.size,anuladas:[...key].filter(([,v])=>v==='X').map(([n])=>n),semChave:raw.filter(x=>!key.has(Number(x.numero))).map(x=>x.numero),materias:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m).length])),stemMinimo:Math.min(...decisions.filter(d=>!d.duplicada_de).map(d=>d.enunciado.length))},null,2)); process.exit(0)
}
const report = await aplicarRevisoesIndividuais({nome:'revisao-sefaz-se-auditoria-2022-v151',base,decisoes:decisions})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-sefaz-se-auditoria-2022-v151/acervo-extraido')
const output={...report,fonte_prova:prova,fonte_gabarito:gabarito,registros_revistos:decisions.length,questoes_unicas:decisions.filter(d=>!d.duplicada_de).length,duplicatas_inelegiveis:decisions.filter(d=>d.duplicada_de).length,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero_original),contextos_e_imagens_associados:true,publicada:false}
await fs.writeFile('docs/acervo/revisao-profissional/revisao-sefaz-se-auditoria-2022-v151.json',JSON.stringify(output,null,2))
console.log(JSON.stringify(output,null,2))
