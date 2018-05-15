class Geth::V1::BaseController < ActionController::API
  include ReverseProxy::Controller

  def development
    reverse_proxy "http://localhost:8545", verify_ssl: false
  end

  def ropsten
    reverse_proxy "http://localhost:8547", verify_ssl: false
  end
end
