class PreventDuplicateBooksPerUser < ActiveRecord::Migration[8.1]
  def up
    # Mantém o primeiro livro cadastrado por cada pessoa e remove cópias posteriores.
    execute <<~SQL
      DELETE FROM books AS duplicate
      USING books AS original
      WHERE duplicate.user_id = original.user_id
        AND duplicate.open_library_key = original.open_library_key
        AND (duplicate.created_at, duplicate.id) > (original.created_at, original.id)
    SQL

    add_index :books, [ :user_id, :open_library_key ], unique: true, name: "index_books_on_user_and_open_library_key"
  end

  def down
    remove_index :books, name: "index_books_on_user_and_open_library_key"
  end
end
