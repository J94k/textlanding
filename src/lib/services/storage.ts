export const add = (k: string, v: any): void => {
  localStorage.setItem(k, JSON.stringify(v))
}

export const get = (k: string): any | void => {
  try {
    const v = localStorage.getItem(k)

    if (v) return JSON.parse(v)
  } catch (error) {
    console.group('%c getting data from storage', 'color: red')
    console.error(error)
    console.groupEnd()
  }
}

export const remove = (k: string): void => {
  localStorage.removeItem(k)
}
