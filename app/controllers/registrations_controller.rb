class RegistrationsController < Devise::RegistrationsController
  protected

  # O cadastro é independente da autenticação: a pessoa escolhe quando entrar.
  def sign_up(_resource_name, _resource); end

  def after_sign_up_path_for(_resource)
    root_path
  end

  def set_flash_message!(key, kind, options = {})
    return if key == :notice && kind == :signed_up

    super
  end
end
