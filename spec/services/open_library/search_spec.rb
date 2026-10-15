require "rails_helper"

RSpec.describe OpenLibrary::Search do
  it "converte os resultados sem realizar uma requisição HTTP real" do
    resposta_da_open_library = {
      docs: [
        {
          key: "/works/OL1W",
          title: "Kindred",
          author_name: [ "Octavia Butler" ],
          first_publish_year: 1979,
          subject: [ "Science fiction" ],
          cover_i: 123
        }
      ]
    }

    stub_request(:get, "https://openlibrary.org/search.json")
      .with(query: hash_including("q" => "kindred", "limit" => "8"))
      .to_return(status: 200, body: resposta_da_open_library.to_json)

    resultados = described_class.new("kindred").call

    expect(resultados).to eq(
      [
        {
          key: "/works/OL1W",
          title: "Kindred",
          author: "Octavia Butler",
          published_year: 1979,
          genre: "Science fiction",
          cover_url: "https://covers.openlibrary.org/b/id/123-M.jpg"
        }
      ]
    )
  end

  it "não consulta a API quando a pesquisa possui apenas um caractere" do
    expect(described_class.new("a").call).to eq([])
  end
end
