export const sessionAdapter = {
    getItem: (key: string) => {
        if (typeof window === 'undefined') return null
        try {
            return window.sessionStorage.getItem(key)
        } catch (e) {
            return null
        }
    },
    setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return
        try {
            window.sessionStorage.setItem(key, value)
        } catch (e) {
            // Ignore quota errors etc
        }
    },
    removeItem: (key: string) => {
        if (typeof window === 'undefined') return
        try {
            window.sessionStorage.removeItem(key)
        } catch (e) {
            // Ignore
        }
    },
}
