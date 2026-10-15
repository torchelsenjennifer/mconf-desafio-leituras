class SessionsController < Devise::SessionsController
  protected

  # O cabeçalho já mostra o nome da pessoa autenticada; não é necessário toast.
  def set_flash_message!(chave, tipo, opcoes = {})
    return if chave == :notice && %i[signed_in signed_out].include?(tipo)

    super
  end
end
