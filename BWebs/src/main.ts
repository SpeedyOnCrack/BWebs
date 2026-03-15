import './style.css'

document.querySelector<HTMLElement>('#year')!.textContent = new Date().getFullYear().toString()

const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')

for (const link of links) {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href')
    if (!hash || hash.length < 2) {
      return
    }

    const target = document.querySelector<HTMLElement>(hash)
    if (!target) {
      return
    }

    event.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
