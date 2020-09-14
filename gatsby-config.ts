module.exports = {
  siteMetadata: {
    title: `Choose Your COVID-19 Narrative`,
    description: `To show how true data can be selectively shared to "prove" a given narrative.`,
    author: `bucko`,
    menu: [
      { name: "About", path: "/#" },
      { name: "Data Sources", path: "/#data" },
      { name: "FAQ", path: "/faq" },
      { name: "Acknowledgements", path: "/#acknowledgements" },
    ],
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `owid`,
        path: `${__dirname}/src/owid`,
      },
    },
    `gatsby-transformer-json`,
    `gatsby-transformer-sharp`,
    `gatsby-theme-material-ui`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-sass`,
    `source-state-data`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/threekindsoflies-icon.jpg`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    `gatsby-plugin-offline`,
    `gatsby-plugin-typescript`,
    `gatsby-plugin-sass`,
  ],
}
