class RepairLegacyUserColumns < ActiveRecord::Migration[8.1]
  def change
    unless column_exists?(:users, :name)
      add_column :users, :name, :string, default: "Membro", null: false
      change_column_default :users, :name, from: "Membro", to: nil
    end

    remove_column :users, :username if column_exists?(:users, :username)
    remove_column :users, :password_digest if column_exists?(:users, :password_digest)
  end
end
