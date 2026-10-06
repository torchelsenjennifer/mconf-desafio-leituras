module OpenLibrary
  class Search
    BASE_URL = "https://openlibrary.org/search.json".freeze

    def initialize(query)
      @query = query.to_s.strip
    end

    def call
      return [] if @query.length < 2

      response = Faraday.get(BASE_URL, q: @query, fields: "key,title,author_name,first_publish_year,subject,cover_i", limit: 8)
      return [] unless response.success?

      JSON.parse(response.body).fetch("docs", []).filter_map do |book|
        year = book["first_publish_year"]
        next if year.blank?

        { key: book["key"], title: book["title"], author: Array(book["author_name"]).first || "Autor desconhecido",
          published_year: year, genre: Array(book["subject"]).first,
          cover_url: book["cover_i"] && "https://covers.openlibrary.org/b/id/#{book["cover_i"]}-M.jpg" }
      end
    rescue Faraday::Error, JSON::ParserError
      []
    end
  end
end
