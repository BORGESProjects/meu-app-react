import {useEffect, useRef, useState} from 'react'
import {abrirPdfEdital, imagemPagina, reconhecerPaginas} from '../lerPdfEdital'
import {extrairPrograma, faixaProgramatica} from '../editalPdf'
import {acrescentarConteudos, novoIdEdital} from '../editais'

export default function ImportarEditalPdf({materiasExistentes, onAdicionar, disabled}) {
  const [pdf,setPdf]=useState(null), [inicio,setInicio]=useState(1), [fim,setFim]=useState(1)
  const [pagina,setPagina]=useState(1), [imagem,setImagem]=useState(''), [vendo,setVendo]=useState(false)
  const [ocr,setOcr]=useState(true), [busy,setBusy]=useState(false), [mensagem,setMensagem]=useState('')
  const [forcarOcr,setForcarOcr]=useState(false)
  const [percentual,setPercentual]=useState(0), [erro,setErro]=useState(''), [resultado,setResultado]=useState(null)
  const [texto,setTexto]=useState(''), [editado,setEditado]=useState(false), [conferido,setConferido]=useState(false)
  const [textoAlterado,setTextoAlterado]=useState(false)
  const arquivo=useRef(null), controle=useRef(null), documento=useRef(null), mounted=useRef(true)
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;controle.current?.abort();void documento.current?.fechar()}},[])
  const rangeValido=pdf && Number.isInteger(Number(inicio)) && Number.isInteger(Number(fim)) && Number(inicio)>=1 && Number(fim)<=pdf.paginas.length && Number(inicio)<=Number(fim)
  const progresso=(msg,valor)=>{if(mounted.current){setMensagem(msg);setPercentual(Math.round(valor*100))}}
  function preparar(result) {
    setResultado({...result,grupos:result.grupos.map(g=>({...g,id:novoIdEdital(),selecionado:true,topicos:g.topicos.map(t=>({...t,id:novoIdEdital(),selecionado:true}))}))})
    setConferido(false)
  }
  async function abrir(event) {
    const file=event.target.files?.[0];if(!file)return
    controle.current?.abort();const controller=new AbortController();controle.current=controller
    void documento.current?.fechar();documento.current=null
    setPdf(null);setResultado(null);setImagem('');setErro('');setTexto('');setBusy(true);setMensagem('Verificando arquivo PDF…');setPercentual(0)
    try {
      const leitor=await abrirPdfEdital(file,controller.signal,progresso)
      if(controller.signal.aborted || !mounted.current){void leitor.fechar();return}
      documento.current=leitor;setPdf(leitor)
      const faixa=faixaProgramatica(leitor.paginas)
      setInicio(faixa.inicio);setFim(faixa.fim);setPagina(faixa.inicio)
      setMensagem(faixa.detectada ? 'Localizei uma seção de conteúdo programático. Confira as páginas e extraia os conteúdos.' : 'Não localizei uma seção com segurança. Escolha as páginas do programa antes de extrair; em PDFs digitalizados, ative o OCR.')
    }catch(e){if(mounted.current){setMensagem('');setErro(controller.signal.aborted ? 'Leitura cancelada. Nenhum conteúdo foi salvo.' : e.message || 'Não foi possível abrir este PDF.')}}
    finally{if(mounted.current){setBusy(false);setPercentual(0)}}
  }
  async function extrair() {
    if(!rangeValido)return
    const controller=new AbortController();controle.current=controller;setBusy(true);setErro('');setResultado(null);setImagem('')
    try {
      const paginas=await reconhecerPaginas(pdf,Number(inicio),Number(fim),ocr,controller.signal,progresso,ocr && forcarOcr)
      if(controller.signal.aborted || !mounted.current)return
      const result=extrairPrograma(paginas)
      if(paginas.some(p=>p.precisaOcr && !p.ocr))result.avisos.push('Há páginas com pouco texto ou caracteres ilegíveis sem OCR. Podem faltar conteúdos; ative o OCR ou confira o original.')
      setTexto(paginas.map(p=>`\n[Página ${p.numero}]\n`+p.linhas.map(l=>l.texto).join('\n')).join('\n'))
      setEditado(false);setTextoAlterado(false);preparar(result);setMensagem('Extração concluída. Confira as matérias e os tópicos antes de acrescentar ao edital.')
    }catch(e){if(mounted.current){setMensagem('');setErro(controller.signal.aborted ? 'Extração cancelada. Nenhum conteúdo foi salvo.' : e.message || 'Não foi possível concluir a leitura. Tente um intervalo menor de páginas.')}}
    finally{if(mounted.current){setBusy(false);setPercentual(0)}}
  }
  function reprocessar() {
    const linhas=texto.split(/\r?\n/).filter(t=>!/^\[Página \d+\]$/.test(t.trim())).map(texto=>({texto,y:10,altura:100,fonte:12}))
    preparar(extrairPrograma([{numero:Number(inicio),linhas,ocr:false}],{manual:true}))
    setEditado(true);setTextoAlterado(false);setErro('');setMensagem('Prévia atualizada a partir do texto ajustado. As referências indicam o intervalo selecionado.')
  }
  function atualizarGrupo(id,alteracoes){setResultado(r=>({...r,grupos:r.grupos.map(g=>g.id===id ? {...g,...alteracoes} : g)}));setConferido(false)}
  function atualizarTopico(grupoId,id,alteracoes){setResultado(r=>({...r,grupos:r.grupos.map(g=>g.id===grupoId ? {...g,topicos:g.topicos.map(t=>t.id===id ? {...t,...alteracoes} : t)} : g)}));setConferido(false)}
  const grupos=(resultado?.grupos || []).filter(g=>g.selecionado).map(g=>({nome:g.nome.trim(),topicos:g.topicos.filter(t=>t.selecionado).map(t=>({titulo:t.titulo.trim(),fonte_pdf:{arquivo:pdf.nome,sha256:pdf.hash,pagina:editado ? Number(inicio) : t.pagina,pagina_fim:editado ? Number(fim) : t.pagina_fim,ocr:t.ocr,texto_ajustado:editado || Boolean(t.ajustado)}}))})).filter(g=>g.topicos.length)
  const invalidos=grupos.some(g=>!g.nome || g.nome.startsWith('Matéria a conferir') || g.nome.length>100 || g.topicos.some(t=>!t.titulo || t.titulo.length>1500 || /�|\(cid:\d+\)/u.test(t.titulo)))
  const previa=acrescentarConteudos(materiasExistentes,grupos,()=> '')
  async function mostrarPagina(){
    setVendo(true);setErro('')
    try{const canvas=await imagemPagina(pdf.doc,Math.min(pdf.paginas.length,Math.max(1,Number(pagina)||1)));const url=canvas.toDataURL('image/jpeg',.85);canvas.width=canvas.height=0;if(mounted.current)setImagem(url)}
    catch{if(mounted.current)setErro('Não foi possível visualizar a página. Confira o arquivo original.')}
    finally{if(mounted.current)setVendo(false)}
  }
  return <div className="edital-form">
      <p>Escolha o PDF, confira o trecho do conteúdo programático e acrescente as matérias automaticamente. O arquivo é lido no seu dispositivo; somente os conteúdos confirmados são salvos na sua conta.</p>
      <label>PDF do edital (até 20 MB)<input ref={arquivo} type="file" accept="application/pdf,.pdf" disabled={busy || disabled} onClick={e=>{e.currentTarget.value=''}} onChange={abrir}/></label>
      {mensagem && <p role="status">{mensagem}</p>}
      {busy && <div className="edital-acoes"><progress max="100" value={percentual} aria-label="Leitura do PDF"/><button type="button" onClick={()=>controle.current?.abort()}>Cancelar leitura</button></div>}
      {erro && <p role="alert" className="edital-erro">{erro}</p>}
      {pdf && <>
        <p><strong>{pdf.nome}</strong> · {pdf.paginas.length} páginas. Se houver vários cargos, áreas ou anexos, selecione apenas as páginas que você pretende estudar.</p>
        <div className="edital-campos"><label>Primeira página<input type="number" min="1" max={pdf.paginas.length} value={inicio} disabled={busy || disabled} onChange={e=>{setInicio(e.target.value);setResultado(null);setImagem('')}}/></label><label>Última página<input type="number" min={inicio} max={pdf.paginas.length} value={fim} disabled={busy || disabled} onChange={e=>{setFim(e.target.value);setResultado(null);setImagem('')}}/></label></div>
        <label className="edital-check"><input type="checkbox" checked={ocr} disabled={busy || disabled} onChange={e=>setOcr(e.target.checked)}/><span>Reconhecer páginas digitalizadas com OCR em português. A primeira leitura pode demorar mais; confira os trechos reconhecidos.</span></label>
        <label className="edital-check"><input type="checkbox" checked={forcarOcr} disabled={!ocr || busy || disabled} onChange={e=>setForcarOcr(e.target.checked)}/><span>Forçar OCR em todas as páginas selecionadas, se o texto sair embaralhado.</span></label>
        <div className="edital-acoes"><button type="button" className="edital-primario" disabled={!rangeValido || busy || disabled || vendo} onClick={extrair}>Extrair matérias e conteúdos</button></div>
        <details><summary>Conferir uma página do PDF original</summary><div className="edital-acoes"><label>Página<input type="number" min="1" max={pdf.paginas.length} value={pagina} onChange={e=>setPagina(e.target.value)} disabled={busy || vendo}/></label><button type="button" disabled={busy || vendo} onClick={mostrarPagina}>{vendo ? 'Renderizando…' : 'Ver página original'}</button></div>{imagem && <img className="edital-pdf-pagina" src={imagem} alt={`Página ${pagina} do PDF original`} />}</details>
      </>}
      {resultado && <>
        <h3>Prévia da verticalização</h3>
        <p>As matérias estão selecionadas por padrão. Abra um grupo para conferir, editar ou desmarcar conteúdos. Nada foi acrescentado ainda.</p>
        {!!resultado.avisos.length && <div className="edital-pdf-avisos"><strong>Pontos para conferir</strong><ul>{resultado.avisos.map((a,i)=><li key={i}>{a}</li>)}</ul></div>}
        {resultado.grupos.map(g=><details key={g.id} className="edital-pdf-grupo">
          <summary>{g.nome} · {g.topicos.length} conteúdos</summary>
          <label className="edital-check"><input type="checkbox" disabled={busy || disabled} checked={g.selecionado} onChange={e=>atualizarGrupo(g.id,{selecionado:e.target.checked})}/><span>Incluir esta matéria</span></label>
          <label>Nome da matéria<input maxLength={100} disabled={!g.selecionado || disabled} value={g.nome} onChange={e=>atualizarGrupo(g.id,{nome:e.target.value})}/></label>
          {g.selecionado && g.topicos.map(t=><div className="edital-pdf-topico" key={t.id}>
            <label className="edital-check"><input type="checkbox" disabled={disabled} checked={t.selecionado} onChange={e=>atualizarTopico(g.id,t.id,{selecionado:e.target.checked})}/><span>Página {editado ? `${inicio}–${fim}` : t.pagina===t.pagina_fim ? t.pagina : `${t.pagina}–${t.pagina_fim}`}{t.ocr ? ' · OCR' : ''}</span></label>
            <label>Conteúdo extraído<textarea rows={2} maxLength={3000} disabled={!t.selecionado || disabled} value={t.titulo} onChange={e=>atualizarTopico(g.id,t.id,{titulo:e.target.value,ajustado:true})}/></label>
            {!!t.alertas.length && <p>{t.alertas.join(' · ')}</p>}
          </div>)}
        </details>)}
        <details><summary>Conferir ou ajustar todo o texto extraído</summary><p>Use nomes de matérias em linhas próprias, seguidos de dois-pontos, para corrigir um agrupamento. O ajuste não altera o PDF original.</p><label>Texto do trecho selecionado<textarea rows={12} value={texto} maxLength={500000} disabled={disabled} onChange={e=>{setTexto(e.target.value);setTextoAlterado(true);setConferido(false)}}/></label><button type="button" disabled={busy || disabled || !texto.trim()} onClick={reprocessar}>Reprocessar texto ajustado</button></details>
        {textoAlterado && <p className="edital-erro">Clique em “Reprocessar texto ajustado” para atualizar a prévia antes de acrescentar.</p>}
        <p><strong>{previa.adicionados}</strong> conteúdos novos · {previa.repetidos} repetidos serão ignorados. Os tópicos existentes e suas marcações serão mantidos.</p>
        {invalidos && <p className="edital-erro">Corrija os nomes vazios, títulos longos ou caracteres ilegíveis, ou desmarque esses tópicos antes de acrescentar.</p>}
        <label className="edital-check"><input type="checkbox" checked={conferido} disabled={disabled} onChange={e=>setConferido(e.target.checked)}/><span>Conferi as páginas, as matérias e os alertas da prévia.</span></label>
        <button type="button" className="edital-primario" disabled={busy || disabled || textoAlterado || !conferido || invalidos || !previa.adicionados} onClick={async()=>{if(await onAdicionar(grupos)){setResultado(null);setMensagem('Conteúdos acrescentados ao seu edital. Você pode selecionar outro trecho ou outro PDF.')}}}>Acrescentar ao meu edital</button>
      </>}
  </div>
}
