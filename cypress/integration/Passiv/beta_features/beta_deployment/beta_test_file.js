describe('Test Brokerage Auth Connections', () => { 
  beforeEach(() => {

    cy.intercept('/api/v1/brokerages/**', (req) => {
      req.reply({fixture: 'login_stubs/brokerages.json'})
    }).as('connect')
  
  })
 

  it('Login test 2', () => {
    cy.fixture('betatestDomain').as('login')
    cy.get('@login').then(domain => {
    cy.visit((domain.test).concat('/login')) })
    cy.fixture('my_credentials').as('userFixture')
    cy.get('@userFixture').then(user => {
    cy.get('[name=email]').first().type(user.username)
    cy.get('[placeholder=Password]').type(user.password)

    })

// Verify the sign in button is enabled//
  cy.get('[data-cy=login-button]').should('not.be.disabled')
.click({multiple:true})

  cy.get('nav').find('button').contains('Logout').click().wait(5000)
  
})

  it('Add Alpaca', () => {

    cy.intercept('/api/v1/brokerages/**', (req) => {
      req.reply({fixture: 'login_stubs/brokerages.json'})
    }).as('connect')

    cy.fixture('betatestDomain').as('login')
      cy.get('@login').then(domain => {
      cy.visit((domain.test).concat('/login')) })
      cy.fixture('my_credentials').as('userFixture')
      cy.get('@userFixture').then(user => {
      cy.get('[name=email]').first().type(user.username)
      cy.get('[placeholder=Password]').type(user.password)
  
      })
  
  // Verify the sign in button is enabled//
    cy.get('[data-cy=login-button]').should('not.be.disabled')
  .click({multiple:true})
      
      cy.get('div').contains('Settings').click().wait(8000)
      cy.get('button').contains('Add').first().click().wait(5000)
      cy.get('div').contains('Alpaca').click()


      cy.wait('@connect')
      .its('response.statusCode').should('eq', 200)
  })

  it('Add Wealthica', () => {
    cy.get('div').contains('Settings').click().wait(8000)
    cy.get('button').contains('Add').first().click().wait(5000)
    cy.get('div').contains('Wealthica').click()
    cy.get('button').contains('Connect').click()

    cy.wait('@connect')
    .its('response.statusCode').should('eq', 200)

 })

  it('Add Questrade', () => {
  
      cy.get('div').contains('Settings').click().wait(8000)
      cy.get('button').contains('Add').first().click().wait(5000)
      cy.get('div').contains('Questrade').click()

      cy.wait('@connect')
      .its('response.statusCode').should('eq', 200)

    })

  it('Add IBKR', () => {

      cy.get('div').contains('Settings').click().wait(8000)
      cy.get('button').contains('Add').first().click().wait(5000)
      cy.get('div').contains('IBKR').click()

      cy.wait('@connect')
      .its('response.statusCode').should('eq', 200)

    })

  it('Add Tradier', () => {
      cy.get('div').contains('Settings').click().wait(8000)
      cy.get('button').contains('Add').first().click().wait(5000)
      cy.get('div').contains('Tradier').click()

      cy.wait('@connect')
      .its('response.statusCode').should('eq', 200)

    })

  it('Add TD Ameritrade', () => {
      cy.get('div').contains('Settings').click().wait(8000)
      cy.get('button').contains('Add').first().click().wait(5000)
      cy.get('div').contains('TD Ameritrade').click()

      cy.wait('@connect')
      .its('response.statusCode').should('eq', 200)

    })

  })
