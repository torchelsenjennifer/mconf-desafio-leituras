require "rails_helper"

RSpec.describe Book do
  subject(:livro) do
    described_class.new(
      user: User.new(name: "Ana", email: "ana@example.com", password: "password123"),
      title: "Kindred",
      author: "Octavia Butler",
      published_year: 1979,
      open_library_key: "/works/OL1W"
    )
  end

  it "é válido quando recebe os dados obrigatórios do catálogo" do
    expect(livro).to be_valid
  end

  it "exige o identificador da OpenLibrary" do
    livro.open_library_key = nil

    expect(livro).to be_invalid
    expect(livro.errors[:open_library_key]).to include("can't be blank")
  end

  it "rejeita um ano de publicação futuro" do
    livro.published_year = Date.current.year + 2

    expect(livro).to be_invalid
  end

  it "permite que cada pessoa adicione a mesma obra apenas uma vez" do
    usuario = livro.user
    usuario.save!
    described_class.create!(
      user: usuario,
      title: livro.title,
      author: livro.author,
      published_year: livro.published_year,
      open_library_key: livro.open_library_key
    )
    livro.user = usuario

    expect(livro).to be_invalid
    expect(livro.errors[:open_library_key]).to include("já foi adicionado por você")
  end

  it "filtra e ordena as adições mais recentes primeiro" do
    usuario = livro.user
    usuario.save!
    livro_antigo = described_class.create!(
      user: usuario,
      title: "Older",
      author: "Ursula Le Guin",
      genre: "Fantasy",
      published_year: 1969,
      open_library_key: "/works/OL2W",
      created_at: 2.days.ago
    )
    livro_recente = described_class.create!(
      user: usuario,
      title: "Newer",
      author: "Octavia Butler",
      genre: "Fiction",
      published_year: 1979,
      open_library_key: "/works/OL3W",
      created_at: 1.day.ago
    )

    livros_filtrados = described_class
      .mais_recentes_primeiro
      .por_autor("butler")
      .por_genero("fiction")
      .publicados_em("1979")

    expect(livros_filtrados).to eq([ livro_recente ])
    expect(described_class.mais_recentes_primeiro).to start_with(livro_recente, livro_antigo)
  end
end
