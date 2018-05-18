var defaultSecret = 'JOSE'
exports.defaultSecret = defaultSecret

const redirectWhitelist = [
  'https://github.com/bkimminich/juice-shop',
  'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
  'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
  'https://gratipay.com/juice-shop',
  'http://shop.spreadshirt.com/juiceshop',
  'http://shop.spreadshirt.de/juiceshop',
  'https://www.stickeryou.com/products/owasp-juice-shop/794'
]
exports.redirectWhitelist = redirectWhitelist

exports.isRedirectAllowed = url => {
  let allowed = false
  redirectWhitelist.forEach(allowedUrl => {
    allowed = allowed || url.indexOf(allowedUrl) > -1
  })
  return allowed
}
