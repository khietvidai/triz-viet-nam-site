
const dictionaries = {
    en: () => import('../dictionaries/en.json').then((module) => module.default),
    vi: () => import('../dictionaries/vi.json').then((module) => module.default),
}

export const getDictionary = async (locale: 'en' | 'vi') => {
    // @ts-ignore
    if (!dictionaries[locale]) {
        return dictionaries['en']()
    }
    // @ts-ignore
    return dictionaries[locale]()
}
