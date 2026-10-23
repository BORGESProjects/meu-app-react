import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const passos = [
  ['Extrair e indexar as questões do corpus', 'extrair_questoes_acervo.mjs', []],
  ['Renderizar páginas e reconhecer texto ausente', 'completar_paginas_questoes.mjs', process.argv.slice(2)],
  ['Atualizar os lotes com os resultados do OCR', 'extrair_questoes_acervo.mjs', []],
  ['Remover páginas que não pertencem a nenhuma questão', 'limpar_paginas_visuais_orfas.mjs', []],
]

for (const [rotulo, arquivo, argumentos] of passos) {
  console.log(`\n${rotulo}…`)
  const resultado = spawnSync(process.execPath, [fileURLToPath(new URL(`./${arquivo}`, import.meta.url)), ...argumentos], {stdio: 'inherit', windowsHide: true})
  if (resultado.error) throw resultado.error
  if (resultado.status !== 0) process.exit(resultado.status ?? 1)
}
