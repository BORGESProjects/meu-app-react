import { anoDaQuestao } from '../acervo'

export default function EnunciadoQuestao({ questao: q }) {
  return <div className="mb-6 space-y-3">
    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
      <span>Ano: {anoDaQuestao(q)}</span>
      {q.numero_original && <span>Questão original {q.numero_original} · Modelo {q.modelo}</span>}
      {q.dificuldade_estimada && <span>Dificuldade estimada</span>}
    </div>
    {q.anulada && <p role="status" className="text-amber-300 font-semibold">Anulada no gabarito definitivo — disponível para consulta e excluída dos simulados.</p>}
    {q.apoio?.length > 0 && <section aria-label="Texto de apoio" className="space-y-3">
      <h3 className="text-sm font-semibold">Texto de apoio</h3>
      {q.apoio.map((apoio, i) => <a key={apoio.imagem} href={apoio.imagem} target="_blank" rel="noreferrer" className="block">
        <img src={apoio.imagem} alt={`Texto de apoio, parte ${i+1}: ${apoio.texto}`} loading="lazy" className="w-full h-auto rounded-lg bg-white" />
      </a>)}
    </section>}
    {q.imagem_original ? <>
      <a href={q.imagem_original} target="_blank" rel="noreferrer" className="block" aria-label={`Ampliar questão ${q.numero_original}`}>
        <img src={q.imagem_original} alt={q.enunciado} loading="lazy" className="w-full h-auto rounded-lg bg-white" />
      </a>
      <p className="text-xs text-slate-400">Clique na imagem para ampliar.{!q.anulada && ' Selecione sua resposta abaixo.'}</p>
      <details className="text-sm text-slate-300"><summary className="cursor-pointer">Ler texto extraído</summary>
        <p className="whitespace-pre-wrap mt-2">{q.enunciado}</p>
        <p className="text-xs mt-2">Consulte a imagem original para fórmulas, gráficos e trechos destacados.</p>
      </details>
    </> : <p className="text-slate-100 text-base font-medium leading-relaxed whitespace-pre-wrap">{q.enunciado}</p>}
  </div>
}
