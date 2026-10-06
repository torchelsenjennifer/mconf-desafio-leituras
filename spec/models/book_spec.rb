require "rails_helper"

RSpec.describe Book do
  subject(:book) do
    described_class.new(
      user: User.new(name: "Ana", email: "ana@example.com", password: "password123"),
      title: "Kindred", author: "Octavia Butler", published_year: 1979, open_library_key: "/works/OL1W"
    )
  end

  it "is valid with the required catalogue data" do
    expect(book).to be_valid
  end

  it "requires OpenLibrary data" do
    book.open_library_key = nil

    expect(book).to be_invalid
    expect(book.errors[:open_library_key]).to include("can't be blank")
  end

  it "rejects a future publication year" do
    book.published_year = Date.current.year + 2

    expect(book).to be_invalid
  end

  it "allows a person to add an OpenLibrary book only once" do
    user = book.user
    user.save!
    described_class.create!(user:, title: book.title, author: book.author, published_year: book.published_year, open_library_key: book.open_library_key)
    book.user = user

    expect(book).to be_invalid
    expect(book.errors[:open_library_key]).to include("já foi adicionado por você")
  end

  it "filters and orders newest additions first" do
    user = book.user
    user.save!
    older = described_class.create!(user:, title: "Older", author: "Ursula Le Guin", genre: "Fantasy", published_year: 1969, open_library_key: "/works/OL2W", created_at: 2.days.ago)
    newer = described_class.create!(user:, title: "Newer", author: "Octavia Butler", genre: "Fiction", published_year: 1979, open_library_key: "/works/OL3W", created_at: 1.day.ago)

    expect(described_class.recent_first.by_author("butler").by_genre("fiction").published_in("1979")).to eq([ newer ])
    expect(described_class.recent_first).to start_with(newer, older)
  end
end
