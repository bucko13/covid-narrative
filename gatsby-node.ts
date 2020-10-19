/* tslint:disable no-console */
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
import { GatsbyNode } from 'gatsby';

import { getGovResponseData, updateOwidData } from './src/utils/getData';

export const onPreInit: GatsbyNode['onPreInit'] = async () => {
  // this will rebuild the data if env var is set or if no data present
  if (process.env.RELOAD_OWID_DATA) {
    console.log('Checking OWID data...')
    await updateOwidData();
    console.log("Checking Government Response Data...")
    await getGovResponseData()
  }
}