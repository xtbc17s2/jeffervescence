const app = {
  init(selectors) {
    this.flicks = []
    this.max = 0
    this.list = document.querySelector(selectors.listSelector)
    document
      .querySelector(selectors.formSelector)
      .addEventListener('submit', this.addFlick.bind(this))
  },

  addFlick(ev) {
    ev.preventDefault()
    const f = ev.target
    const flick = {
      id: this.max + 1,
      name: f.flickName.value,
    }

    this.flicks.unshift(flick)

    const listItem = this.renderListItem(flick)
    // this.list.appendChild(listItem)
    this.list
      .insertBefore(listItem, this.list.firstChild)

    ++ this.max
    f.reset()
  },

  renderListItem(flick) {
    const item = document.createElement('li')
    item.textContent = flick.name
    item.dataset.id = flick.id
    return item
  },
}

app.init({
  formSelector: '#flick-form',
  listSelector: '#flick-list'
})