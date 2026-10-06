Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: "registrations", sessions: "sessions" }
  root "books#index"
  get "up" => "rails/health#show", as: :rails_health_check
  resources :books, except: :show do
    collection { get :search }
  end
end
