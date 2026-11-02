import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const base='tmp/revisao-profissional/revisao-fub-refrigeracao-v90/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-fub-agronomia.json','utf8'))
const topicos=new Map()
const definir=(numeros,materia,conteudo)=>numeros.forEach(n=>topicos.set(n,{materia,conteudo}))
definir([51,52,53,54,55,56],'Geoprocessamento e Sensoriamento Remoto','Georreferenciamento, pontos de controle, reamostragem e satélites de observação da Terra')
definir([57,58,59,60],'Sistemas de Informação Geográfica','Bandas de sensores, álgebra de mapas, escala cartográfica e dados vetoriais/raster')
definir([61],'Estatística Aplicada','Estimativa de densidade por kernel e análise espacial de eventos')
definir([62,63,64],'Topografia e Cartografia','Leitura de curvas de nível, declividade e cotas altimétricas')
definir([65,70],'Direito Ambiental','Código Florestal: áreas de preservação permanente e reserva legal')
definir([66,67,68,69],'Silvicultura e Sistemas Agroflorestais','Concessão florestal, serviços ecossistêmicos, restauração de mata ciliar e sistemas agrossilvipastoris')
definir([71,73,74,75],'Fitossanidade','Pragas, doenças, avaliação de severidade, manejo e segurança no uso de agrotóxicos')
definir([72],'Fitotecnia','Adubação verde, manejo de plantas espontâneas e melhoria do solo')
definir([76,77,78,79],'Economia e Extensão Rural','Desenvolvimento rural, agricultura orgânica, difusão de tecnologia e inovação agrícola')
definir([80,81,82,83],'Tecnologia de Produtos Agropecuários','Armazenamento, sanitização, uso da terra e conservação pós-colheita de hortaliças')
definir([84,85,86],'Engenharia Rural e Avaliações','Ética profissional, laudos, perícia e avaliação de imóveis rurais')
definir([87,88,89],'Ciência do Solo','Consistência, classificação, gênese e intemperismo dos solos')
definir([90],'Fertilidade do Solo','Ciclo do nitrogênio e transformações do nitrogênio no sistema solo-planta-atmosfera')
definir([91,92,93,94,95,96,97],'Fertilidade do Solo','Física e química do solo, nutrientes, micorrizas, fosfatagem, calagem e adubação')
definir([98,99],'Agrometeorologia','Zoneamento climático, maturação de frutos e interpretação de climogramas')
definir([100,101,102],'Irrigação e Drenagem','Uniformidade de pressão, drenagem subterrânea e escoamento em condutos')
definir([103,104],'Mecanização Agrícola','Colheita de grãos e planejamento/controle de operações mecanizadas')
definir([105,106],'Nutrição e Metabolismo Animal','Acidose ruminal, balanço energético e cetose em bovinos leiteiros')
definir([107,108],'Reprodução Animal','Estacionalidade reprodutiva e flushing em fêmeas suínas')
definir([109,110,111,112,113],'Nutrição Animal','Alimentos energéticos e proteicos, gossipol, intoxicação por ureia e suplementação')
definir([114,115,116],'Forragicultura e Pastagens','Lotação contínua, manejo de pastagem e características de gramíneas forrageiras')
definir([117,118],'Instalações Rurais','Orientação de galpões avícolas e instalações para ovinos e caprinos')
definir([119,120],'Melhoramento Genético Animal','Herdabilidade e influência ambiental sobre características de produção')

const correcoesEnunciado={
 53:'Entre os métodos comumente utilizados na reamostragem, incluem-se o vizinho mais próximo, os polinômios de 2.º grau e a krigagem.',
 57:'Dos quatro sistemas de satélites mencionados, Terra MODIS é o que opera com maior número de bandas espectrais.',
}
const decisoes=pendentes.map(q=>{
 const n=q.numero_original,t=topicos.get(n)
 if(!t)throw Error(`Sem classificação específica para o item ${n}`)
 const pagina=q.pagina
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t.materia,conteudo:t.conteudo,ano:2016,numero_original:n,pagina,
  ...(correcoesEnunciado[n]?{enunciado:correcoesEnunciado[n]}:{}),
  dificuldade:'Média',dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pela leitura do item e pela aplicação de conceitos de agronomia exigidos no cargo; não constitui classificação oficial da banca.',
  motivo:`Caderno oficial CEBRASPE/FUB 2016, cargo 1 — Engenheiro, área Agronômica. Classificação individual conforme o enunciado e o bloco temático original.`,
  visual:{pagina,imagem:`paginas/${q.documento_id}-${String(pagina).padStart(4,'0')}.webp`,motivo:'Página original conferida visualmente; preserva mapas, curvas de nível e demais figuras/contextos do item.'}
 }
})
const report=await aplicarRevisoesIndividuais({nome:'revisao-fub-agronomia-v91',base,decisoes})
await fs.writeFile('docs/acervo/revisao-profissional/revisao-fub-agronomia-v91-notas.json',JSON.stringify({prova:'FUB 2016 — cargo 1, Engenheiro/área Agronômica',fonte:'https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_001_01.pdf',paginasConferidas:[1,2,3,4],itensRevisados:decisoes.length,itens:[...topicos.keys()].sort((a,b)=>a-b),correcoesDeOcr:Object.keys(correcoesEnunciado),relatorio:report},null,2))
