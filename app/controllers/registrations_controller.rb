class RegistrationsController < Devise::RegistrationsController
  protected

  # O cadastro é independente da autenticação: a pessoa escolhe quando entrar.
  # Sobrescrever este método sem chamar super impede o login automático que o
  # Devise normalmente realiza logo depois da criação da conta.
  def sign_up(_nome_do_recurso, _recurso)
    # Intencionalmente vazio.
  end

  def after_sign_up_path_for(_recurso)
    root_path
  end

  def set_flash_message!(chave, tipo, opcoes = {})
    return if chave == :notice && tipo == :signed_up

    super
  end
end
