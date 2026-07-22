import Keycloak from 'keycloak-js';


const keycloak = new Keycloak({
  url: 'https://auth.cernikiw3.chickenkiller.com/', 
  realm: 'edu-spring-realm-dev',
  clientId: 'edu-spring-client'
});

export default keycloak;