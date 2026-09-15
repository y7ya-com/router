// jsdom has no layout and throws "Not implemented" for scrollTo, which the
// router's scroll restoration calls on every navigation.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {}
}
