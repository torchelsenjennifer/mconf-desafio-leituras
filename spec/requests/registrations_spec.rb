require "rails_helper"

RSpec.describe "Cadastro de usuários", type: :request do
  it "cria uma conta usando apenas nome, e-mail e senha" do
    expect {
      post user_registration_path, params: {
        user: {
          name: "Nova leitora",
          email: "nova-leitora@example.com",
          password: "senha-segura-123"
        }
      }
    }.to change(User, :count).by(1)

    expect(response).to redirect_to(root_path)
    expect(User.last.name).to eq("Nova leitora")
    expect(session["warden.user.user.key"]).to be_nil
  end
end
