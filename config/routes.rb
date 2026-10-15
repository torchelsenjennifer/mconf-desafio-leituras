Rails.application.routes.draw do
  # O Devise fornece as rotas de cadastro, login, logout e recuperação de senha.
  devise_for :users, controllers: { registrations: "registrations", sessions: "sessions" }

  # O catálogo de livros também é a página inicial da aplicação.
  root "books#index"

  get "up" => "rails/health#show", as: :rails_health_check

  # Não existe uma página de detalhes (show). A rota search consulta a
  # OpenLibrary e pertence à coleção, pois não opera sobre um livro já salvo.
  resources :books, except: :show do
    collection do
      get :search
    end
  end
end
