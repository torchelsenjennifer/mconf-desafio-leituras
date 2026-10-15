class ApplicationController < ActionController::Base
  # Disponibiliza o método authorize e as policies do Pundit nos controllers.
  include Pundit::Authorization

  # Alterações no importmap invalidam o ETag das respostas HTML.
  stale_when_importmap_changes

  # O Devise bloqueia parâmetros extras por padrão. Este callback permite que
  # o campo name seja recebido no cadastro e na edição da conta.
  before_action :configurar_parametros_permitidos, if: :devise_controller?

  # Centraliza o tratamento de tentativas de editar ou remover livros alheios.
  rescue_from Pundit::NotAuthorizedError, with: :usuario_nao_autorizado

  private

  def configurar_parametros_permitidos
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :name ])
    devise_parameter_sanitizer.permit(:account_update, keys: [ :name ])
  end

  def usuario_nao_autorizado
    redirect_to books_path, alert: "Você não tem permissão para executar esta ação."
  end
end
