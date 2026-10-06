require "rails_helper"

RSpec.describe "Registrations", type: :request do
  it "creates an account with name, email and password only" do
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
