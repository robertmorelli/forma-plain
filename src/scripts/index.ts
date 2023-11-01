Main: {
    const ui = {};
    FormBinding: {
        const uiForm = (document.forms as HTMLCollectionOf<HTMLFormElement> & { ui: HTMLFormElement }).ui;
        uiForm.addEventListener(`change`, () =>
            window.location.hash = `#${btoa(JSON.stringify(Object.assign(ui,
                Object.fromEntries((new FormData(uiForm)).entries())
            )))}`
        );
        Object.defineProperties(ui,
            Object.fromEntries(Array.from((new FormData(uiForm)).keys())
                .map(key => [
                    key, {
                        get: () => (new FormData(uiForm)).get(key),
                        set: (value: string) => {
                            window.location.hash = btoa(JSON.stringify(ui));
                            const radio = document.querySelector(`[type="radio"][name="${key}"][value="${value}"]`);
                            const check = document.querySelector(`[type="checkbox"][name="${key}"]`);
                            if (radio ?? check) return ((radio ?? check) as HTMLInputElement).click();
                            document.querySelector(`[name="${key}"]`)?.setAttribute(`value`, value);
                        }, enumerable: true
                    }
                ]))
        );
        try {
            Object.assign(ui, JSON.parse(atob(window.location.hash.slice(1))));
        } catch {
            window.location.hash = `#`;
        };
    }
    const fileReader = {};
    fileWorker: {
        const callbacks: Map<string, Function> = new Map();
        const worker = new Worker(`scripts/fileWorker.js`);
        Object.freeze(
            Object.seal(
                Object.defineProperty(worker, 'onmessage', ({ data }: { data: Map<string, string> }) => {
                    const [name, text] = data.entries().next().value;
                    const callback: Function | undefined = callbacks.get(name);
                    if (callback === undefined) return;
                    callback(text);
                    callbacks.delete(name);
                })
            )
        );
        Object.freeze(
            Object.seal(
                Object.defineProperty(fileReader, `svg`, (callback: Function) =>
                    window.showOpenFilePicker({
                        multiple: false,
                        types: [{
                            description: `SVG Files`,
                            accept: { 'image/svg+xml': [`.svg`] }
                        }]
                    }).then((files: FileSystemFileHandle[]) => {
                        const fileMaybe: FileSystemFileHandle | undefined = files.pop();
                        if (fileMaybe === undefined) return;
                        callbacks.set(fileMaybe.name, callback);
                        const file: FileSystemFileHandle = fileMaybe;
                        worker.postMessage(file);
                    })
                )
            )
        );
    }
}

