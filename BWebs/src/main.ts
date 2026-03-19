document.querySelector<HTMLElement>('#year')!.textContent = new Date().getFullYear().toString()
document.body.classList.add('js-ready')

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

// Scroll polish: update slim progress bar and logo signal intensity by current section.
const progressBar = document.querySelector<HTMLElement>('#scroll-progress-bar')
const neonSignal = document.querySelector<HTMLElement>('#neon-signal')
const trackedSections = ['hero', 'about', 'services', 'contact']
  .map((id) => document.getElementById(id))
  .filter((section): section is HTMLElement => section instanceof HTMLElement)

if (progressBar && neonSignal && trackedSections.length > 0) {
  let scrollRafId: number | null = null

  const refreshScrollUI = () => {
    const first = trackedSections[0]
    const last = trackedSections[trackedSections.length - 1]
    const viewportHeight = window.innerHeight
    const start = first.offsetTop
    const end = last.offsetTop + last.offsetHeight - viewportHeight
    const range = Math.max(1, end - start)
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / range))

    progressBar.style.width = `${(progress * 100).toFixed(2)}%`

    const probePoint = window.scrollY + viewportHeight * 0.38
    let activeSectionId = trackedSections[0].id

    for (const section of trackedSections) {
      if (probePoint >= section.offsetTop) {
        activeSectionId = section.id
      }
    }

    if (activeSectionId === 'contact') {
      neonSignal.dataset.strength = 'strong'
    } else if (activeSectionId === 'about' || activeSectionId === 'services') {
      neonSignal.dataset.strength = 'medium'
    } else {
      neonSignal.dataset.strength = 'soft'
    }

    scrollRafId = null
  }

  const scheduleScrollUI = () => {
    if (scrollRafId !== null) {
      return
    }

    scrollRafId = window.requestAnimationFrame(refreshScrollUI)
  }

  window.addEventListener('scroll', scheduleScrollUI, { passive: true })
  window.addEventListener('resize', scheduleScrollUI)
  scheduleScrollUI()
}

// Reveal sections as they enter the viewport for subtle scroll polish.
const revealItems = document.querySelectorAll<HTMLElement>('.reveal')

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue
        }

        entry.target.classList.add('reveal-in')
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  )

  for (const item of revealItems) {
    if (item.classList.contains('reveal-in')) {
      continue
    }

    revealObserver.observe(item)
  }
} else {
  for (const item of revealItems) {
    item.classList.add('reveal-in')
  }
}

// Cursor micro-interaction on hero heading and floating orbs.
const heroSection = document.querySelector<HTMLElement>('#hero')
const heroTitle = document.querySelector<HTMLElement>('.hero-title')
const heroOrbs = document.querySelectorAll<HTMLElement>('.hero-orb')

if (heroSection && heroTitle && heroOrbs.length > 0) {
  heroSection.classList.add('is-interactive')

  let rafId: number | null = null
  let pointerX = 0
  let pointerY = 0

  const updateHeroMotion = () => {
    const titleX = pointerX * 8
    const titleY = pointerY * 8

    heroTitle.style.transform = `translate3d(${titleX}px, ${titleY}px, 0)`

    heroOrbs.forEach((orb, index) => {
      const speed = index === 0 ? 16 : 10
      orb.style.transform = `translate3d(${pointerX * speed}px, ${pointerY * speed}px, 0)`
    })

    rafId = null
  }

  heroSection.addEventListener('pointermove', (event) => {
    const rect = heroSection.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    pointerX = x
    pointerY = y

    if (rafId !== null) {
      return
    }

    rafId = window.requestAnimationFrame(updateHeroMotion)
  })

  heroSection.addEventListener('pointerleave', () => {
    pointerX = 0
    pointerY = 0
    if (rafId !== null) {
      return
    }

    rafId = window.requestAnimationFrame(updateHeroMotion)
  })
}

// Mobile-friendly press feedback on service cards.
const cards = document.querySelectorAll<HTMLElement>('.svc-card')
for (const card of cards) {
  card.addEventListener('pointerdown', () => {
    card.classList.add('is-tapped')
  })

  const clearTapState = () => {
    card.classList.remove('is-tapped')
  }

  card.addEventListener('pointerup', clearTapState)
  card.addEventListener('pointercancel', clearTapState)
  card.addEventListener('pointerleave', clearTapState)
  card.addEventListener('blur', clearTapState)
}

// Lightweight validation animation for contact form fields.
const contactForm = document.querySelector<HTMLFormElement>('#contact-form')

if (contactForm) {
  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value)

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const fields = Array.from(contactForm.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.form-input'))
    let hasError = false

    for (const field of fields) {
      const trimmedValue = field.value.trim()
      const errorText = field.parentElement?.querySelector<HTMLElement>('.form-error')
      const emailFieldInvalid = field instanceof HTMLInputElement && field.type === 'email' && !isValidEmail(trimmedValue)
      const isInvalid = !trimmedValue || emailFieldInvalid

      field.classList.remove('input-invalid')

      if (isInvalid) {
        hasError = true
        field.classList.add('input-invalid')
        errorText?.classList.remove('hidden')
      } else {
        errorText?.classList.add('hidden')
      }
    }

    if (hasError) {
      const firstInvalidField = contactForm.querySelector<HTMLInputElement | HTMLTextAreaElement>('.input-invalid')
      firstInvalidField?.focus()
      return
    }

    contactForm.reset()
  })

  contactForm.addEventListener('input', (event) => {
    const target = event.target

    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
      return
    }

    if (!target.classList.contains('form-input')) {
      return
    }

    target.classList.remove('input-invalid')
    const errorText = target.parentElement?.querySelector<HTMLElement>('.form-error')
    errorText?.classList.add('hidden')
  })
}
