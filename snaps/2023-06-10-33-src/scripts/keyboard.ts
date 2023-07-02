{
    const shiftmap: Record<string, string> = {
        "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^",
        "7": "&", "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", "[": "{",
        "]": "}", "\\": "|", "'": "\"", ";": ":", ",": "<", ".": ">", "/": "?",
    };
    const key = { to: NaN, stack: ``, set: new Set(Object.keys(shiftmap).concat(Object.values(shiftmap))) };
    document.addEventListener(`keydown`, event => {
        clearTimeout(key.to);
        const eles = new Map<string, HTMLLabelElement>();
        for (const ele of Array.from(document.querySelectorAll<HTMLLabelElement>(`label.clickable`)))
            if (window.getComputedStyle(ele).display != `none`) eles.set(`${ele.textContent}`, ele);
        key.stack = (key.set.has(event.key)) ? (key.stack + (shiftmap[event.key] ?? event.key)) : ``;
        key.stack = (key.stack.length > 3) ? key.stack.slice(-3) : key.stack;
        if (eles.has(key.stack)) key.to = setTimeout(() => (eles.get(key.stack)?.click(), key.stack = ``), 0);
        else key.to = setTimeout(() => (key.stack = ``), 500);
    });
}
