describe('Login using created data from registration', () => {
    it('Log in Success', () => {

      
      const v1 = { fixture: 'login_stubs/v1'}
      const ping = { fixture: 'login_stubs/ping'}
      const auth = { fixture: 'login_stubs/autho'}
      const accounts = { fixture: 'login_stubs/accounts'}
      const balances = { fixture: 'login_stubs/balances'}
      const brokerages = { fixture: 'login_stubs/brokerages'}
      const currencies = { fixture: 'login_stubs/currencies'}
      const features = { fixture: 'login_stubs/features'}
      const goals = { fixture: 'login_stubs/goals'}
      const help = { fixture: 'login_stubs/help'}
      const incentives = { fixture: 'login_stubs/incentives'}
      const info = { fixture: 'login_stubs/info'}
      const performance = { fixture: 'login_stubs/performance'}
      const plans = { fixture: 'login_stubs/plans'}
      const portfolioGroups = { fixture: 'login_stubs/portfolioGroups'}
      const positions = { fixture: 'login_stubs/positions'}
      const settings = { fixture: 'login_stubs/settings'}
      const subscriptions = { fixture: 'login_stubs/subscriptions'}

      cy.intercept('/api/v1/ping', (req) => { req.reply({interceptor: ping}) })
      .as('ping')

      cy.intercept('/api/v1/incentives/', (req) => { req.reply({interceptor: incentives}) })
      .as('incentives')

      cy.intercept('/api/v1/features/', (req) => { req.reply({interceptor: features}) })
      .as('features')

      cy.intercept('/api/v1/currencies/rates/', (req) => { req.reply({interceptor: currencies}) })
      .as('currencies')

      cy.intercept('/api/v1/subscriptions/', (req) => { req.reply({interceptor: subscriptions}) })
      .as('subs')

      cy.intercept('/api/v1/accounts/', (req) => { req.reply({interceptor: accounts}) })
      .as('accounts')

      cy.intercept('/api/v1/portfolioGroups/', (req) => { req.reply({interceptor: portfolioGroups}) })
      .as('portfolioGroups')

      cy.intercept('/api/v1/settings/', (req) => { req.reply({interceptor: settings}) })
      .as('settings')

      cy.intercept('/api/v1/plans/', (req) => { req.reply({interceptor: plans}) })
      .as('plans')

      cy.intercept('/api/v1/goals/', (req) => { req.reply({interceptor: goals}) })
      .as('goals')

      cy.intercept('/api/v1/help/', (req) => { req.reply({interceptor: help}) })
      .as('help')

      cy.intercept('/api/v1/brokerages/', (req) => { req.reply({interceptor: brokerages}) })
      .as('brokerages')

      cy.intercept('/api/v1/authorizations', (req) => { req.reply({interceptor: auth}) })
      .as('auth')

      cy.intercept('/api/v1/performance/all/**', (req) => { req.reply({interceptor: performance}) })
      .as('performance')

      cy.intercept('/api/v1/accounts/**/balances/', (req) => { req.reply({interceptor: balances}) })
      .as('balances')

      cy.intercept('/api/v1/accounts/**/positions/', (req) => { req.reply({interceptor: positions}) })
      .as('positions')
      
      cy.intercept('/api/v1/portfolioGroups/**/info/', (req) => { req.reply({interceptor: info}) })
      .as('info')
      
      cy.intercept('v1', (req) => { req.reply({interceptor: v1}) })
      .as('v1')


      cy.fixture('testDomain').as('login')
      cy.get('@login').then(domain => {
      cy.visit((domain.test).concat('/login')) })
      cy.location('pathname').should('equal', '/app/login')

    // enter valid username and password
    cy.fixture('credentials').as('userFixture')
    cy.get('@userFixture').then(user => {
    cy.get('[name=email]').first().type(user.username)
    cy.get('[placeholder=Password]').type(user.password)
    .get('form').submit()

    cy.intercept('POST','/api/v1/auth/login', (req) => { req.reply({interceptor: v1}) })
    .as('v1')

    
 
      })

    })
  })


