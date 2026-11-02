import fs from 'node:fs/promises'
import { lotesAtuais } from './acervo-atual.mjs'
const documento = process.argv[2]
if (!documento) throw new Error('Informe o documento_id')
const registros = []
for await (const { questoes } of lotesAtuais()) for (const q of questoes) {
  if (q.documento_id !== documento) continue
  registros.push({
    id: q.id, numero: q.numero_original, pagina: q.pagina, ano: q.ano,
    materia: q.materia, conteudo: q.conteudo, concurso: q.concurso,
    enunciado: q.enunciado, apoio: q.texto_apoio, opcoes: q.opcoes,
    resposta: q.resposta_correta, anulada: q.anulada, imagem: q.pagina_imagem,
    imagens_paginas: q.imagens_paginas, contexto: q.contexto_paginas,
    banca: q.banca, tipo: q.tipo_resposta, gabarito: q.gabarito_oficial,
    classificacao_pendente: q.classificacao_pendente,
    classificacao_revisada: q.classificacao_revisada,
    integridade_profissional: q.integridade_profissional,
    duplicada_de: q.duplicada_de
  })
}
registros.sort((a, b) => (a.numero || 0) - (b.numero || 0) || a.id.localeCompare(b.id))
const dest = `tmp/registros-documento-${documento}.json`
await fs.writeFile(dest, JSON.stringify(registros, null, 2))
console.log(JSON.stringify({ documento, registros: registros.length, itens: new Set(registros.map(x => x.numero)).size, ids: registros.map(x => x.id), destino: dest }))
