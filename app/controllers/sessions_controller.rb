class SessionsController < Devise::SessionsController
  protected

  # O cabeçalho já mostra o nome da pessoa autenticada; não é necessário toast.
  def set_flash_message!(key, kind, options = {})
    return if key == :notice && %i[signed_in signed_out].include?(kind)

    super
  end
end
