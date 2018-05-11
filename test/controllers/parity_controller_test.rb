require 'test_helper'

class ParityControllerTest < ActionDispatch::IntegrationTest
  test "should get kovan" do
    get parity_kovan_url
    assert_response :success
  end

  test "should get mainnet" do
    get parity_mainnet_url
    assert_response :success
  end

end
