class ParityController < ApplicationController
  def kovan
    reverse_proxy "http://localhost:8548", verify_ssl: false
  end

  def mainnet
    reverse_proxy "http://localhost:8546", verify_ssl: false
  end
end
