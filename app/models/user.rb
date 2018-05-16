class User < ApplicationRecord
  before_validation :ensure_token
  has_secure_password

  def ensure_token
    self.token = generate_hex(:token) unless token.present?
  end

  def generate_hex(column)
    loop do
      hex = SecureRandom.hex
      break hex unless self.class.where(column => hex).any?
    end
  end
end
