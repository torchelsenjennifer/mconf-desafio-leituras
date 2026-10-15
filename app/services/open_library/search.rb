module OpenLibrary
  class Search
    URL_BASE = "https://openlibrary.org/search.json".freeze
    LIMITE_DE_RESULTADOS = 8
    CAMPOS_SOLICITADOS = %w[
      key
      title
      author_name
      first_publish_year
      subject
      cover_i
    ].join(",").freeze

    def initialize(consulta)
      @consulta = consulta.to_s.strip
    end

    def call
      return [] if @consulta.length < 2

      resposta = buscar_livros
      return [] unless resposta.success?

      interpretar_livros(resposta.body)
    rescue Faraday::Error, JSON::ParserError
      # Falhas da API externa não devem derrubar a aplicação. A interface trata
      # uma lista vazia mostrando uma mensagem para a pessoa tentar novamente.
      []
    end

    private

    def buscar_livros
      Faraday.get(
        URL_BASE,
        q: @consulta,
        fields: CAMPOS_SOLICITADOS,
        limit: LIMITE_DE_RESULTADOS
      )
    end

    def interpretar_livros(corpo_da_resposta)
      documentos = JSON.parse(corpo_da_resposta).fetch("docs", [])
      documentos.filter_map { |documento| serializar_livro(documento) }
    end

    def serializar_livro(documento)
      ano_de_publicacao = documento["first_publish_year"]
      return if ano_de_publicacao.blank?

      {
        key: documento["key"],
        title: documento["title"],
        author: primeiro_valor(documento, "author_name") || "Autor desconhecido",
        published_year: ano_de_publicacao,
        genre: primeiro_valor(documento, "subject"),
        cover_url: url_da_capa(documento["cover_i"])
      }
    end

    def primeiro_valor(documento, campo)
      Array(documento[campo]).first
    end

    def url_da_capa(identificador_da_capa)
      return unless identificador_da_capa

      "https://covers.openlibrary.org/b/id/#{identificador_da_capa}-M.jpg"
    end
  end
end
