import { graphql } from 'gatsby';

export const europe2Fields = graphql`
  fragment europe2Fields on Europe2Json {
      location
      population
      data {
        total_deaths 
        date
      }
    }    
`

export const europe1Fields = graphql`
  fragment europe1Fields on Europe1Json {
      location
      population
      data {
        total_deaths 
        date
      }
    }    
`

export const northAmerica2Fields = graphql`
  fragment northAmerica2Fields on NorthAmerica2Json {
      location
      population
      data {
        total_deaths 
        date
      }
    }    
`