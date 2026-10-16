export function mensagemErroCadastro(error) {
  const mensagem = String(error?.message || '')
  if (error?.code === 'over_email_send_rate_limit' || /email rate limit exceeded/i.test(mensagem)) {
    return 'Não foi possível enviar o e-mail de confirmação: o serviço atingiu o limite de envios. Aguarde antes de tentar novamente. Se o problema continuar, avise o administrador do site.'
  }
  if (error?.code === 'email_address_not_authorized' || /email address not authorized/i.test(mensagem)) {
    return 'O envio de confirmação para novos usuários ainda não está configurado. Avise o administrador do site.'
  }
  return mensagem || 'Não foi possível criar sua conta. Tente novamente mais tarde.'
}
