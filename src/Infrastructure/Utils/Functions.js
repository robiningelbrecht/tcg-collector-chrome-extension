export const camelize = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

export const contains = (selector, text) => {
    return [...document.querySelectorAll(selector)].filter(element => element.childNodes?.[0]?.nodeValue?.match(text))
}

export const toValidCssClassName = (string) => {
    return string.trim()
        .replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '')
        .replace(/\s/g, '-')
        .toLowerCase();
}

export const loadAppState = () => {
    const bodyHtml = document.body.innerHTML;
    const regex = /window.tcgcollector[\s]*=[\s]*{[\s]*appState:(.*),[\s]*}/mi;
    if (!regex.test(bodyHtml)) {
        throw new Error('AppState could not be determined');
    }

    return JSON.parse(bodyHtml.match(regex)[1]);
}