require "rails_helper"

RSpec.describe OpenLibrary::Search do
  it "maps OpenLibrary results without making a real HTTP request" do
    stub_request(:get, "https://openlibrary.org/search.json")
      .with(query: hash_including("q" => "kindred", "limit" => "8"))
      .to_return(status: 200, body: { docs: [ { key: "/works/OL1W", title: "Kindred", author_name: [ "Octavia Butler" ], first_publish_year: 1979, subject: [ "Science fiction" ], cover_i: 123 } ] }.to_json)

    results = described_class.new("kindred").call

    expect(results).to eq([ { key: "/works/OL1W", title: "Kindred", author: "Octavia Butler", published_year: 1979, genre: "Science fiction", cover_url: "https://covers.openlibrary.org/b/id/123-M.jpg" } ])
  end

  it "does not call the API for a one-character query" do
    expect(described_class.new("a").call).to eq([])
  end
end
