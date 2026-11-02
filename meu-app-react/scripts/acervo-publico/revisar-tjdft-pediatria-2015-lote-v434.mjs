import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisar-tjdft-pediatria-2015-lote-v434'
const doc='b86ae72130152088'
const prova='https://cdn.cebraspe.org.br/concursos/TJDFT_15_SERVIDOR/arquivos/216TJDFTSER_008_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/TJDFT_15_SERVIDOR/arquivos/Gab_Definitivo_216TJDFTSER_008_01.pdf'
const concurso='TJDFT 2015 — Analista Judiciário — Medicina — Pediatria'
const keyByNumber={51:'E',52:'E',53:'C',54:'E',68:'C',69:'C',70:'C',71:'E',72:'E',73:'C',74:'C',75:'E',99:'C',100:'E',101:'C'}
const canonical=Object.entries(keyByNumber).map(([n,k])=>`${n}:${k}`).join('\n')
const digest=createHash('sha256').update(`CEBRASPE|TJDFT2015|CARGO8|GABARITO_OFICIAL_DEFINITIVO|ITENS_SELECIONADOS\n${canonical}`).digest('hex')
const meta={
51:['Pediatria','Puericultura e desenvolvimento neuropsicomotor: reflexos primitivos, fixação visual e sorriso social','Média'],
52:['Pediatria','Nutrição e saúde bucal: hipovitaminose A e lesões orais','Média'],
53:['Pediatria','Puericultura e metabolismo ósseo: craniotabes, raquitismo e sífilis congênita','Média'],
54:['Pediatria','Nutrição infantil: avaliação do estado nutricional e orientação alimentar complementar','Média'],
68:['Pediatria','Gastroenterologia e urgência pediátrica: manejo da desidratação por diarreia (Plano B)','Média'],
69:['Pediatria','Alergia alimentar: manifestações clínicas da alergia à proteína do leite de vaca','Média'],
70:['Pediatria','Alergia alimentar: dieta de exclusão e momento seguro para reintrodução','Difícil'],
71:['Pediatria','Gastroenterologia: distinção entre hipolactasia e alergia alimentar','Média'],
72:['Pediatria','Parasitologia: prevenção de enterobíase e ancilostomíase','Fácil'],
73:['Pediatria','Parasitologia e nutrição: ascaridíase e enteropatia exsudativa','Média'],
74:['Pediatria','Cardiologia pediátrica: persistência do canal arterial e insuficiência cardíaca','Média'],
75:['Pediatria','Cardiologia pediátrica: estenose pulmonar e apresentação clínica','Média'],
99:['Pediatria','Oncologia pediátrica: diagnóstico do neuroblastoma e marcadores urinários','Difícil'],
100:['Pediatria','Oncologia pediátrica: tratamento do neuroblastoma','Média'],
101:['Pediatria','Oncologia pediátrica: secreção de catecolaminas e manifestações clínicas do neuroblastoma','Difícil']
}
const records=JSON.parse(await fs.readFile('tmp/proxima-fila-revisao.json','utf8'))
if(records.length!==15||new Set(records.map(q=>q.id)).size!==15)throw Error('Fila alterada: esperados 15 itens únicos.')
const limpa=s=>String(s||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
const decisions=records.map(q=>{
 const n=Number(q.numero),m=meta[n],key=keyByNumber[n];if(!m||!key)throw Error(`Item ${n} sem classificação ou gabarito oficial selecionado.`)
 let stem=limpa(q.enunciado)
 if(n===53)stem=stem.replace(/crânio t\s*abes/i,'crânio tabes')
 if(n===54)stem='O lactente é considerado obeso, sendo indicada intervenção nutricional com a administração de suco de frutas.'
 if(n===73)stem='A ascaridíase pode causar enteropatia exsudativa, prejudicando a absorção de proteínas.'
 if(n===99)stem='Para o diagnóstico do neuroblastoma, fazem-se necessários os seguintes exames: anatomopatológico de neuroblastoma no tecido tumoral e na medula óssea; e níveis de ácido vanilmandélico e de ácido homovanílico na urina.'
 const answer=key==='C'?0:1
 if(q.resposta!==answer)throw Error(`O registro ${n} diverge do gabarito definitivo: banco=${q.resposta}; oficial=${answer}.`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,materia:m[0],conteudo:m[1],ano:2015,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'20/12/2015',numero_original:n,dificuldade:m[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela integração de dados clínicos e aplicação de conceitos pediátricos; não é uma métrica psicométrica publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} de Pediatria identificado no caderno oficial do cargo 8; matéria e conteúdo definidos pelo tema clínico e confrontados com o gabarito definitivo da banca.`,resposta_correta:answer,anulada:false,gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'Gab_Definitivo_216TJDFTSER_008_01.pdf',prova:'216TJDFTSER_008_01.pdf',numero:n,criterio:'Gabarito oficial definitivo do cargo 8 — Analista Judiciário, Medicina, Pediatria.',sha256:digest,sha256_tipo:'transcricao_canonica_dos_itens_selecionados',metodo:'SHA-256 da transcrição canônica das respostas oficiais selecionadas; não representa hash dos bytes do PDF.'},...(stem!==limpa(q.enunciado)?{enunciado_original_revisado:true}:{}),apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','classificacao_pendente','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado']}
})
if(new Set(decisions.map(x=>x.numero_original)).size!==15||decisions.some(x=>x.opcoes))throw Error('Integridade dos 15 itens falhou.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:15,questoes_classificadas:15,gabaritos_conferidos:15,textos_corrigidos:[53,54,73,99],materia:'Pediatria',sha256_transcricao_oficial:digest,prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`,rootFile='scripts/acervo-publico/acervo-atual.mjs',rootText=await fs.readFile(rootFile,'utf8')
if(!rootText.includes(rootLine))await fs.appendFile(rootFile,`\n${rootLine}\n`)
const report={...result,documento:doc,concurso,ano:2015,questoes_revisadas:15,gabaritos_oficiais_vinculados:15,textos_corrigidos:[{numero:53,correcao:'crânio tabes'},{numero:54,correcao:'remoção de comando de vacinação anexado ao enunciado'},{numero:73,correcao:'remoção do comando da questão seguinte'},{numero:99,correcao:'correção de OCR em “anatomopatológico”'}],fonte_prova:prova,fonte_gabarito:gabarito,sha256_transcricao_oficial:digest,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
