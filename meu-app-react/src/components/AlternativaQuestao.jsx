export default function AlternativaQuestao({ questao, indice, texto }) {
  const imagem = questao.opcoes_imagens?.[indice]
  return imagem
    ? <img src={imagem} alt={questao.opcoes_texto_corrompido?.[indice] ? `Alternativa ${String.fromCharCode(65 + indice)}` : texto} loading="lazy" className="max-w-full w-auto h-auto max-h-80 rounded-lg bg-white p-2" />
    : <span className="whitespace-pre-wrap">{texto}</span>
}
