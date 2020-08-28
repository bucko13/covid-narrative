
const crypto = require('crypto');
const stateToCode = require('../../src/states/stateToCode.json');
const stateToFips = require('../../src/data/stateToFips.json');

exports.sourceNodes = async ({ actions }) => {
  const { createNode } = actions;
  
  const populations = require('../../src/states/populations.json')
  // make nodes for graphql, add state code/abbreviation
  Object.keys(populations).map(name => {
    const state = populations[name];
    const newState = {}
    for (let key in state) {
      const formatted = key
        .split(" ")
        .map(word => word.toLowerCase())
        .join("-");
      newState[formatted] = state[key];
    }
  
    newState.code = stateToCode[newState.state];
    if (newState.code) newState.code = newState.code.toLowerCase();
    newState.fips = stateToFips[newState.state];
    createNode({
      ...newState,
      id: newState['id-state'],
      parent: null, // or null if it's a source node without a parent
      children: [],
      internal: {
        type: `StatePopulations`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(newState))
          .digest(`hex`),
        content: JSON.stringify(newState), // optional
        description: `State populations`, // optional
      },
    })
  })

  return;
}