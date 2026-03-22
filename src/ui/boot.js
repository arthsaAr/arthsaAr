const lines = [
  'SYSTEM INITIALIZING...',
  'LOADING RESIDENT PROFILE: RAASHTRA KC',
  'IDENTITY VERIFIED',
  'BUILDING ACCESS GRANTED',
]

export function startBoot(onComplete) {
  const textEl = document.getElementById('boot-text')
  const btnEl = document.getElementById('enter-btn')
  const bootEl = document.getElementById('boot')
  let current = 0

  function showNextLine() {
    if (current >= lines.length) {
      startLoadingBar()
      return
    }
    textEl.textContent += lines[current] + '\n'
    current++
    setTimeout(showNextLine, 350)
  }

  function startLoadingBar() {
    let progress = 0
    const barEl = document.createElement('div')
    const barFill = document.createElement('div')
    const percent = document.createElement('div')

    barEl.style.cssText = `
      width: 560px;
      height: 8px;
      background: rgba(255,255,255,0.1);
      margin: 24px auto 0;
      border-radius: 2px;
      overflow: hidden;
    `
    barFill.style.cssText = `
      height: 100%;
      width: 0%;
      background: rgba(255,255,255,0.8);
      transition: width 0.05s linear;
      border-radius: 2px;
    `
    percent.style.cssText = `
      font-family: 'JetBrains Mono', monospace;
      font-size: 24px;
      color: rgba(255,255,255,0.4);
      text-align: center;
      margin-top: 12px;
      letter-spacing: 2px;
    `

    barEl.appendChild(barFill)
    textEl.appendChild(barEl)
    textEl.appendChild(percent)

    const interval = setInterval(() => {
      progress += Math.random() * 4 + 1
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        barFill.style.width = '100%'
        percent.textContent = '100%'
        setTimeout(showWelcome, 400)
      }
      barFill.style.width = progress + '%'
      percent.textContent = Math.floor(progress) + '%'
    }, 60)
  }

  function showWelcome() {
    textEl.textContent = ''
    const welcome = document.createElement('div')
    welcome.textContent = 'WELCOME, VISITOR.'
    welcome.style.cssText = `
      font-family: 'JetBrains Mono', monospace;
      font-size: 26px;
      letter-spacing: 4px;
      color: rgba(255,255,255,0.9);
      opacity: 0;
      transition: opacity 1s ease;
    `
    textEl.appendChild(welcome)
    setTimeout(() => welcome.style.opacity = '1', 50)

    setTimeout(() => {
      textEl.style.transition = 'opacity 1s ease'
      textEl.style.opacity = '0'
      setTimeout(() => {
        textEl.style.display = 'none'
        btnEl.style.display = 'block'
        setTimeout(() => btnEl.style.opacity = '1', 50)
      }, 1000)
    }, 2000)

    btnEl.addEventListener('click', () => {
      bootEl.style.transition = 'opacity 1s ease'
      bootEl.style.opacity = '0'
      setTimeout(onComplete, 1000)
    })
  }

  showNextLine()
}