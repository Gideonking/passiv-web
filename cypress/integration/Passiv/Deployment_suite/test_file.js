describe('Reset and build portfolio manually', () => { 
  it('Login test 2', () => {
    cy.fixture('testDomain').as('login')
    cy.get('@login').then(domain => {
    cy.visit((domain.test).concat('/login')) })
    cy.fixture('credentials').as('userFixture')
    cy.get('@userFixture').then(user => {
    cy.get('[name=email]').first().type(user.username)
    cy.get('[placeholder=Password]').type(user.password)

    })

// Verify the sign in button is enabled//
cy.get('[data-cy=login-button]').should('not.be.disabled')
.click({multiple:true})

    })

  it('Change name', () => {
      cy.get('div').contains('Settings').click().wait(8000)
      cy.get('button').contains('Edit').first().click()
      cy.get('input').clear().type('tesla').type('{enter}')
  
  })

  // it('Change email', () => {
  //     cy.get('button').contains('Edit').first().next('button').click()
  //     cy.get('input').contains('[placeholder=Your email]')
  //     cy.type('asutherland8219@hotmail.com').type('{enter}')
      
  // })

  // it('Change email back', () => {
  //     cy.get('button').contains('Edit').first().next('button').click()
  //     cy.get('input').contains('[placeholder=Your email]')
  //     cy.type('asutherland8219@gmail.com').type('{enter}')
      
  // })

})
