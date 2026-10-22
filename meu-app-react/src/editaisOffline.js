// Fila pessoal durável. A comparação de versão impede sobrescrever outro aparelho.
export function criarEditaisOffline({client,userId,storage,online=()=>navigator.onLine}) {
  const chave=`ap-aprovado:editais:${userId}:v1`
  function ler() {
    const s=JSON.parse(storage.getItem(chave)||'null')
    if(s && (s.userId!==userId || !Array.isArray(s.rows) || !Array.isArray(s.pendentes))) throw Error('Cópia local de editais inválida.')
    return s || {userId,rows:[],pendentes:[]}
  }
  const guardar=s=>storage.setItem(chave,JSON.stringify(s))
  let emCurso=null
  async function enviar() {
    let estado=ler()
    for(const op of [...estado.pendentes]) {
      const q=op.novo ? client.from('editais_usuario').insert({...op.payload,user_id:userId,id:op.id})
        : client.from('editais_usuario').update(op.payload).eq('user_id',userId).eq('id',op.id).eq('updated_at',op.baseVersion)
      const {data,error}=await q.select().abortSignal(AbortSignal.timeout(20000)).maybeSingle()
      if(error || !data) throw Error('Há alterações de edital pendentes. Se outra sessão alterou o mesmo edital, baixe sua cópia e confira antes de substituir qualquer conteúdo.')
      estado=ler()
      const atual=estado.pendentes.find(p=>p.id===op.id)
      if(atual?.operacao===op.operacao) {
        estado.pendentes=estado.pendentes.filter(p=>p.id!==op.id)
        estado.rows=estado.rows.map(e=>e.id===op.id?data:e)
      } else if(atual) {atual.novo=false;atual.baseVersion=data.updated_at}
      guardar(estado)
    }
  }
  async function sincronizar() {
    if(!online())return
    if(emCurso)return emCurso
    emCurso=enviar().finally(()=>{emCurso=null})
    return emCurso
  }
  return {
    async listar() {
      let aviso=''
      if(online()) {
        try {
          await sincronizar()
          const {data,error}=await client.from('editais_usuario').select('*').eq('user_id',userId).order('created_at',{ascending:true}).abortSignal(AbortSignal.timeout(20000))
          if(error)throw error
          const s=ler(), ids=new Set(s.pendentes.map(p=>p.id))
          s.rows=[...(data||[]).filter(r=>!ids.has(r.id)),...s.rows.filter(r=>ids.has(r.id))];guardar(s)
        }catch(e){aviso=e.message || 'Não foi possível sincronizar os editais.'}
      }
      const s=ler()
      return {rows:s.rows,aviso:aviso || (s.pendentes.length?'Editais salvos neste aparelho. Aguardando sincronização.':!online()?'Editais disponíveis neste aparelho, sem conexão.':'')}
    },
    async gravar(edital,novo) {
      const s=ler(), anterior=s.pendentes.find(p=>p.id===edital.id)
      const payload={titulo:edital.titulo.trim(),edicao:edital.edicao.trim(),unidade:edital.unidade.trim(),data_prova:edital.data_prova||null,materias:edital.materias,updated_at:new Date().toISOString()}
      const row={...edital,...payload,user_id:userId,created_at:edital.created_at||payload.updated_at}
      const op={id:edital.id,novo:anterior?.novo??novo,baseVersion:anterior?.baseVersion??edital.updated_at,payload,operacao:crypto.randomUUID()}
      s.rows=[...s.rows.filter(e=>e.id!==row.id),row];s.pendentes=[...s.pendentes.filter(p=>p.id!==row.id),op];guardar(s)
      let aviso='Salvo neste aparelho. Será sincronizado com sua conta quando houver conexão.'
      try {await sincronizar();if(!ler().pendentes.length)aviso='Alterações salvas na sua conta.'}catch(e){aviso=e.message}
      return {row:ler().rows.find(e=>e.id===row.id),aviso}
    },
  }
}
