# Este arquivo deve garantir a existência dos registros necessários em qualquer
# ambiente. O código precisa ser idempotente, ou seja, pode ser executado várias
# vezes sem criar dados duplicados.
#
# Execute com bin/rails db:seed ou junto da preparação do banco com db:setup.
#
# Exemplo:
#
#   ["Ação", "Comédia", "Drama", "Terror"].each do |nome_do_genero|
#     GeneroDeFilme.find_or_create_by!(name: nome_do_genero)
#   end
