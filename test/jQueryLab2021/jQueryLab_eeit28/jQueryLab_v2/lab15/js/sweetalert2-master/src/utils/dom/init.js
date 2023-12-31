import { swalClasses } from '../classes.js'
import { getContainer, getPopup, getContent } from './getters.js'
import { addClass, removeClass, getChildByClass, setInnerHtml } from './domUtils.js'
import { isNodeEnv } from '../isNodeEnv.js'
import { error } from '../utils.js'
import sweetAlert from '../../sweetalert2.js'

const sweetHTML = `
 <div aria-labelledby="${swalClasses.title}" aria-describedby="${swalClasses.content}" class="${swalClasses.popup}" tabindex="-1">
   <div class="${swalClasses.header}">
     <ul class="${swalClasses['progress-steps']}"></ul>
     <div class="${swalClasses.icon}"></div>
     <img class="${swalClasses.image}" />
     <h2 class="${swalClasses.title}" id="${swalClasses.title}"></h2>
     <button type="button" class="${swalClasses.close}"></button>
   </div>
   <div class="${swalClasses.content}">
     <div id="${swalClasses.content}" class="${swalClasses['html-container']}"></div>
     <input class="${swalClasses.input}" />
     <input type="file" class="${swalClasses.file}" />
     <div class="${swalClasses.range}">
       <input type="range" />
       <output></output>
     </div>
     <select class="${swalClasses.select}"></select>
     <div class="${swalClasses.radio}"></div>
     <label for="${swalClasses.checkbox}" class="${swalClasses.checkbox}">
       <input type="checkbox" />
       <span class="${swalClasses.label}"></span>
     </label>
     <textarea class="${swalClasses.textarea}"></textarea>
     <div class="${swalClasses['validation-message']}" id="${swalClasses['validation-message']}"></div>
   </div>
   <div class="${swalClasses.actions}">
     <div class="${swalClasses.loader}"></div>
     <button type="button" class="${swalClasses.confirm}"></button>
     <button type="button" class="${swalClasses.deny}"></button>
     <button type="button" class="${swalClasses.cancel}"></button>
   </div>
   <div class="${swalClasses.footer}"></div>
   <div class="${swalClasses['timer-progress-bar-container']}">
     <div class="${swalClasses['timer-progress-bar']}"></div>
   </div>
 </div>
`.replace(/(^|\n)\s*/g, '')

const resetOldContainer = () => {
  const oldContainer = getContainer()
  if (!oldContainer) {
    return false
  }

  oldContainer.remove()
  removeClass(
    [document.documentElement, document.body],
    [
      swalClasses['no-backdrop'],
      swalClasses['toast-shown'],
      swalClasses['has-column']
    ]
  )

  return true
}

const resetValidationMessage = () => {
  if (sweetAlert.isVisible()) {
    sweetAlert.resetValidationMessage()
  }
}

const addInputChangeListeners = () => {
  const content = getContent()

  const input = getChildByClass(content, swalClasses.input)
  const file = getChildByClass(content, swalClasses.file)
  const range = content.querySelector(`.${swalClasses.range} input`)
  const rangeOutput = content.querySelector(`.${swalClasses.range} output`)
  const select = getChildByClass(content, swalClasses.select)
  const checkbox = content.querySelector(`.${swalClasses.checkbox} input`)
  const textarea = getChildByClass(content, swalClasses.textarea)

  input.oninput = resetValidationMessage
  file.onchange = resetValidationMessage
  select.onchange = resetValidationMessage
  checkbox.onchange = resetValidationMessage
  textarea.oninput = resetValidationMessage

  range.oninput = () => {
    resetValidationMessage()
    rangeOutput.value = range.value
  }

  range.onchange = () => {
    resetValidationMessage()
    range.nextSibling.value = range.value
  }
}

const getTarget = (target) => typeof target === 'string' ? document.querySelector(target) : target

const setupAccessibility = (params) => {
  const popup = getPopup()

  popup.setAttribute('role', params.toast ? 'alert' : 'dialog')
  popup.setAttribute('aria-live', params.toast ? 'polite' : 'assertive')
  if (!params.toast) {
    popup.setAttribute('aria-modal', 'true')
  }
}

const setupRTL = (targetElement) => {
  if (window.getComputedStyle(targetElement).direction === 'rtl') {
    addClass(getContainer(), swalClasses.rtl)
  }
}

/*
 * Add modal + backdrop to DOM
 */
export const init = (params) => {
  // Clean up the old popup container if it exists
  const oldContainerExisted = resetOldContainer()

  /* istanbul ignore if */
  if (isNodeEnv()) {
    error('SweetAlert2 requires document to initialize')
    return
  }

  const container = document.createElement('div')
  container.className = swalClasses.container
  if (oldContainerExisted) {
    addClass(container, swalClasses['no-transition'])
  }
  setInnerHtml(container, sweetHTML)

  const targetElement = getTarget(params.target)
  targetElement.appendChild(container)

  setupAccessibility(params)
  setupRTL(targetElement)
  addInputChangeListeners()
}
