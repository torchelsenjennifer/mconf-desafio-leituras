require "rails_helper"

RSpec.describe "Books" do
  let!(:owner) { User.create!(name: "Owner", email: "owner@example.com", password: "password123") }
  let!(:other_user) { User.create!(name: "Other", email: "other@example.com", password: "password123") }
  let!(:book) { Book.create!(user: owner, title: "Kindred", author: "Octavia Butler", genre: "Fiction", published_year: 1979, open_library_key: "/works/OL1W") }

  it "shows the public catalogue and applies filters" do
    Book.create!(user: owner, title: "Dune", author: "Frank Herbert", genre: "Science fiction", published_year: 1965, open_library_key: "/works/OL2W")

    get books_path, params: { author: "Butler", genre: "Fiction", year: 1979 }, headers: { "X-Inertia" => "true" }

    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Kindred")
    expect(response.body).not_to include("Dune")
  end

  it "provides the public catalogue as JSON" do
    get books_path(format: :json), params: { author: "Butler" }

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("application/json")
    expect(response.parsed_body.fetch("books").first).to include("title" => "Kindred", "author" => "Octavia Butler")
    expect(response.parsed_body.fetch("pagination")).to include("page" => 1)
  end

  it "requires authentication to add a book" do
    get new_book_path

    expect(response).to redirect_to(new_user_session_path)
  end

  it "adds a selected OpenLibrary book for the signed-in user" do
    sign_in owner

    expect {
      post books_path, params: { book: { title: "Dune", author: "Frank Herbert", genre: "Science fiction", published_year: 1965, open_library_key: "/works/OL893414W" } }
    }.to change(Book, :count).by(1)

    expect(response).to redirect_to(books_path)
    expect(owner.books.last.title).to eq("Dune")
  end

  it "allows only the author to update or remove a book" do
    sign_in other_user

    patch book_path(book), params: { book: { title: "Changed", author: book.author, genre: book.genre, published_year: book.published_year, open_library_key: book.open_library_key } }
    expect(response).to redirect_to(books_path)
    expect(book.reload.title).to eq("Kindred")

    delete book_path(book)
    expect(response).to redirect_to(books_path)
    expect(Book.exists?(book.id)).to be(true)
  end

  it "searches OpenLibrary only for a signed-in user" do
    sign_in owner
    stub_request(:get, "https://openlibrary.org/search.json")
      .with(query: hash_including("q" => "kindred", "limit" => "8"))
      .to_return(status: 200, body: { docs: [] }.to_json)

    get search_books_path, params: { q: "kindred" }, as: :json

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to eq([])
  end
end
