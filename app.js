class App {
  constructor(selectors) {
    this.flicks = {}
    this.max = 0

    this.template = document
      .querySelector(selectors.templateSelector)

    this.listen(selectors)
    this.setupLists(selectors.listSelector)
    this.load()
  }

  setupLists(listSelector) {
    this.lists = {}
    const genres = ['comedy', 'drama', 'sci-fi']
    genres.map(genre => {
      this.lists[genre] = document.querySelector(`#${genre} ${listSelector}`)
    })
  }

  listen(selectors) {
    document
      .querySelector(selectors.formSelector)
      .addEventListener('submit', this.addFlickViaForm.bind(this))
    document
      .querySelector(selectors.searchSelector)
      .addEventListener('keyup', this.search.bind(this))
  }

  search(ev) {
    const q = ev.currentTarget.value
    const prevMatches = Array.from(document.querySelectorAll('.flick-name strong'))
    this.removeElements(prevMatches)

    Array.from(document.querySelectorAll('.flick')).map(listItem => {
      const nameField = listItem.querySelector('.flick-name')
      const pattern = new RegExp(q, 'gi')
      if (nameField.textContent.match(pattern)) {
        listItem.classList.remove('hide')
        nameField.innerHTML = nameField.innerHTML.replace(pattern, '<strong>$&</strong>')
      } else {
        listItem.classList.add('hide')
      }
    })
  }

  removeElements(elementArr) {
    elementArr.map(el => {
      const parent = el.parentNode
      while(el.firstChild) {
        parent.insertBefore(el.firstChild, el)
      }
      el.remove()
    })
  }

  load() {
    // Get the JSON string out of localStorage
    const flicksJSON = localStorage.getItem('flicks')

    // Turn that into an array
    const flicksArray = JSON.parse(flicksJSON)

    // Set this.flicks to that array
    if (flicksArray) {
      flicksArray
        .reverse()
        .map(this.addFlick.bind(this))
    }
  }

  addFlick(flick) {
    const listItem = this.renderListItem(flick)
    this.lists[flick.genre]
      .insertBefore(listItem, this.lists[flick.genre].firstChild)
    
    if (flick.id > this.max) {
      this.max = flick.id
    }

    if (!this.flicks[flick.genre]) {
      this.flicks[flick.genre] = []
    }

    this.flicks[flick.genre].unshift(flick)
    this.save()
  }

  addFlickViaForm(ev) {
    ev.preventDefault()
    const f = ev.target
    const flick = {
      id: this.max + 1,
      name: f.flickName.value,
      fav: false,
      genre: ev.target.genre.value,
    }

    this.addFlick(flick)

    f.reset()
    ev.target.flickName.focus()
  }

  save() {
    localStorage
      .setItem('flicks', JSON.stringify(Object.keys(this.flicks).reduce((combined, genre) => {
        return combined.concat(this.flicks[genre])
      }, [])))
  }

  renderListItem(flick) {
    const item = this.template.cloneNode(true)
    item.classList.remove('template')
    item.dataset.id = flick.id
    item
      .querySelector('.flick-name')
      .textContent = flick.name
    item
      .querySelector('.flick-name')
      .setAttribute('title', flick.name)

    if (flick.fav) {
      item.classList.add('fav')
    }

    item
      .querySelector('.flick-name')
      .addEventListener('keypress', this.saveOnEnter.bind(this, flick))

    item
      .querySelector('button.remove')
      .addEventListener('click', this.removeFlick.bind(this, flick))
    item
      .querySelector('button.fav')
      .addEventListener('click', this.favFlick.bind(this, flick))
    item
      .querySelector('button.move-up')
      .addEventListener('click', this.moveUp.bind(this, flick))
    item
      .querySelector('button.move-down')
      .addEventListener('click', this.moveDown.bind(this, flick))
    item
      .querySelector('button.edit')
      .addEventListener('click', this.edit.bind(this, flick))

    return item
  }

  removeFlick(flick, ev) {
    const listItem = ev.target.closest('.flick')
    const flickArr = this.flicks[flick.genre]

    // Find the flick in the array, and remove it
    for (let i = 0; i < flickArr.length; i++) {
      const currentId = flickArr[i].id.toString()
      if (listItem.dataset.id === currentId) {
        flickArr.splice(i, 1)
        break
      }
    }

    listItem.remove()
    this.save()
  }

  favFlick(flick, ev) {
    const listItem = ev.target.closest('.flick')
    flick.fav = !flick.fav

    if (flick.fav) {
      listItem.classList.add('fav')
    } else {
      listItem.classList.remove('fav')
    }
    
    this.save()
  }

  moveUp(flick, ev) {
    const listItem = ev.target.closest('.flick')
    const flickArr = this.flicks[flick.genre]

    const index = flickArr.findIndex((currentFlick, i) => {
      return currentFlick.id === flick.id
    })

    if (index > 0) {
      this.lists[flick.genre].insertBefore(listItem, listItem.previousElementSibling)

      const previousFlick = flickArr[index - 1]
      flickArr[index - 1] = flick
      flickArr[index] = previousFlick
      this.save()
    }
  }

  moveDown(flick, ev) {
    const listItem = ev.target.closest('.flick')
    const flickArr = this.flicks[flick.genre]

    const index = flickArr.findIndex((currentFlick, i) => {
      return currentFlick.id === flick.id
    })

    if (index < flickArr.length - 1) {
      this.lists[flick.genre].insertBefore(listItem.nextElementSibling, listItem)
      
      const nextFlick = flickArr[index + 1]
      flickArr[index + 1] = flick
      flickArr[index] =  nextFlick
      this.save()
    }
  }

  edit(flick, ev) {
    const listItem = ev.target.closest('.flick')
    const nameField = listItem.querySelector('.flick-name')
    const btn = listItem.querySelector('.edit.button')

    const icon = btn.querySelector('i.fa')

    if (nameField.isContentEditable) {
      // make it no longer editable
      nameField.contentEditable = false
      icon.classList.remove('fa-check')
      icon.classList.add('fa-pencil')
      btn.classList.remove('success')

      // save changes
      flick.name = nameField.textContent
      this.save()
    } else {
      nameField.contentEditable = true
      nameField.focus()
      icon.classList.remove('fa-pencil')
      icon.classList.add('fa-check')
      btn.classList.add('success')
    }
  }

  saveOnEnter(flick, ev) {
    if (ev.key === 'Enter') {
      this.edit(flick, ev)
    }
  }
}

const app = new App({
  formSelector: '#flick-form',
  listSelector: '.flick-list',
  templateSelector: '.flick.template',
  searchSelector: '.search input',
})

$(document).foundation()
