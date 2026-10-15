require "rails_helper"

RSpec.describe "Livros" do
  let!(:proprietario) do
    User.create!(name: "Proprietário", email: "owner@example.com", password: "password123")
  end

  let!(:outro_usuario) do
    User.create!(name: "Outro usuário", email: "other@example.com", password: "password123")
  end

  let!(:livro) do
    Book.create!(
      user: proprietario,
      title: "Kindred",
      author: "Octavia Butler",
      genre: "Fiction",
      published_year: 1979,
      open_library_key: "/works/OL1W"
    )
  end

  it "exibe o catálogo público e aplica os filtros" do
    Book.create!(
      user: proprietario,
      title: "Dune",
      author: "Frank Herbert",
      genre: "Science fiction",
      published_year: 1965,
      open_library_key: "/works/OL2W"
    )

    get books_path,
        params: { author: "Butler", genre: "Fiction", year: 1979 },
        headers: { "X-Inertia" => "true" }

    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Kindred")
    expect(response.body).not_to include("Dune")
  end

  it "disponibiliza o catálogo público em JSON" do
    get books_path(format: :json), params: { author: "Butler" }

    primeiro_livro = response.parsed_body.fetch("books").first
    paginacao = response.parsed_body.fetch("pagination")

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("application/json")
    expect(primeiro_livro).to include(
      "title" => "Kindred",
      "author" => "Octavia Butler"
    )
    expect(paginacao).to include("page" => 1)
  end

  it "exige autenticação para adicionar um livro" do
    get new_book_path

    expect(response).to redirect_to(new_user_session_path)
  end

  it "adiciona o livro selecionado para o usuário autenticado" do
    sign_in proprietario

    dados_do_livro = {
      title: "Dune",
      author: "Frank Herbert",
      genre: "Science fiction",
      published_year: 1965,
      open_library_key: "/works/OL893414W"
    }

    expect {
      post books_path, params: { book: dados_do_livro }
    }.to change(Book, :count).by(1)

    expect(response).to redirect_to(books_path)
    expect(proprietario.books.last.title).to eq("Dune")
  end

  it "permite que somente o proprietário atualize ou remova o livro" do
    sign_in outro_usuario

    patch book_path(livro), params: {
      book: {
        title: "Changed",
        author: livro.author,
        genre: livro.genre,
        published_year: livro.published_year,
        open_library_key: livro.open_library_key
      }
    }

    expect(response).to redirect_to(books_path)
    expect(livro.reload.title).to eq("Kindred")

    delete book_path(livro)

    expect(response).to redirect_to(books_path)
    expect(Book.exists?(livro.id)).to be(true)
  end

  it "permite pesquisar na OpenLibrary somente quando há usuário autenticado" do
    sign_in proprietario
    stub_request(:get, "https://openlibrary.org/search.json")
      .with(query: hash_including("q" => "kindred", "limit" => "8"))
      .to_return(status: 200, body: { docs: [] }.to_json)

    get search_books_path, params: { q: "kindred" }, as: :json

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to eq([])
  end
end
