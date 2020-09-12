/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it
exports.onRouteUpdate = ({ location }) => scrollToAnchor(location)

/**
 *
 * @desc - a function to jump to the correct scroll position
 * @param {Object} location -
 * @param {Number} [mainNavHeight] - the height of any persistent nav -> document.querySelector(`nav`)
 */
function scrollToAnchor(location, mainNavHeight = 0) {
  // Check for location so build does not fail
  if (location && location.hash) {
    setTimeout(() => {
        const hash = location.hash.replace(/^#(\d)/, '#\\3$1');
        let item = document.querySelector(`${hash}`)
        if (item) {
          item = item.offsetTop
          window.scrollTo({
            top: item - mainNavHeight - 200,
            behavior: "smooth",
          })
        }
      },
      0
    )
  }

  return true
}