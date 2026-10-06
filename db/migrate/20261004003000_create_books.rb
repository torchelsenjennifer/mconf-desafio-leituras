class CreateBooks < ActiveRecord::Migration[8.1]
  def change
    create_table :books do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.string :author, null: false
      t.string :genre
      t.integer :published_year, null: false
      t.string :open_library_key, null: false
      t.string :cover_url

      t.timestamps
    end

    add_index :books, :open_library_key
    add_index :books, :published_year
    add_index :books, :author
  end
end
