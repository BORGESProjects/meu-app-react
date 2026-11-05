import {recursoLocal} from '../plataforma'
import { formatarTextoAlternativa, imagemDaAlternativa, imagemDaOpcao } from '../textoQuestao'
import BlocosQuestao from './BlocosQuestao'

export default function AlternativaQuestao({ questao, indice, texto }) {
  const transcricaoComImagem = questao.opcoes_em_texto?.[indice] === true && questao.exibir_imagem_apos_transcricao === true
  const imagem = transcricaoComImagem ? imagemDaOpcao(questao, indice) : imagemDaAlternativa(questao, indice)
  if (transcricaoComImagem && imagem) return <div className="flex w-full flex-col gap-3">
    <span className="block whitespace-pre-line leading-relaxed">{formatarTextoAlternativa(texto)}</span>
    <img src={recursoLocal(imagem)} alt={`Representação gráfica da alternativa ${questao.rotulos_opcoes?.[indice] || String.fromCharCode(65 + indice)}`} loading="lazy" className={`max-w-full w-auto h-auto ${questao.banca === 'UEM' ? '' : 'max-h-80'} rounded-lg bg-white p-2`} />
  </div>
  return imagem
    ? <img src={recursoLocal(imagem)} alt={questao.opcoes_texto_corrompido?.[indice] ? `Alternativa ${questao.rotulos_opcoes?.[indice] || String.fromCharCode(65 + indice)}` : texto} loading="lazy" className={`max-w-full w-auto h-auto ${questao.banca === 'UEM' ? '' : 'max-h-80'} rounded-lg bg-white p-2`} />
    : questao.blocos_opcoes?.[indice] ? <BlocosQuestao inline blocos={questao.blocos_opcoes[indice]}/> : <span className="block w-full whitespace-pre-line leading-relaxed">{formatarTextoAlternativa(texto)}</span>
}
